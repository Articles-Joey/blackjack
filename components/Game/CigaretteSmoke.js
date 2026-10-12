"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";

const PUFF_COUNT = 8;

function smokeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Smoke requires a 2D canvas context.");
    // Overlapping soft wisps, with fully transparent edges so sprites have no visible rectangle.
    [
        [61, 91, 21],
        [72, 66, 24],
        [56, 42, 26],
        [68, 23, 20],
    ].forEach(([x, y, radius]) => {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(220, 224, 219, 0.6)");
        gradient.addColorStop(0.45, "rgba(220, 224, 219, 0.25)");
        gradient.addColorStop(1, "rgba(220, 224, 219, 0)");
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
}

export default function CigaretteSmoke({ tips, reducedMotion = false }) {
    const sprites = useRef([]);
    const [texture, setTexture] = useState(null);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        const nextTexture = smokeTexture();
        setTexture(nextTexture);
        invalidate();
        return () => nextTexture.dispose();
    }, [invalidate]);

    useEffect(() => {
        invalidate();
    }, [texture, reducedMotion, invalidate]);

    useFrame(({ clock }) => {
        if (!texture) return;
        const time = reducedMotion ? 1 : clock.getElapsedTime();
        tips.forEach(([x, y, z], emitter) => {
            for (let index = 0; index < PUFF_COUNT; index++) {
                const sprite = sprites.current[emitter * PUFF_COUNT + index];
                if (!sprite) continue;
                const age =
                    (time / 4.5 + index / PUFF_COUNT + emitter * 0.37) % 1;
                const sway = Math.sin(age * 8 + emitter * 2) * age * 0.09;
                sprite.position.set(
                    x + sway,
                    y + 0.035 + age * 1.05,
                    z + Math.cos(age * 6 + emitter) * age * 0.065,
                );
                const size = 0.1 + age * 0.32;
                sprite.scale.set(size, size * 1.8, 1);
                sprite.material.opacity = Math.sin(age * Math.PI) * 0.38;
                sprite.material.rotation = Math.sin(age * 5 + emitter) * 0.18;
            }
        });
        // Demand-rendered canvas only stays animated while smoke is moving.
        if (!reducedMotion) invalidate();
    });

    if (!texture) return null;
    return tips.flatMap((tip, emitter) =>
        Array.from({ length: PUFF_COUNT }, (_, index) => (
            <sprite
                key={`${emitter}-${index}`}
                ref={(sprite) => {
                    sprites.current[emitter * PUFF_COUNT + index] = sprite;
                }}
            >
                <spriteMaterial
                    map={texture}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    toneMapped={false}
                />
            </sprite>
        )),
    );
}
