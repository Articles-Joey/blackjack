"use client";

export const BOTTLE_COLORS = [
    "#25472b",
    "#4b612d",
    "#794b22",
    "#24483e",
    "#385d74",
    "#492a36",
];
export const LABEL_COLORS = ["#f1dfb5", "#eee6d5", "#b87751", "#cbb477"];

export default function Bottle({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    color = BOTTLE_COLORS[0],
    labelColor = LABEL_COLORS[0],
    radius = 0.12,
}) {
    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <mesh
                position={[0, 0.24, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[radius, radius, 0.48, 10]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.24}
                    metalness={0.12}
                />
            </mesh>
            <mesh position={[0, 0.54, 0]}>
                <cylinderGeometry args={[0.045, radius, 0.12, 10]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.24}
                    metalness={0.12}
                />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.24, 10]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.24}
                    metalness={0.12}
                />
            </mesh>
            <mesh position={[0, 0.855, 0]}>
                <cylinderGeometry args={[0.052, 0.052, 0.05, 10]} />
                <meshStandardMaterial
                    color="#b79a60"
                    roughness={0.5}
                    metalness={0.4}
                />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
                <cylinderGeometry
                    args={[radius + 0.003, radius + 0.003, 0.19, 10, 1, true]}
                />
                <meshStandardMaterial
                    color={labelColor}
                    roughness={0.95}
                />
            </mesh>
        </group>
    );
}
