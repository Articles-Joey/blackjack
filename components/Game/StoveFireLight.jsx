"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Object3D } from "three";

export default function StoveFireLight({ position, reducedMotion = false }) {
    const glow = useRef();
    const spill = useRef();
    const invalidate = useThree((state) => state.invalidate);
    const target = useMemo(() => new Object3D(), []);
    const colors = useMemo(
        () => ({ amber: new Color("#ffb65c"), orange: new Color("#ff7b2c") }),
        [],
    );

    useEffect(() => {
        invalidate();
    }, [reducedMotion, invalidate]);

    useFrame(({ clock, invalidate: requestFrame }) => {
        const time = clock.elapsedTime;
        const flicker = reducedMotion
            ? 1
            : 1 +
              Math.sin(time * 7.7) * 0.17 +
              Math.sin(time * 13.9 + 0.4) * 0.1 +
              Math.sin(time * 23.1 + 1.2) * 0.06;
        const warmth = reducedMotion ? 0.4 : (Math.sin(time * 3.7) + 1) / 2;
        if (glow.current) {
            glow.current.intensity = 9 * flicker;
            glow.current.color
                .copy(colors.amber)
                .lerp(colors.orange, warmth * 0.45);
        }
        if (spill.current) {
            spill.current.intensity = 90 * flicker;
            spill.current.color.copy(colors.amber).lerp(colors.orange, warmth);
        }
        if (!reducedMotion) requestFrame();
    });

    return (
        <group
            name="stove-fire-light"
            position={position}
        >
            {/* Soft nearby fill and a broad pool of firelight aimed out of the open door. */}
            <pointLight
                ref={glow}
                color="#ffb65c"
                intensity={9}
                distance={8}
                decay={2}
            />
            <primitive
                object={target}
                position={[0, -0.32, 1.4]}
            />
            <spotLight
                ref={spill}
                target={target}
                color="#ff963f"
                intensity={90}
                angle={Math.PI / 3}
                penumbra={0.85}
                distance={12}
                decay={2}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-near={0.1}
                shadow-camera-far={12}
                shadow-normalBias={0.025}
            />
        </group>
    );
}
