"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import createCardTexture from "./createCardTexture";

function createEdgeTexture(anisotropy) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 52 * 8;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Card stack requires a 2D canvas context.");
    for (let card = 0; card < 52; card++) {
        const shade = 232 + Math.round(Math.sin(card * 2.7) * 6);
        context.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 15})`;
        context.fillRect(0, card * 8, 256, 8);
        context.fillStyle = "#958d7f";
        context.fillRect(0, card * 8, 256, 1);
        context.fillStyle = "#fffcf2";
        context.fillRect(0, card * 8 + 1, 256, 1);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
}

export default function CardStack({ position, appearance }) {
    const [textures, setTextures] = useState({ back: null, edges: null });
    const [error, setError] = useState(null);
    const invalidate = useThree((state) => state.invalidate);
    const gl = useThree((state) => state.gl);

    useEffect(() => {
        let active = true;
        let back = null;
        const edges = createEdgeTexture(
            Math.min(8, gl.capabilities.getMaxAnisotropy()),
        );
        setError(null);
        setTextures({ back: null, edges });
        createCardTexture(undefined, undefined, appearance)
            .then((texture) => {
                if (!active) {
                    texture.dispose();
                    return;
                }
                back = texture;
                setTextures({ back, edges });
            })
            .catch((reason) => {
                if (active) setError(reason);
            });
        return () => {
            active = false;
            edges.dispose();
            back?.dispose();
        };
    }, [appearance, gl]);

    useEffect(() => {
        invalidate();
    }, [textures, invalidate]);
    if (error) throw error;

    return (
        <group
            position={position}
            rotation={[0, -0.15, 0]}
        >
            <mesh
                position={[0, 0.1, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.8, 0.2, 1.2]} />
                <meshStandardMaterial
                    key={textures.edges?.uuid ?? "paper"}
                    map={textures.edges}
                    bumpMap={textures.edges}
                    bumpScale={0.003}
                    roughness={0.9}
                    color={textures.edges ? "#ffffff" : "#ede5d5"}
                />
            </mesh>
            {textures.back && (
                <mesh
                    position={[0, 0.201, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[0.8, 1.2]} />
                    <meshBasicMaterial
                        map={textures.back}
                        toneMapped={false}
                    />
                </mesh>
            )}
        </group>
    );
}
