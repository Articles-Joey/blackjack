"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
import WoodBox from "./WoodBox";

const DEFAULT_IMAGE = "/img/A_Friend_in_Need_1903_C.M.Coolidge.jpg";

// Local +z faces into the room; width describes the visible painting, excluding its frame.
export default function FramedArt({
    src = DEFAULT_IMAGE,
    position,
    rotation = [0, 0, 0],
    width = 5.2,
    wood,
}) {
    const [image, setImage] = useState({ texture: null, aspect: 3500 / 2509 });
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        let active = true;
        setImage((current) => ({ ...current, texture: null }));
        const texture = new TextureLoader().load(
            src,
            (loaded) => {
                if (!active) {
                    loaded.dispose();
                    return;
                }
                loaded.colorSpace = SRGBColorSpace;
                loaded.anisotropy = Math.min(
                    8,
                    gl.capabilities.getMaxAnisotropy(),
                );
                loaded.needsUpdate = true;
                setImage({
                    texture: loaded,
                    aspect: loaded.image.width / loaded.image.height,
                });
            },
            undefined,
            () => {
                if (active) invalidate();
            },
        );
        return () => {
            active = false;
            texture.dispose();
        };
    }, [src, gl, invalidate]);

    useEffect(() => {
        invalidate();
    }, [image, invalidate]);

    const height = width / image.aspect;
    const matWidth = 0.12;
    const frameWidth = 0.18;
    const openingWidth = width + matWidth * 2;
    const openingHeight = height + matWidth * 2;
    const outerWidth = openingWidth + frameWidth * 2;
    const outerHeight = openingHeight + frameWidth * 2;
    const finish = {
        texture: wood,
        color: wood ? "#c5a17d" : "#67432d",
        roughness: 0.5,
        bumpScale: 0.005,
        castShadow: true,
    };

    return (
        <group
            name="framed-art"
            position={position}
            rotation={rotation}
        >
            <mesh
                position={[0, 0, -0.045]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[outerWidth, outerHeight, 0.09]} />
                <meshStandardMaterial
                    color="#4b3223"
                    roughness={0.9}
                />
            </mesh>
            <mesh
                position={[0, 0, 0.008]}
                receiveShadow
            >
                <planeGeometry args={[openingWidth, openingHeight]} />
                <meshStandardMaterial
                    color="#e8dcc4"
                    roughness={1}
                />
            </mesh>
            {image.texture && (
                <mesh
                    position={[0, 0, 0.012]}
                    receiveShadow
                >
                    <planeGeometry args={[width, height]} />
                    <meshStandardMaterial
                        key={image.texture.uuid}
                        map={image.texture}
                        color="#ffffff"
                        roughness={0.95}
                        metalness={0}
                    />
                </mesh>
            )}

            {[-1, 1].map((side) => (
                <group key={side}>
                    <WoodBox
                        position={[
                            0,
                            (side * (openingHeight + frameWidth)) / 2,
                            0.045,
                        ]}
                        size={[outerWidth, frameWidth, 0.18]}
                        {...finish}
                    />
                    <WoodBox
                        position={[
                            (side * (openingWidth + frameWidth)) / 2,
                            0,
                            0.045,
                        ]}
                        size={[frameWidth, openingHeight, 0.18]}
                        {...finish}
                    />
                    <mesh position={[0, (side * openingHeight) / 2, 0.083]}>
                        <boxGeometry
                            args={[openingWidth + 0.025, 0.025, 0.025]}
                        />
                        <meshStandardMaterial
                            color="#b99a56"
                            metalness={0.45}
                            roughness={0.4}
                        />
                    </mesh>
                    <mesh position={[(side * openingWidth) / 2, 0, 0.083]}>
                        <boxGeometry args={[0.025, openingHeight, 0.025]} />
                        <meshStandardMaterial
                            color="#b99a56"
                            metalness={0.45}
                            roughness={0.4}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
