"use client";

import { useEffect, useMemo } from "react";
import {
    BufferGeometry,
    CatmullRomCurve3,
    Float32BufferAttribute,
    TubeGeometry,
    Vector3,
} from "three";

const SEGMENTS = 40;

function buildSurface(grids) {
    const positions = [];
    const indices = [];
    const uvs = [];
    grids.forEach(({ rows, point, reverse = false }) => {
        const start = positions.length / 3;
        for (let row = 0; row <= rows; row++) {
            for (let column = 0; column <= SEGMENTS; column++) {
                positions.push(
                    ...point((column / SEGMENTS) * Math.PI * 2, row / rows),
                );
                uvs.push(column / SEGMENTS, row / rows);
            }
        }
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < SEGMENTS; column++) {
                const a = start + row * (SEGMENTS + 1) + column;
                const b = a + 1;
                const c = a + SEGMENTS + 1;
                const d = c + 1;
                if (reverse) indices.push(a, c, b, b, c, d);
                else indices.push(a, b, c, b, d, c);
            }
        }
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function brimPoint(angle, across, underside = false) {
    const x = Math.cos(angle) * (0.34 + across * 0.54);
    const z = Math.sin(angle) * (0.42 + across * 0.34);
    const curl =
        (0.2 * Math.pow(Math.cos(angle), 4) -
            0.075 * Math.pow(Math.sin(angle), 2)) *
        across *
        across;
    return [x, 0.1 + curl - (underside ? 0.025 : 0), z];
}

function createHatGeometry() {
    const brim = buildSurface([
        { rows: 5, point: (angle, across) => brimPoint(angle, across) },
        {
            rows: 5,
            reverse: true,
            point: (angle, across) => brimPoint(angle, across, true),
        },
        {
            rows: 1,
            point: (angle, side) => {
                const [x, y, z] = brimPoint(angle, 1);
                return [x, y - side * 0.025, z];
            },
        },
        {
            rows: 1,
            reverse: true,
            point: (angle, side) => {
                const [x, y, z] = brimPoint(angle, 0);
                return [x, y - side * 0.025, z];
            },
        },
    ]);
    const levels = [
        [0.1, 0.35, 0.43],
        [0.21, 0.35, 0.42],
        [0.53, 0.32, 0.37],
        [0.64, 0.28, 0.34],
    ];
    const crown = buildSurface([
        {
            rows: levels.length - 1,
            reverse: true,
            point: (angle, amount) => {
                const [y, xRadius, zRadius] =
                    levels[Math.round(amount * (levels.length - 1))];
                return [
                    Math.cos(angle) * xRadius,
                    y,
                    Math.sin(angle) * zRadius,
                ];
            },
        },
        {
            rows: 8,
            point: (angle, across) => {
                const x = Math.cos(angle) * 0.28 * across;
                const z = Math.sin(angle) * 0.34 * across;
                const dome = 1 - across * across;
                const crease = Math.exp(-Math.pow(x / 0.065, 2)) * dome * 0.1;
                return [x, 0.64 + dome * 0.06 - crease, z];
            },
        },
    ]);
    const edgePoints = Array.from(
        { length: SEGMENTS },
        (_, index) =>
            new Vector3(...brimPoint((index * Math.PI * 2) / SEGMENTS, 1)),
    );
    const edge = new TubeGeometry(
        new CatmullRomCurve3(edgePoints, true, "centripetal"),
        48,
        0.009,
        4,
        true,
    );
    return { brim, crown, edge };
}

// The lowest brim edges rest on local y=0; +z is the front of the hat.
export default function CowboyHat({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    color = "#a17a4c",
    bandColor = "#4c2f20",
}) {
    const geometry = useMemo(createHatGeometry, []);
    useEffect(
        () => () =>
            Object.values(geometry).forEach((surface) => surface.dispose()),
        [geometry],
    );

    return (
        <group
            name="cowboy-hat"
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <mesh
                geometry={geometry.brim}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={color}
                    roughness={0.96}
                />
            </mesh>
            <mesh
                geometry={geometry.crown}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={color}
                    roughness={0.96}
                />
            </mesh>
            <mesh
                geometry={geometry.edge}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color="#72502e"
                    roughness={0.95}
                />
            </mesh>
            <mesh
                position={[0, 0.2, 0]}
                scale={[0.357, 1, 0.431]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[1, 1, 0.09, SEGMENTS, 1, true]} />
                <meshStandardMaterial
                    color={bandColor}
                    roughness={0.7}
                />
            </mesh>
            <group position={[0, 0.2, 0.441]}>
                {[-1, 1].map((side) => (
                    <group key={side}>
                        <mesh
                            position={[0, side * 0.037, 0]}
                            castShadow
                            receiveShadow
                        >
                            <boxGeometry args={[0.13, 0.013, 0.016]} />
                            <meshStandardMaterial
                                color="#b8a36d"
                                metalness={0.6}
                                roughness={0.4}
                            />
                        </mesh>
                        <mesh
                            position={[side * 0.058, 0, 0]}
                            castShadow
                            receiveShadow
                        >
                            <boxGeometry args={[0.014, 0.074, 0.016]} />
                            <meshStandardMaterial
                                color="#b8a36d"
                                metalness={0.6}
                                roughness={0.4}
                            />
                        </mesh>
                    </group>
                ))}
                <mesh castShadow>
                    <boxGeometry args={[0.1, 0.009, 0.019]} />
                    <meshStandardMaterial
                        color="#b8a36d"
                        metalness={0.6}
                        roughness={0.4}
                    />
                </mesh>
            </group>
        </group>
    );
}
