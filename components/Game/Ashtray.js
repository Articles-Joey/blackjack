"use client";

import { useMemo } from "react";
import { Quaternion, Vector2, Vector3 } from "three";
import CigaretteSmoke from "./CigaretteSmoke";

const CIGARETTES = [
    { tip: [-0.09, 0.078, -0.025], filter: [-0.62, 0.285, -0.22] },
    { tip: [0.05, 0.078, 0.02], filter: [0.44, 0.275, 0.5] },
];
const SMOKE_TIPS = CIGARETTES.map(({ tip }) => tip);
const BOWL_PROFILE = [
    [0, 0.015],
    [0.27, 0.015],
    [0.36, 0.045],
    [0.38, 0.13],
    [0.36, 0.155],
    [0.31, 0.145],
    [0.28, 0.07],
    [0.2, 0.045],
    [0, 0.045],
].map(([x, y]) => new Vector2(x, y));

function Cigarette({ tip, filter }) {
    const { length, orientation } = useMemo(() => {
        const direction = new Vector3(...filter).sub(new Vector3(...tip));
        return {
            length: direction.length(),
            orientation: new Quaternion().setFromUnitVectors(
                new Vector3(0, 1, 0),
                direction.normalize(),
            ),
        };
    }, [tip, filter]);
    const filterLength = 0.16;
    const ashLength = 0.045;
    const paperLength = length - filterLength - ashLength;

    return (
        <group
            position={tip}
            quaternion={orientation}
        >
            <mesh
                position={[0, ashLength / 2, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.024, 0.025, ashLength, 10]} />
                <meshStandardMaterial
                    color="#77746e"
                    roughness={1}
                />
            </mesh>
            <mesh position={[0, 0.003, 0]}>
                <cylinderGeometry args={[0.023, 0.023, 0.009, 10]} />
                <meshStandardMaterial
                    color="#5a2112"
                    emissive="#f34c16"
                    emissiveIntensity={0.8}
                    roughness={1}
                />
            </mesh>
            <mesh
                position={[0, ashLength + paperLength / 2, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.024, 0.024, paperLength, 10]} />
                <meshStandardMaterial
                    color="#e9e3d4"
                    roughness={0.95}
                />
            </mesh>
            <mesh
                position={[0, length - filterLength / 2, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.025, 0.025, filterLength, 10]} />
                <meshStandardMaterial
                    color="#bf8a48"
                    roughness={0.9}
                />
            </mesh>
        </group>
    );
}

export default function Ashtray({
    position,
    rotation = [0, 0, 0],
    reducedMotion = false,
}) {
    return (
        <group
            position={position}
            rotation={rotation}
        >
            <mesh
                castShadow
                receiveShadow
            >
                <latheGeometry args={[BOWL_PROFILE, 32]} />
                <meshStandardMaterial
                    color="#aaa79d"
                    metalness={0.65}
                    roughness={0.3}
                />
            </mesh>
            <mesh
                position={[0, 0.046, 0]}
                receiveShadow
            >
                <cylinderGeometry args={[0.2, 0.2, 0.005, 24]} />
                <meshStandardMaterial
                    color="#65615a"
                    roughness={1}
                />
            </mesh>
            {Array.from({ length: 7 }, (_, index) => (
                <mesh
                    key={index}
                    position={[
                        Math.cos(index * 2.4) * 0.12,
                        0.052,
                        Math.sin(index * 2.4) * 0.12,
                    ]}
                >
                    <sphereGeometry args={[0.014, 5, 4]} />
                    <meshStandardMaterial
                        color="#b0aaa0"
                        roughness={1}
                    />
                </mesh>
            ))}
            {CIGARETTES.map((cigarette) => (
                <Cigarette
                    key={cigarette.tip[0]}
                    {...cigarette}
                />
            ))}
            <CigaretteSmoke
                tips={SMOKE_TIPS}
                reducedMotion={reducedMotion}
            />
        </group>
    );
}
