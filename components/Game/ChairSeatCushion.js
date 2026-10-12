"use client";

import { useMemo } from "react";
import { Shape } from "three";

export function CushionMaterial({ felt, bump, polygonOffset = false }) {
    return (
        <meshStandardMaterial
            key={felt?.uuid ?? "plain-felt"}
            map={felt}
            bumpMap={bump}
            bumpScale={0.008}
            color={felt ? "#ffffff" : "#703b36"}
            roughness={0.96}
            metalness={0}
            polygonOffset={polygonOffset}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
        />
    );
}

export default function ChairSeatCushion({ position, felt, bump }) {
    const bevel = 0.025;
    const depth = 0.13 - bevel * 2;
    const geometryArgs = useMemo(() => {
        // Leave room for the bevel so the cushion keeps its original outer dimensions.
        const x = 1.12 / 2 - bevel;
        const y = 1.09 / 2 - bevel;
        const radius = 0.14;
        const shape = new Shape();
        shape.moveTo(-x + radius, -y);
        shape.lineTo(x - radius, -y);
        shape.quadraticCurveTo(x, -y, x, -y + radius);
        shape.lineTo(x, y - radius);
        shape.quadraticCurveTo(x, y, x - radius, y);
        shape.lineTo(-x + radius, y);
        shape.quadraticCurveTo(-x, y, -x, y - radius);
        shape.lineTo(-x, -y + radius);
        shape.quadraticCurveTo(-x, -y, -x + radius, -y);
        shape.closePath();
        return [
            shape,
            {
                depth,
                steps: 1,
                curveSegments: 10,
                bevelEnabled: true,
                bevelThickness: bevel,
                bevelSize: bevel,
                bevelSegments: 4,
            },
        ];
    }, [bevel, depth]);

    return (
        <group position={position}>
            <mesh
                position={[0, -depth / 2, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                castShadow
                receiveShadow
            >
                <extrudeGeometry args={geometryArgs} />
                <CushionMaterial
                    felt={felt}
                    bump={bump}
                />
            </mesh>
        </group>
    );
}
