"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import createCardTexture from "./createCardTexture";

export default function PlayingCard({
    number,
    suit,
    position,
    delay = 0,
    reducedMotion,
    appearance,
}) {
    const group = useRef();
    const progress = useRef(0);
    const [texture, setTexture] = useState(null);
    const [textureError, setTextureError] = useState(null);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        let active = true;
        let ownedTexture = null;
        setTexture(null);
        setTextureError(null);
        createCardTexture(number, suit, appearance)
            .then((nextTexture) => {
                if (!active) {
                    nextTexture.dispose();
                    return;
                }
                ownedTexture = nextTexture;
                setTexture(nextTexture);
            })
            .catch((error) => {
                if (active) setTextureError(error);
            });
        return () => {
            active = false;
            ownedTexture?.dispose();
        };
    }, [number, suit, appearance]);

    useEffect(() => {
        if (texture) invalidate();
    }, [texture, invalidate]);

    useEffect(() => {
        progress.current = reducedMotion ? delay + 1 : 0;
        invalidate();
    }, [number, suit, delay, reducedMotion, invalidate]);

    // Only request frames while cards are dealing or moving into their new slots.
    useFrame((state, delta) => {
        if (!group.current) return;
        progress.current += Math.min(delta, 0.05);
        const amount = reducedMotion
            ? 1
            : Math.min(1, Math.max(0, (progress.current - delay) / 0.55));
        const eased = 1 - Math.pow(1 - amount, 3);
        const target = [
            position[0] * eased + 2.8 * (1 - eased),
            position[1] + Math.sin(amount * Math.PI) * 0.7,
            position[2] * eased - 1.2 * (1 - eased),
        ];
        const smoothing =
            reducedMotion || amount < 1 ? 1 : 1 - Math.exp(-14 * delta);
        group.current.position.x +=
            (target[0] - group.current.position.x) * smoothing;
        group.current.position.y +=
            (target[1] - group.current.position.y) * smoothing;
        group.current.position.z +=
            (target[2] - group.current.position.z) * smoothing;
        group.current.rotation.set(-Math.PI / 2, 0, (1 - eased) * -0.15);

        const unsettled =
            group.current.position.distanceTo({
                x: position[0],
                y: position[1],
                z: position[2],
            }) > 0.001;
        if (amount < 1 || unsettled) state.invalidate();
    });

    if (textureError) throw textureError;

    return (
        <group
            ref={group}
            position={reducedMotion ? position : [2.8, 0.16, -1.2]}
            rotation={[-Math.PI / 2, 0, -0.15]}
        >
            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.8, 1.2, 0.018]} />
                <meshStandardMaterial
                    color={appearance?.background ?? "#fffaf0"}
                    roughness={0.85}
                />
            </mesh>
            {texture && (
                <mesh position={[0, 0, 0.014]}>
                    <planeGeometry args={[0.79, 1.19]} />
                    <meshBasicMaterial
                        map={texture}
                        toneMapped={false}
                    />
                </mesh>
            )}
        </group>
    );
}
