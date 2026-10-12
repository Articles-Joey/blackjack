"use client";

import { useEffect, useMemo } from "react";
import WoodBox from "./WoodBox";
import Bottle, { BOTTLE_COLORS, LABEL_COLORS } from "./Bottle";
import WineRack, { WINE_RACK_HALF_WIDTH } from "./WineRack";
import BarStool from "./BarStool";
import Ashtray from "./Ashtray";
import CowboyHat from "./CowboyHat";

const SHELF_LEVELS = [1.2, 2.6, 4, 5.4];
const CABINET_TOP = 6.9;
const CABINET_BASE = 0;
const CABINET_SIDE_HEIGHT = CABINET_TOP - CABINET_BASE;

function makeRandom(seed) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

export default function RoomBar({
    wood,
    wallWidth = 28,
    floorY = -2.8,
    reducedMotion = false,
    children,
}) {
    const shelfWidth = wallWidth * 0.25 - 2.25;
    const shelfCenter = 2.15 + shelfWidth / 2;
    const rightRackCenter =
        shelfCenter + shelfWidth / 2 + 0.2 + WINE_RACK_HALF_WIDTH;
    const length = rightRackCenter + WINE_RACK_HALF_WIDTH;
    const panelCount = Math.ceil(length / 1.4);
    const topWood = useMemo(() => {
        if (!wood) return null;
        const texture = wood.clone();
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;
        texture.repeat.set(4, 0.6);
        texture.needsUpdate = true;
        return texture;
    }, [wood]);

    useEffect(() => () => topWood?.dispose(), [topWood]);

    const stock = useMemo(() => {
        const random = makeRandom(87531);
        return SHELF_LEVELS.flatMap((level, row) => {
            const count = 5 + Math.floor(random() * 3);
            return Array.from({ length: count }, (_, index) => ({
                key: `${row}-${index}`,
                position: [
                    2.3 +
                        ((index + 0.5) * (shelfWidth - 0.3)) / count +
                        (random() - 0.5) * 0.08,
                    level + 0.07,
                    0.72 + (random() - 0.5) * 0.12,
                ],
                scale: 0.8 + random() * 0.35,
                radius: 0.105 + random() * 0.025,
                color: BOTTLE_COLORS[
                    Math.floor(random() * BOTTLE_COLORS.length)
                ],
                labelColor:
                    LABEL_COLORS[Math.floor(random() * LABEL_COLORS.length)],
                rotation: [0, random() * Math.PI * 2, 0],
            }));
        });
    }, [shelfWidth]);

    return (
        <group
            name="back-left-bar"
            position={[-wallWidth / 2, floorY, -wallWidth / 2]}
        >
            {/* Counter back is at z=3.8; shelving ends near z=1.2, leaving a clear bartender aisle. */}
            <WoodBox
                position={[length / 2, 1.45, 4.55]}
                size={[length, 2.9, 1.15]}
                texture={wood}
                color="#97653d"
                castShadow
            />
            <WoodBox
                position={[length / 2, 2.95, 4.55]}
                size={[length + 0.16, 0.22, 1.65]}
                texture={topWood}
                color="#e0b782"
                roughness={0.35}
                castShadow
            />
            {[-0.51, 0, 0.51].map((z) => (
                <WoodBox
                    key={z}
                    position={[length / 2, 3.073, 4.55 + z]}
                    size={[length + 0.12, 0.035, 0.495]}
                    texture={topWood}
                    color="#dfb586"
                    roughness={0.35}
                />
            ))}

            {Array.from({ length: panelCount }, (_, index) => (
                <group
                    key={index}
                    position={[((index + 0.5) * length) / panelCount, 0, 5.16]}
                >
                    <WoodBox
                        position={[0, 1.45, 0]}
                        size={[length / panelCount - 0.16, 2.2, 0.055]}
                        texture={wood}
                        color="#bf9164"
                    />
                    {[-1, 1].map((side) => (
                        <WoodBox
                            key={side}
                            position={[
                                (side * (length / panelCount - 0.1)) / 2,
                                1.45,
                                0.045,
                            ]}
                            size={[0.065, 2.45, 0.07]}
                            texture={wood}
                        />
                    ))}
                </group>
            ))}
            {[0.2, 2.7].map((y) => (
                <WoodBox
                    key={y}
                    position={[length / 2, y, 5.2]}
                    size={[length, 0.13, 0.1]}
                    texture={wood}
                    color="#dfb586"
                />
            ))}
            <mesh
                position={[length / 2, 0.35, 5.42]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.055, 0.055, length - 0.45, 12]} />
                <meshStandardMaterial
                    color="#b59654"
                    metalness={0.65}
                    roughness={0.35}
                />
            </mesh>
            {[0.15, 0.5, 0.85].map((fraction) => (
                <mesh
                    key={fraction}
                    position={[length * fraction, 0.35, 5.27]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.028, 0.028, 0.3, 8]} />
                    <meshStandardMaterial
                        color="#b59654"
                        metalness={0.65}
                        roughness={0.35}
                    />
                </mesh>
            ))}

            <WineRack wood={wood} />
            <WineRack
                wood={wood}
                position={[rightRackCenter, 1.25, 0.64]}
            />
            <WoodBox
                position={[
                    shelfCenter,
                    CABINET_BASE + CABINET_SIDE_HEIGHT / 2,
                    0.12,
                ]}
                size={[shelfWidth + 0.15, CABINET_SIDE_HEIGHT, 0.13]}
                texture={wood}
                color="#946039"
            />
            {[-1, 1].map((side) => (
                <WoodBox
                    key={side}
                    position={[
                        shelfCenter + (side * shelfWidth) / 2,
                        CABINET_BASE + CABINET_SIDE_HEIGHT / 2,
                        0.67,
                    ]}
                    size={[0.13, CABINET_SIDE_HEIGHT, 1]}
                    texture={wood}
                    castShadow
                />
            ))}
            {SHELF_LEVELS.map((y) => (
                <WoodBox
                    key={y}
                    position={[shelfCenter, y, 0.67]}
                    size={[shelfWidth, 0.13, 1]}
                    texture={wood}
                    castShadow
                />
            ))}
            <WoodBox
                position={[shelfCenter, CABINET_TOP, 0.67]}
                size={[shelfWidth + 0.16, 0.16, 1.08]}
                texture={wood}
                castShadow
            />
            {stock.map(({ key, ...bottle }) => (
                <Bottle
                    key={key}
                    {...bottle}
                />
            ))}

            {Array.from({ length: 4 }, (_, index) => (
                <BarStool
                    key={index}
                    position={[((index + 0.5) * length) / 4, 0, 6.25]}
                    wood={wood}
                />
            ))}
            <Bottle
                position={[length * 0.58, 3.095, 4.35]}
                color={BOTTLE_COLORS[0]}
                labelColor={LABEL_COLORS[0]}
            />
            <Bottle
                position={[length * 0.58 + 0.42, 3.095, 4.53]}
                color={BOTTLE_COLORS[2]}
                labelColor={LABEL_COLORS[2]}
                scale={0.94}
            />
            <Ashtray
                position={[length * 0.28, 3.095, 4.55]}
                reducedMotion={reducedMotion}
            />
            <CowboyHat
                position={[length * 0.83, 3.095, 4.55]}
                rotation={[0, -0.35, 0]}
                scale={0.85}
            />

            {/* Place a future humanoid at this local origin, with its feet on the floor. */}
            <group
                name="bartender-position"
                position={[4.4, 0, 2.5]}
            >
                {children}
            </group>
            <pointLight
                position={[length / 2, 5.7, 3.1]}
                color="#ffd6a0"
                intensity={55}
                distance={12}
                decay={2}
            />
        </group>
    );
}
