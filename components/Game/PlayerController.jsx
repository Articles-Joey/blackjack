"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import Player from "./Player";
import {
    ALL_SEATS,
    BAR_SEATS,
    PLAYER_SEATS,
    PLAYER_SCALE,
    findSeat,
    seatPose,
    seatExit,
    canWalkAt,
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
    const enabled = usePlayerControllerStore((s) => s.enabled);
    const thirdPerson = usePlayerControllerStore((s) => s.thirdPerson);
    const pose = usePlayerControllerStore((s) => s.pose);
    const self = usePeerStore((s) => s.players[s.selfId]);
    const keys = useRef(new Set());
    const look = useRef({ yaw: 0, pitch: -0.18 });
    const sent = useRef(0);
    const direction = useRef(new Vector3());
    const previousEnabled = useRef(false);

    // Only seat changes teleport the local controller; echoed movement must not
    // rewind locally predicted motion while a guest is waiting on the host.
    const seatId = multiplayer ? self?.pose.seated : pose.seated;
    const selfId = self?.id;
    useEffect(() => {
        const initial = multiplayer
            ? (usePeerStore.getState().players[selfId]?.pose ??
              seatPose(PLAYER_SEATS[0]))
            : usePlayerControllerStore.getState().pose;
        usePlayerControllerStore.setState({
            pose: { ...initial, position: [...initial.position] },
            hint: "E: sit / stand · V: camera",
        });
        look.current = { yaw: initial.rotation - Math.PI, pitch: -0.18 };
        if (initial.seated) {
            if (document.pointerLockElement === gl.domElement)
                document.exitPointerLock();
        }
    }, [multiplayer, selfId, seatId, gl]);

    useEffect(() => {
        if (!enabled) {
            const current = usePlayerControllerStore.getState().pose;
            const stopped = {
                ...current,
                animation: current.seated ? "sit" : "idle",
            };
            usePlayerControllerStore.setState({ pose: stopped });
            if (multiplayer) usePeerStore.getState().updatePose(stopped);
            keys.current.clear();
        }
    }, [enabled, multiplayer]);

    useEffect(() => {
        usePlayerControllerStore.setState({ canvas: gl.domElement });
        const release = () => keys.current.clear();
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
        document.addEventListener("mousemove", mouse);
        window.addEventListener("wheel", wheel, { passive: false });
        gl.domElement.addEventListener("click", click);
        gl.domElement.addEventListener("contextmenu", context);
        return () => {
            if (multiplayer) {
                const current = usePlayerControllerStore.getState().pose;
                usePeerStore
                    .getState()
                    .updatePose({
                        ...current,
                        animation: current.seated ? "sit" : "idle",
                    });
            }
            window.removeEventListener("keydown", keyDown);
            window.removeEventListener("keyup", keyUp);
            window.removeEventListener("blur", release);
            document.removeEventListener("pointerlockchange", release);
            document.removeEventListener("mousemove", mouse);
            window.removeEventListener("wheel", wheel);
            gl.domElement.removeEventListener("click", click);
            gl.domElement.removeEventListener("contextmenu", context);
            if (document.pointerLockElement === gl.domElement)
                document.exitPointerLock();
            usePlayerControllerStore.setState({ canvas: null });
        };
    }, [gl, multiplayer]);

    useFrame((_, delta) => {
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
        let current = control.pose;
        if (!current.seated) {
            const pressed = keys.current;
            const locked = document.pointerLockElement === gl.domElement;
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
                .multiplyScalar(4.5 * Math.min(delta, 0.05));
            const position = [...current.position];
            if (canWalkAt(position[0] + direction.current.x, position[2]))
                position[0] += direction.current.x;
            if (canWalkAt(position[0], position[2] + direction.current.z))
                position[2] += direction.current.z;
            current = {
                ...current,
                position,
                rotation: yaw + Math.PI,
                animation: forward || right ? "walk" : "idle",
            };
            usePlayerControllerStore.setState({ pose: current });
            sent.current += delta;
            if (multiplayer && sent.current > 1 / 15) {
                usePeerStore.getState().updatePose(current);
                sent.current = 0;
            }
        }
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
        <Player
            pose={pose}
            nickname={multiplayer ? self.nickname : "You"}
            local
            visible={!enabled || thirdPerson}
        />
    );
}
