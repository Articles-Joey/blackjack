"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import FirewoodLog from "./FirewoodLog";

function logTextures(anisotropy) {
    const barkCanvas = document.createElement("canvas");
    const endCanvas = document.createElement("canvas");
    barkCanvas.width =
        barkCanvas.height =
        endCanvas.width =
        endCanvas.height =
            256;
    const barkContext = barkCanvas.getContext("2d");
    const endContext = endCanvas.getContext("2d");
    if (!barkContext || !endContext)
        throw new Error("Firewood textures require a 2D canvas context.");
    const pixels = barkContext.createImageData(256, 256);
    let seed = 3989;
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const angle = (x * Math.PI * 2) / 256;
            const warp = Math.sin((y * Math.PI * 4) / 256) * 0.1;
            const furrow =
                Math.pow((Math.sin(angle * 17 + warp) + 1) / 2, 8) * -28;
            const noise = (seed / 4294967296 - 0.5) * 22;
            const shade = furrow + noise + Math.sin(angle * 7) * 8;
            const offset = (y * 256 + x) * 4;
            pixels.data[offset] = 93 + shade;
            pixels.data[offset + 1] = 66 + shade * 0.8;
            pixels.data[offset + 2] = 43 + shade * 0.65;
            pixels.data[offset + 3] = 255;
        }
    }
    barkContext.putImageData(pixels, 0, 0);
    endContext.fillStyle = "#bd945e";
    endContext.fillRect(0, 0, 256, 256);
    for (let ring = 1; ring < 12; ring++) {
        endContext.beginPath();
        for (let step = 0; step <= 96; step++) {
            const angle = (step * Math.PI * 2) / 96;
            const radius =
                ring * 10 +
                Math.sin(angle * 5 + ring) * 1.5 +
                Math.sin(angle * 3) * 2;
            const x = 121 + Math.cos(angle) * radius;
            const y = 132 + Math.sin(angle) * radius;
            if (step === 0) endContext.moveTo(x, y);
            else endContext.lineTo(x, y);
        }
        endContext.strokeStyle = ring % 2 ? "#947044" : "#a57f4e";
        endContext.lineWidth = 1.5;
        endContext.stroke();
    }
    [0.4, 2.2, 4.8].forEach((angle) => {
        endContext.beginPath();
        endContext.moveTo(
            128 + Math.cos(angle) * 118,
            128 + Math.sin(angle) * 118,
        );
        endContext.lineTo(
            128 + Math.cos(angle + 0.07) * 58,
            128 + Math.sin(angle + 0.07) * 58,
        );
        endContext.strokeStyle = "#705035";
        endContext.lineWidth = 2;
        endContext.stroke();
    });
    const bark = new CanvasTexture(barkCanvas);
    const endGrain = new CanvasTexture(endCanvas);
    [bark, endGrain].forEach((texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = anisotropy;
    });
    bark.wrapS = bark.wrapT = RepeatWrapping;
    return { bark, endGrain };
}

function RackBar({ position, size }) {
    return (
        <mesh
            position={position}
            castShadow
            receiveShadow
        >
            <boxGeometry args={size} />
            <meshStandardMaterial
                color="#303034"
                metalness={0.65}
                roughness={0.65}
            />
        </mesh>
    );
}

export default function FirewoodRack({ position, rotation = [0, 0, 0] }) {
    const [textures, setTextures] = useState({ bark: null, endGrain: null });
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        const next = logTextures(
            Math.min(8, gl.capabilities.getMaxAnisotropy()),
        );
        setTextures(next);
        return () => {
            next.bark.dispose();
            next.endGrain.dispose();
        };
    }, [gl]);

    useEffect(() => {
        invalidate();
    }, [textures, invalidate]);

    return (
        <group
            name="firewood-rack"
            position={position}
            rotation={rotation}
        >
            {[-1.24, 1.24].flatMap((x) =>
                [-0.6, 0.6].map((z) => (
                    <RackBar
                        key={`${x}-${z}`}
                        position={[x, 0.95, z]}
                        size={[0.075, 1.9, 0.075]}
                    />
                )),
            )}
            {[-0.6, 0.6].map((z) => (
                <RackBar
                    key={z}
                    position={[0, 0.24, z]}
                    size={[2.55, 0.09, 0.09]}
                />
            ))}
            {[-1.24, 1.24].flatMap((x) =>
                [0.24, 1.86].map((y) => (
                    <RackBar
                        key={`${x}-${y}`}
                        position={[x, y, 0]}
                        size={[0.075, 0.075, 1.28]}
                    />
                )),
            )}
            {[-0.8, 0, 0.8].map((x) => (
                <RackBar
                    key={x}
                    position={[x, 0.24, 0]}
                    size={[0.065, 0.065, 1.2]}
                />
            ))}
            {Array.from({ length: 20 }, (_, index) => {
                const row = Math.floor(index / 5);
                const column = index % 5;
                return (
                    <FirewoodLog
                        key={index}
                        position={[
                            (column - 2) * 0.43 + (row % 2) * 0.09,
                            0.49 + row * 0.38,
                            Math.sin(index * 2.3) * 0.045,
                        ]}
                        radius={0.2 + Math.sin(index * 1.7) * 0.01}
                        length={1.06 + Math.sin(index * 2.7) * 0.08}
                        rotation={[Math.PI / 2, index * 0.7, 0]}
                        color={index % 3 === 0 ? "#e6d4bd" : "#ffffff"}
                        {...textures}
                    />
                );
            })}
        </group>
    );
}
