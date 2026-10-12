"use client";

export default function FirewoodLog({
    position,
    rotation = [Math.PI / 2, 0, 0],
    radius = 0.205,
    length = 1.06,
    bark,
    endGrain,
    color = "#ffffff",
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
                <cylinderGeometry
                    args={[radius * 0.96, radius, length, 10, 1, true]}
                />
                <meshStandardMaterial
                    key={bark?.uuid ?? "plain-bark"}
                    map={bark}
                    bumpMap={bark}
                    bumpScale={0.018}
                    color={bark ? color : "#59402b"}
                    roughness={1}
                    flatShading
                />
            </mesh>
            {[-1, 1].map((side) => (
                <mesh
                    key={side}
                    position={[0, (side * length) / 2, 0]}
                    rotation={[side === 1 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}
                    castShadow
                    receiveShadow
                >
                    <circleGeometry
                        args={[radius * (side === 1 ? 0.96 : 1), 10]}
                    />
                    <meshStandardMaterial
                        key={endGrain?.uuid ?? "plain-end"}
                        map={endGrain}
                        color={endGrain ? "#ffffff" : "#ba8b52"}
                        roughness={0.95}
                    />
                </mesh>
            ))}
        </group>
    );
}
