"use client";

import WoodBox from "./WoodBox";

export default function BarStool({ position, wood }) {
    return (
        <group position={position}>
            {[-0.34, 0.34].flatMap((x) =>
                [-0.34, 0.34].map((z) => (
                    <WoodBox
                        key={`${x}-${z}`}
                        position={[x, 0.98, z]}
                        size={[0.12, 1.96, 0.12]}
                        texture={wood}
                        castShadow
                    />
                )),
            )}
            <mesh
                position={[0, 0.7, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
            >
                <torusGeometry args={[0.48, 0.035, 8, 24]} />
                <meshStandardMaterial
                    color="#b59654"
                    metalness={0.65}
                    roughness={0.35}
                />
            </mesh>
            <mesh
                position={[0, 1.98, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.56, 0.54, 0.16, 24]} />
                <meshStandardMaterial
                    map={wood}
                    color="#d5b18a"
                    roughness={0.55}
                />
            </mesh>
            <mesh
                position={[0, 2.1, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.53, 0.55, 0.16, 24]} />
                <meshStandardMaterial
                    color="#703b36"
                    roughness={0.8}
                />
            </mesh>
        </group>
    );
}
