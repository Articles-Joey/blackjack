"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text, useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Box3, LoopOnce, LoopRepeat, Vector3 } from "three";
import { findSeat, PLAYER_HEIGHT, PLAYER_SCALE } from "./playerSeats";
import { PLAYER_ANIMATIONS } from "./playerJump";

const MODEL_URL = "/models/Characters/UAL1_Standard.glb";

// Adapted from usa-tycoon's UAL controller: shared GLTF, independent skeletons
// and animation mixers, UAL locomotion/jump clips and sitting clip index 30.
export default function Player({
    pose,
    nickname = "Player",
    local = false,
    visible = true,
    onAnimationFinished,
}) {
    const { scene, animations } = useGLTF(MODEL_URL);
    const group = useRef();
    const visual = useRef();
    const positioned = useRef(false);
    const finishedCallback = useRef(onAnimationFinished);
    const point = useMemo(() => new Vector3(), []);
    const target = useMemo(() => new Vector3(), []);
    const model = useMemo(() => {
        const clone = SkeletonUtils.clone(scene);
        let hips = null;
        clone.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
            if (node.isBone && /hips|pelvis/i.test(node.name)) hips = node;
        });
        clone.updateMatrixWorld(true);
        const box = new Box3().setFromObject(clone);
        const scale = PLAYER_HEIGHT / Math.max(box.max.y - box.min.y, 0.01);
        return { clone, hips, scale, base: -box.min.y * scale };
    }, [scene]);
    const { actions, mixer } = useAnimations(animations, model.clone);
    const seat = findSeat(pose.seated);
    const clip = seat
        ? animations[30]?.name
        : (PLAYER_ANIMATIONS[pose.animation] ?? "Idle_Loop");

    useEffect(() => {
        finishedCallback.current = onAnimationFinished;
    }, [onAnimationFinished]);

    // AnimationAction is an imperative Three.js object, as in the source UAL model.
    /* eslint-disable react-hooks/immutability */
    useEffect(() => {
        const action = actions[clip];
        if (!action) return;
        const oneShot = clip === "Jump_Start" || clip === "Jump_Land";
        // Keep the walk cycle's time when leaving the blended landing pose.
        if (!oneShot && action.isRunning() && action.getEffectiveWeight() > 0) {
            action.stopFading().setEffectiveTimeScale(1).setEffectiveWeight(1);
        } else {
            action
                .reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0.18);
        }
        action.clampWhenFinished = oneShot;
        action
            .setLoop(oneShot ? LoopOnce : LoopRepeat, oneShot ? 1 : Infinity)
            .play();
        const finished = (event) => {
            if (event.action === action) finishedCallback.current?.(clip);
        };
        if (oneShot) mixer.addEventListener("finished", finished);
        return () => {
            mixer.removeEventListener("finished", finished);
            action.fadeOut(0.18);
        };
    }, [actions, clip, mixer]);
    /* eslint-enable react-hooks/immutability */

    useEffect(() => {
        if (clip !== "Jump_Land" || pose.locomotion !== "walk") return;
        const walk = actions.Walk_Loop;
        if (!walk) return;
        walk.reset()
            .setLoop(LoopRepeat, Infinity)
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(0.55)
            .fadeIn(0.18)
            .play();
        return () => walk.fadeOut(0.18);
    }, [actions, clip, pose.locomotion]);

    useFrame((_, delta) => {
        if (!group.current || !visual.current) return;
        target.fromArray(pose.position);
        if (local || seat || !positioned.current)
            group.current.position.copy(target);
        else group.current.position.lerp(target, 1 - Math.exp(-14 * delta));
        const difference = Math.atan2(
            Math.sin(pose.rotation - group.current.rotation.y),
            Math.cos(pose.rotation - group.current.rotation.y),
        );
        group.current.rotation.y +=
            difference *
            (local || seat || !positioned.current
                ? 1
                : Math.min(1, delta * 14));
        positioned.current = true;
        visual.current.position.set(0, model.base, 0);
        if (seat) {
            if (model.hips) {
                model.clone.updateWorldMatrix(true, true);
                model.hips.getWorldPosition(point);
                model.clone.worldToLocal(point);
                visual.current.position.set(
                    -point.x * model.scale,
                    seat.height + 0.12 - point.y * model.scale,
                    -point.z * model.scale,
                );
            } else
                visual.current.position.y = seat.height - PLAYER_HEIGHT * 0.48;
        }
    });

    return (
        <group
            ref={group}
            visible={visible}
            dispose={null}
        >
            <group ref={visual}>
                <primitive
                    object={model.clone}
                    scale={model.scale}
                />
            </group>
            <Billboard
                position={[
                    0,
                    seat
                        ? seat.height + 2.1 * PLAYER_SCALE
                        : PLAYER_HEIGHT + 0.35,
                    0,
                ]}
            >
                <Text
                    fontSize={0.24}
                    maxWidth={3.5}
                    color="white"
                    outlineColor="#111"
                    outlineWidth={0.025}
                    anchorX="center"
                >
                    {nickname}
                </Text>
            </Billboard>
        </group>
    );
}
