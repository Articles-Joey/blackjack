"use client";

import WoodBox from "./WoodBox";
import Bottle, { BOTTLE_COLORS, LABEL_COLORS } from "./Bottle";

export const WINE_RACK_HALF_WIDTH = 1.01;

export default function WineRack({ wood, position = [1.05, 1.25, 0.64] }) {
    // The bar group's origin is on the floor; keep the existing tops and extend the sides down to it.
    const sideBottom = -position[1];
    const sideTop = 2.65;
    return (
        <group position={position}>
            <WoodBox
                position={[0, 1.3, -0.43]}
                size={[1.9, 2.6, 0.1]}
                texture={wood}
                color="#976944"
            />
            {[-0.95, 0.95].map((x) => (
                <WoodBox
                    key={x}
                    position={[x, (sideTop + sideBottom) / 2, 0]}
                    size={[0.12, sideTop - sideBottom, 1]}
                    texture={wood}
                    castShadow
                />
            ))}
            {[0, 0.65, 1.3, 1.95, 2.6].map((y) => (
                <WoodBox
                    key={y}
                    position={[0, y, 0]}
                    size={[1.9, 0.08, 1]}
                    texture={wood}
                    castShadow
                />
            ))}
            {[-0.31, 0.31].map((x) => (
                <WoodBox
                    key={x}
                    position={[x, 1.3, 0]}
                    size={[0.06, 2.6, 1]}
                    texture={wood}
                />
            ))}
            {Array.from({ length: 12 }, (_, index) => (
                <Bottle
                    key={index}
                    position={[
                        ((index % 3) - 1) * 0.62,
                        Math.floor(index / 3) * 0.65 + 0.16,
                        -0.36,
                    ]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={0.92}
                    color={BOTTLE_COLORS[index % BOTTLE_COLORS.length]}
                    labelColor={LABEL_COLORS[index % LABEL_COLORS.length]}
                />
            ))}
        </group>
    );
}
