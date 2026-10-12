"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    CapsuleCollider,
    RigidBody,
    useBeforePhysicsStep,
    useAfterPhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import Player from "./Player";
import {
    createJumpState,
    isAirborne,
    stepJump,
    stopPlayerMotion,
    JUMP_VELOCITY,
} from "./playerJump";
import {
    ALL_SEATS,
    BAR_SEATS,
    PLAYER_SEATS,
    PLAYER_SCALE,
    PLAYER_HEIGHT,
    findSeat,
    seatPose,
    seatExit,
} from "./playerSeats";
import { usePeerStore } from "@/hooks/usePeerStore";
import {
    capturePlayerPointer,
    usePlayerControllerStore,
} from "@/hooks/usePlayerControllerStore";

const isTyping = (target) =>
    target?.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target?.tagName);

export default function PlayerController({ multiplayer = false }) {
    const { camera, gl } = useThree();
    const { rapier, world } = useRapier();
    const body = useRef(null);
    const initialPosition = useMemo(
        () => [...usePlayerControllerStore.getState().pose.position],
        [],
    );
    const locomotion = useRef("idle");
    const enabled = usePlayerControllerStore((s) => s.enabled);
    const thirdPerson = usePlayerControllerStore((s) => s.thirdPerson);
    const pose = usePlayerControllerStore((s) => s.pose);
    const self = usePeerStore((s) => s.players[s.selfId]);
    const keys = useRef(new Set());
    const look = useRef({ yaw: 0, pitch: -0.18 });
    const sent = useRef(0);
    const direction = useRef(new Vector3());
    const previousEnabled = useRef(false);
    const jump = useRef(createJumpState());
    const jumpRequested = useRef(false);

    const onAnimationFinished = useCallback((clip) => {
        if (clip === "Jump_Start" && jump.current.phase === "jumpStart") {
            jump.current.phase = "jumpLoop";
            jump.current.phaseTime = 0;
        } else if (clip === "Jump_Land" && jump.current.phase === "jumpLand") {
            jump.current.phase = null;
            jump.current.phaseTime = 0;
        }
    }, []);

    // Only seat changes teleport the local controller; echoed movement must not
    // rewind locally predicted motion while a guest is waiting on the host.
    const seatId = multiplayer ? self?.pose.seated : pose.seated;
    const selfId = self?.id;
    useEffect(() => {
        jump.current = createJumpState();
        jumpRequested.current = false;
        const initial = multiplayer
            ? (usePeerStore.getState().players[selfId]?.pose ??
              seatPose(PLAYER_SEATS[0]))
            : usePlayerControllerStore.getState().pose;
        usePlayerControllerStore.setState({
            pose: { ...initial, position: [...initial.position] },
            hint: "E: sit / stand · V: camera",
        });
        look.current = { yaw: initial.rotation - Math.PI, pitch: -0.18 };
        // Seating is an intentional teleport. Disable the capsule while seated
        // so the chair cannot push the seated avatar out of its assigned spot.
        if (body.current) {
            body.current.setEnabled(!initial.seated);
            body.current.setTranslation(
                {
                    x: initial.position[0],
                    y: initial.position[1],
                    z: initial.position[2],
                },
                true,
            );
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
        if (initial.seated) {
            if (document.pointerLockElement === gl.domElement)
                document.exitPointerLock();
        }
    }, [multiplayer, selfId, seatId, gl]);

    useEffect(() => {
        if (!enabled) {
            const current = usePlayerControllerStore.getState().pose;
            const stopped = stopPlayerMotion(current);
            jump.current = createJumpState();
            jumpRequested.current = false;
            usePlayerControllerStore.setState({ pose: stopped });
            if (multiplayer) usePeerStore.getState().updatePose(stopped);
            keys.current.clear();
        }
    }, [enabled, multiplayer]);

    useEffect(() => {
        usePlayerControllerStore.setState({ canvas: gl.domElement });
        const release = () => {
            keys.current.clear();
            jumpRequested.current = false;
        };
        const visibility = () => {
            if (!document.hidden) return;
            // Clear input on backgrounding; preserve physical height, including
            // when standing on furniture. Gravity resumes with the simulation.
            release();
            jump.current = createJumpState();
            const stopped = stopPlayerMotion(
                usePlayerControllerStore.getState().pose,
            );
            usePlayerControllerStore.setState({ pose: stopped });
            if (multiplayer) usePeerStore.getState().updatePose(stopped);
        };
        const mouse = (event) => {
            if (!usePlayerControllerStore.getState().enabled) return;
            const seated = usePlayerControllerStore.getState().pose.seated;
            if (
                document.pointerLockElement !== gl.domElement &&
                !(
                    seated &&
                    event.buttons === 2 &&
                    event.target === gl.domElement
                )
            )
                return;
            look.current.yaw -= event.movementX * 0.002;
            look.current.pitch = Math.max(
                -1.15,
                Math.min(1.15, look.current.pitch - event.movementY * 0.002),
            );
        };
        const click = () => capturePlayerPointer();
        const context = (event) => {
            if (usePlayerControllerStore.getState().enabled)
                event.preventDefault();
        };
        const wheel = (event) => {
            const control = usePlayerControllerStore.getState();
            if (
                !control.enabled ||
                !control.thirdPerson ||
                event.ctrlKey ||
                event.metaKey
            )
                return;
            // Seated/unlocked players can still scroll menus without zooming.
            if (
                document.pointerLockElement !== gl.domElement &&
                event.target !== gl.domElement
            )
                return;
            event.preventDefault();
            const unit =
                event.deltaMode === 1
                    ? 16
                    : event.deltaMode === 2
                      ? window.innerHeight
                      : 1;
            const delta = Math.max(-150, Math.min(150, event.deltaY * unit));
            control.setCameraDistance(
                control.cameraDistance + delta * 0.005 * PLAYER_SCALE,
            );
        };
        const keyDown = (event) => {
            const control = usePlayerControllerStore.getState();
            if (!control.enabled || isTyping(event.target)) return;
            if (
                [
                    "KeyW",
                    "KeyA",
                    "KeyS",
                    "KeyD",
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                ].includes(event.code)
            ) {
                if (document.pointerLockElement === gl.domElement) {
                    event.preventDefault();
                    keys.current.add(event.code);
                }
            }
            if (
                event.code === "Space" &&
                !control.pose.seated &&
                document.pointerLockElement === gl.domElement
            ) {
                event.preventDefault();
                if (
                    !event.repeat &&
                    (!multiplayer ||
                        usePeerStore.getState().players[
                            usePeerStore.getState().selfId
                        ])
                )
                    jumpRequested.current = true;
                return;
            }
            if (event.repeat) return;
            if (event.code === "KeyV") {
                event.preventDefault();
                control.toggleCamera();
            }
            if (event.code === "KeyE") {
                event.preventDefault();
                if (
                    multiplayer &&
                    !usePeerStore.getState().players[
                        usePeerStore.getState().selfId
                    ]
                )
                    return;
                const current = control.pose;
                if (!current.seated && isAirborne(current)) return;
                if (current.seated) {
                    if (multiplayer) usePeerStore.getState().toggleSeat();
                    else
                        usePlayerControllerStore.setState({
                            pose: {
                                ...current,
                                position: seatExit(findSeat(current.seated)),
                                seated: null,
                                animation: "idle",
                            },
                        });
                    capturePlayerPointer(true);
                } else {
                    const assigned = multiplayer
                        ? usePeerStore.getState().players[
                              usePeerStore.getState().selfId
                          ]?.seat
                        : PLAYER_SEATS[0].id;
                    const occupied = multiplayer
                        ? Object.values(usePeerStore.getState().players).map(
                              (p) => p.pose.seated,
                          )
                        : [];
                    const candidate = ALL_SEATS.filter(
                        (s) =>
                            (s.id === assigned || BAR_SEATS.includes(s)) &&
                            !occupied.includes(s.id),
                    ).sort(
                        (a, b) =>
                            Math.hypot(
                                a.position[0] - current.position[0],
                                a.position[2] - current.position[2],
                            ) -
                            Math.hypot(
                                b.position[0] - current.position[0],
                                b.position[2] - current.position[2],
                            ),
                    )[0];
                    if (
                        !candidate ||
                        Math.hypot(
                            candidate.position[0] - current.position[0],
                            candidate.position[2] - current.position[2],
                        ) > 2.4
                    ) {
                        usePlayerControllerStore.setState({
                            hint: "Move closer to your chair or a free barstool. E: sit",
                        });
                        return;
                    }
                    if (multiplayer) {
                        usePeerStore.getState().updatePose(current);
                        usePeerStore.getState().toggleSeat(candidate.id);
                    } else
                        usePlayerControllerStore.setState({
                            pose: seatPose(candidate),
                        });
                    if (document.pointerLockElement === gl.domElement)
                        document.exitPointerLock();
                }
                release();
            }
        };
        const keyUp = (event) => keys.current.delete(event.code);
        window.addEventListener("keydown", keyDown);
        window.addEventListener("keyup", keyUp);
        window.addEventListener("blur", release);
        document.addEventListener("pointerlockchange", release);
        document.addEventListener("visibilitychange", visibility);
        document.addEventListener("mousemove", mouse);
        window.addEventListener("wheel", wheel, { passive: false });
        gl.domElement.addEventListener("click", click);
        gl.domElement.addEventListener("contextmenu", context);
        return () => {
            const stopped = stopPlayerMotion(
                usePlayerControllerStore.getState().pose,
            );
            usePlayerControllerStore.setState({ pose: stopped });
            jump.current = createJumpState();
            jumpRequested.current = false;
            if (multiplayer) {
                usePeerStore.getState().updatePose(stopped);
            }
            window.removeEventListener("keydown", keyDown);
            window.removeEventListener("keyup", keyUp);
            window.removeEventListener("blur", release);
            document.removeEventListener("pointerlockchange", release);
            document.removeEventListener("visibilitychange", visibility);
            document.removeEventListener("mousemove", mouse);
            window.removeEventListener("wheel", wheel);
            gl.domElement.removeEventListener("click", click);
            gl.domElement.removeEventListener("contextmenu", context);
            if (document.pointerLockElement === gl.domElement)
                document.exitPointerLock();
            usePlayerControllerStore.setState({ canvas: null });
        };
    }, [gl, multiplayer]);

    const isGrounded = () => {
        const rigidBody = body.current;
        if (!rigidBody || rigidBody.linvel().y > 0.1) return false;
        const position = rigidBody.translation();
        const hit = world.castRayAndGetNormal(
            new rapier.Ray(
                { x: position.x, y: position.y + 0.1, z: position.z },
                { x: 0, y: -1, z: 0 },
            ),
            0.2,
            true,
            rapier.QueryFilterFlags.EXCLUDE_SENSORS,
            undefined,
            undefined,
            rigidBody,
        );
        return !!hit && hit.normal.y > 0.65;
    };

    useBeforePhysicsStep((physicsWorld) => {
        const rigidBody = body.current;
        const control = usePlayerControllerStore.getState();
        if (!rigidBody || control.pose.seated) return;
        const pressed = keys.current;
        const locked =
            control.enabled && document.pointerLockElement === gl.domElement;
        const forward = locked
            ? Number(pressed.has("KeyW") || pressed.has("ArrowUp")) -
              Number(pressed.has("KeyS") || pressed.has("ArrowDown"))
            : 0;
        const right = locked
            ? Number(pressed.has("KeyD") || pressed.has("ArrowRight")) -
              Number(pressed.has("KeyA") || pressed.has("ArrowLeft"))
            : 0;
        const { yaw } = look.current;
        direction.current
            .set(
                right * Math.cos(yaw) - forward * Math.sin(yaw),
                0,
                -forward * Math.cos(yaw) - right * Math.sin(yaw),
            )
            .normalize()
            .multiplyScalar(4.5);
        const vertical = stepJump(
            jump.current,
            isGrounded(),
            physicsWorld.timestep,
            control.enabled && jumpRequested.current,
        );
        jump.current = vertical.jump;
        jumpRequested.current = false;
        locomotion.current = forward || right ? "walk" : "idle";
        // Rapier resolves the capsule against furniture and keeps its vertical
        // velocity. Input controls horizontal speed; Space supplies takeoff.
        rigidBody.setLinvel(
            {
                x: direction.current.x,
                y: vertical.launch ? JUMP_VELOCITY : rigidBody.linvel().y,
                z: direction.current.z,
            },
            true,
        );
    });

    useAfterPhysicsStep((physicsWorld) => {
        const rigidBody = body.current;
        const current = usePlayerControllerStore.getState().pose;
        if (!rigidBody || current.seated) return;
        const position = rigidBody.translation();
        const grounded = isGrounded();
        const animation = jump.current.phase ?? locomotion.current;
        const next = {
            ...current,
            position: [position.x, position.y, position.z],
            rotation: look.current.yaw + Math.PI,
            animation,
            locomotion: locomotion.current,
            grounded,
        };
        usePlayerControllerStore.setState({ pose: next });
        sent.current += physicsWorld.timestep;
        if (
            multiplayer &&
            (sent.current >= 1 / 15 ||
                animation !== current.animation ||
                next.grounded !== current.grounded)
        ) {
            usePeerStore.getState().updatePose(next);
            sent.current = 0;
        }
    });

    useFrame(() => {
        if (!enabled) {
            if (previousEnabled.current) {
                camera.position.set(6, 6.5, 8.5);
                camera.lookAt(0, -0.7, 0);
                camera.fov = 48;
                camera.updateProjectionMatrix();
                keys.current.clear();
            }
            previousEnabled.current = false;
            return;
        }
        previousEnabled.current = true;
        const control = usePlayerControllerStore.getState();
        const current = control.pose;
        const seat = findSeat(current.seated);
        const eyeHeight = seat
            ? seat.height + 1.65 * PLAYER_SCALE
            : 3.2 * PLAYER_SCALE;
        camera.rotation.set(look.current.pitch, look.current.yaw, 0, "YXZ");
        camera.position.set(
            current.position[0],
            current.position[1] + eyeHeight,
            current.position[2],
        );
        if (thirdPerson) {
            camera.getWorldDirection(direction.current);
            camera.position.addScaledVector(
                direction.current,
                -control.cameraDistance,
            );
            camera.position.y += 0.6 * PLAYER_SCALE;
            camera.position.x = Math.max(
                -13.5,
                Math.min(13.5, camera.position.x),
            );
            camera.position.z = Math.max(
                -13.5,
                Math.min(13.5, camera.position.z),
            );
            camera.position.y = Math.max(-2.3, camera.position.y);
        }
        if (camera.fov !== 65) {
            camera.fov = 65;
            camera.updateProjectionMatrix();
        }
    });

    if (multiplayer && !self) return null;
    return (
        <>
            <RigidBody
                ref={body}
                position={initialPosition}
                type="dynamic"
                colliders={false}
                enabledRotations={[false, false, false]}
                ccd
                canSleep={false}
                name="local-player"
            >
                <CapsuleCollider
                    args={[
                        PLAYER_HEIGHT / 2 - 0.35 * PLAYER_SCALE,
                        0.35 * PLAYER_SCALE,
                    ]}
                    position={[0, PLAYER_HEIGHT / 2, 0]}
                    friction={0}
                    frictionCombineRule={rapier.CoefficientCombineRule.Min}
                    restitution={0}
                />
            </RigidBody>
            <Player
                pose={pose}
                nickname={multiplayer ? self.nickname : "You"}
                local
                visible={!enabled || thirdPerson}
                onAnimationFinished={onAnimationFinished}
            />
        </>
    );
}
