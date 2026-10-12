"use client";

export default function WoodBox({
    position,
    size,
    texture,
    color = "#d5b18a",
    castShadow = false,
    roughness = 0.72,
    bumpScale = 0.025,
    renderOrder = 0,
}) {
    return (
        <mesh
            position={position}
            renderOrder={renderOrder}
            castShadow={castShadow}
            receiveShadow
        >
            <boxGeometry args={size} />
            <meshStandardMaterial
                key={texture?.uuid ?? "plain"}
                color={color}
                map={texture}
                bumpMap={texture}
                bumpScale={bumpScale}
                roughness={roughness}
            />
        </mesh>
    );
}
