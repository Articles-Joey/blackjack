"use client";

import { useMemo } from "react";
import { RoundedBox, RoundedBoxGeometry } from "@react-three/drei";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import { CatmullRomCurve3, Quaternion, Shape, Vector3 } from "three";
import useJukeboxMaterials from "./JukeboxMaterials";

const CHROME = "#e5e4df";
const CREAM = "#efe6ca";
const RED = "#b91c24";
const CABINET_DEPTH = 0.92;

function archedShape(radius, bottom, springY) {
    const shape = new Shape();
    shape.moveTo(-radius, bottom);
    shape.lineTo(radius, bottom);
    shape.lineTo(radius, springY);
    for (let index = 1; index <= 16; index++) {
        const angle = (index * Math.PI) / 16;
        shape.lineTo(
            Math.cos(angle) * radius,
            springY + Math.sin(angle) * radius,
        );
    }
    shape.closePath();
    return shape;
}

function ChromeMaterial() {
    return (
        <meshStandardMaterial
            color={CHROME}
            metalness={0.7}
            roughness={0.24}
        />
    );
}

function WoodMaterial({ texture }) {
    return (
        <meshStandardMaterial
            key={texture?.uuid ?? "plain-wood"}
            map={texture}
            bumpMap={texture}
            bumpScale={0.006}
            color={texture ? "#ffffff" : "#a1542a"}
            roughness={0.48}
        />
    );
}

function TrimTube({ points, radius, color, metal = false, glow = false }) {
    const curve = useMemo(
        () =>
            new CatmullRomCurve3(
                points.map((point) => new Vector3(...point)),
                false,
                "centripetal",
            ),
        [points],
    );
    return (
        <mesh
            castShadow
            receiveShadow
        >
            <tubeGeometry args={[curve, 56, radius, 8, false]} />
            <meshStandardMaterial
                color={color}
                metalness={metal ? 0.7 : 0.05}
                roughness={metal ? 0.24 : 0.4}
                emissive={glow ? color : "#000000"}
                emissiveIntensity={glow ? 0.22 : 0}
            />
        </mesh>
    );
}

function ChromeRod({ from, to, radius = 0.012 }) {
    const transform = useMemo(() => {
        const start = new Vector3(...from);
        const end = new Vector3(...to);
        const direction = end.clone().sub(start);
        return {
            position: start.add(end).multiplyScalar(0.5),
            length: direction.length(),
            quaternion: new Quaternion().setFromUnitVectors(
                new Vector3(0, 1, 0),
                direction.normalize(),
            ),
        };
    }, [from, to]);
    return (
        <mesh
            position={transform.position}
            quaternion={transform.quaternion}
            castShadow
            receiveShadow
        >
            <cylinderGeometry args={[radius, radius, transform.length, 6]} />
            <ChromeMaterial />
        </mesh>
    );
}

function DiamondGrille({ cloth }) {
    const rods = useMemo(() => {
        const lines = [];
        const halfWidth = 0.43;
        const halfHeight = 0.69;
        [-2.6, 2.6].forEach((slope) => {
            for (let index = -5; index <= 5; index++) {
                const offset = index * 0.34;
                const candidates = [
                    [-halfWidth, slope * -halfWidth + offset],
                    [halfWidth, slope * halfWidth + offset],
                    [(-halfHeight - offset) / slope, -halfHeight],
                    [(halfHeight - offset) / slope, halfHeight],
                ].filter(
                    ([x, y]) =>
                        Math.abs(x) <= halfWidth + 0.0001 &&
                        Math.abs(y) <= halfHeight + 0.0001,
                );
                const ends = candidates.filter(
                    (point, i) =>
                        candidates.findIndex(
                            (other) =>
                                Math.hypot(
                                    point[0] - other[0],
                                    point[1] - other[1],
                                ) < 0.0001,
                        ) === i,
                );
                if (ends.length === 2)
                    lines.push({
                        from: [ends[0][0], ends[0][1] + 1.43, 0.535],
                        to: [ends[1][0], ends[1][1] + 1.43, 0.535],
                    });
            }
        });
        return lines;
    }, []);

    return (
        <group name="jukebox-speaker-grille">
            <mesh
                position={[0, 1.43, 0.213]}
                receiveShadow
            >
                <planeGeometry args={[0.94, 1.52]} />
                <meshStandardMaterial
                    key={cloth?.uuid ?? "plain-cloth"}
                    map={cloth}
                    color={cloth ? "#ffffff" : "#51452d"}
                    roughness={1}
                />
            </mesh>
            {rods.map((rod, index) => (
                <ChromeRod
                    key={index}
                    {...rod}
                />
            ))}
            {[-1, 1].map((side) => (
                <ChromeRod
                    key={side}
                    from={[side * 0.45, 0.71, 0.535]}
                    to={[side * 0.45, 2.15, 0.535]}
                    radius={0.025}
                />
            ))}
        </group>
    );
}

function SideOrnament({ side }) {
    return (
        <group position={[side * 0.88, 2.62, 0.61]}>
            <mesh
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.145, 0.145, 0.32, 12]} />
                <meshStandardMaterial
                    color={RED}
                    metalness={0.15}
                    roughness={0.3}
                    emissive={RED}
                    emissiveIntensity={0.15}
                />
            </mesh>
            {[-0.17, -0.07, 0.07, 0.17].map((y) => (
                <mesh
                    key={y}
                    position={[0, y, 0]}
                    castShadow
                    receiveShadow
                >
                    <cylinderGeometry args={[0.18, 0.18, 0.033, 12]} />
                    <ChromeMaterial />
                </mesh>
            ))}
            {[-1, 1].map((sign) => (
                <mesh
                    key={sign}
                    position={[0, sign * 0.24, 0]}
                    scale={[1.3, 0.8, 0.5]}
                    castShadow
                    receiveShadow
                >
                    <sphereGeometry args={[0.14, 8, 4]} />
                    <ChromeMaterial />
                </mesh>
            ))}
            {[-1, 1].map((sign) => (
                <ChromeRod
                    key={sign}
                    from={[sign * 0.115, -0.19, 0.125]}
                    to={[sign * 0.115, 0.19, 0.125]}
                    radius={0.018}
                />
            ))}
        </group>
    );
}

function SelectionPanel({ badge }) {
    return (
        <group name="jukebox-selection-panel">
            <RoundedBox
                position={[0, 2.62, 0.55]}
                args={[1.4, 0.59, 0.1]}
                castShadow
                receiveShadow
                radius={0.025}
                smoothness={2}
                bevelSegments={1}
            >
                <ChromeMaterial />
            </RoundedBox>
            <RoundedBox
                position={[0, 2.62, 0.612]}
                args={[1.3, 0.51, 0.035]}
                castShadow
                receiveShadow
                radius={0.015}
                smoothness={2}
                bevelSegments={1}
            >
                <meshStandardMaterial
                    color={CREAM}
                    roughness={0.5}
                />
            </RoundedBox>
            {[-1, 1].map((side) => (
                <ChromeRod
                    key={side}
                    from={[side * 0.46, 2.35, 0.65]}
                    to={[side * 0.46, 2.9, 0.65]}
                    radius={0.021}
                />
            ))}
            {[-1, 1].flatMap((side) =>
                Array.from({ length: 10 }, (_, index) => (
                    <mesh
                        key={`${side}-${index}`}
                        position={[
                            side * (0.55 + (index % 2) * 0.065),
                            2.79 - Math.floor(index / 2) * 0.085,
                            0.64,
                        ]}
                        scale={[1, 1, 0.55]}
                        castShadow
                        receiveShadow
                    >
                        <sphereGeometry args={[0.023, 8, 4]} />
                        <meshStandardMaterial
                            color={RED}
                            roughness={0.3}
                        />
                    </mesh>
                )),
            )}
            <mesh
                position={[0, 2.76, 0.64]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.32, 0.065, 0.018]} />
                <meshStandardMaterial
                    color="#748274"
                    roughness={0.6}
                />
            </mesh>
            {badge && (
                <mesh position={[0, 2.63, 0.648]}>
                    <planeGeometry args={[0.68, 0.1275]} />
                    <meshBasicMaterial
                        map={badge}
                        toneMapped={false}
                    />
                </mesh>
            )}
            <RoundedBox
                position={[0, 2.47, 0.644]}
                args={[0.62, 0.09, 0.02]}
                castShadow
                receiveShadow
                radius={0.008}
                smoothness={2}
                bevelSegments={1}
            >
                <ChromeMaterial />
            </RoundedBox>
            <mesh
                position={[0.12, 2.47, 0.658]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.19, 0.015, 0.008]} />
                <meshStandardMaterial color="#26282a" />
            </mesh>
        </group>
    );
}

function StarEmblem() {
    const args = useMemo(() => {
        const star = new Shape();
        for (let index = 0; index < 10; index++) {
            const radius = index % 2 ? 0.046 : 0.11;
            const angle = Math.PI / 2 + (index * Math.PI) / 5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (index === 0) star.moveTo(x, y);
            else star.lineTo(x, y);
        }
        star.closePath();
        return [star, { depth: 0.015, bevelEnabled: false }];
    }, []);
    return (
        <group position={[0, 0.99, 0.7]}>
            <mesh
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.16, 0.16, 0.03, 16]} />
                <meshStandardMaterial
                    color="#80262a"
                    roughness={0.35}
                />
            </mesh>
            <mesh
                castShadow
                receiveShadow
            >
                <torusGeometry args={[0.166, 0.027, 6, 16]} />
                <ChromeMaterial />
            </mesh>
            <mesh
                position={[0, 0, 0.02]}
                castShadow
                receiveShadow
            >
                <extrudeGeometry args={args} />
                <meshStandardMaterial
                    color="#e1bd45"
                    metalness={0.45}
                    roughness={0.3}
                />
            </mesh>
            {[-1, 1].flatMap((side) =>
                [0, 1].map((index) => (
                    <mesh
                        key={`${side}-${index}`}
                        position={[
                            side * (index ? 0.13 : 0.22),
                            index ? -0.19 : -0.06,
                            0,
                        ]}
                        castShadow
                        receiveShadow
                    >
                        <torusGeometry
                            args={[0.062, 0.015, 5, 10, Math.PI * 1.7]}
                        />
                        <ChromeMaterial />
                    </mesh>
                )),
            )}
            <mesh
                position={[0, -0.39, 0]}
                scale={[0.7, 1.9, 0.5]}
                castShadow
                receiveShadow
            >
                <octahedronGeometry args={[0.065]} />
                <ChromeMaterial />
            </mesh>
        </group>
    );
}

// Local +z is the front; the plinth rests on y=0.
export default function Jukebox({ position, rotation = [0, 0, 0], scale = 1 }) {
    const textures = useJukeboxMaterials();
    const artwork = useMemo(() => {
        const cabinet = archedShape(1.05, 0.45, 3.15);
        const window = archedShape(0.64, 2.94, 3.035);
        const extrusion = {
            depth: CABINET_DEPTH,
            steps: 1,
            bevelEnabled: true,
            bevelSize: 0.035,
            bevelThickness: 0.035,
            bevelSegments: 1,
            curveSegments: 8,
        };
        const outer = [
            [-0.88, 0.7, 0.57],
            [-0.88, 2.92, 0.57],
            [-0.88, 3.05, 0.57],
        ];
        for (let index = 1; index <= 18; index++) {
            const angle = Math.PI - (index * Math.PI) / 18;
            outer.push([
                Math.cos(angle) * 0.88,
                3.05 + Math.sin(angle) * 0.88,
                0.57,
            ]);
        }
        outer.push([0.88, 2.92, 0.57], [0.88, 0.7, 0.57]);
        const bottomTrim = [
            [-0.51, 2.11, 0.59],
            [-0.51, 1.22, 0.59],
            [-0.51, 1.1, 0.59],
        ];
        for (let index = 1; index <= 14; index++) {
            const angle = Math.PI + (index * Math.PI) / 14;
            bottomTrim.push([
                Math.cos(angle) * 0.51,
                1.1 + Math.sin(angle) * 0.51,
                0.59,
            ]);
        }
        bottomTrim.push([0.51, 1.22, 0.59], [0.51, 2.11, 0.59]);
        const windowBorder = [
            [-0.64, 2.94, 0.517],
            [-0.64, 3.035, 0.517],
        ];
        for (let index = 1; index <= 16; index++) {
            const angle = Math.PI - (index * Math.PI) / 16;
            windowBorder.push([
                Math.cos(angle) * 0.64,
                3.035 + Math.sin(angle) * 0.64,
                0.517,
            ]);
        }
        windowBorder.push(
            [0.64, 2.94, 0.517],
            [0, 2.94, 0.517],
            [-0.64, 2.94, 0.517],
        );
        return {
            cabinetArgs: [cabinet, extrusion],
            window,
            windowCutArgs: [
                window,
                { depth: 0.45, steps: 1, bevelEnabled: false },
            ],
            outer,
            stripe: outer.map(([x, y]) => [x, y, 0.684]),
            bottomTrim,
            windowBorder,
        };
    }, []);

    return (
        <group
            name="back-right-jukebox"
            position={position}
            rotation={rotation}
            scale={scale}
        >
            {/* CSG creates actual recessed window and grille openings in the wooden cabinet. */}
            <mesh
                castShadow
                receiveShadow
            >
                <Geometry>
                    <Base position={[0, 0, -CABINET_DEPTH / 2]}>
                        <extrudeGeometry args={artwork.cabinetArgs} />
                    </Base>
                    <Subtraction position={[0, 0, 0.27]}>
                        <extrudeGeometry args={artwork.windowCutArgs} />
                    </Subtraction>
                    <Subtraction position={[0, 1.43, 0.46]}>
                        <RoundedBoxGeometry
                            args={[0.94, 1.52, 0.5]}
                            radius={0.07}
                            smoothness={2}
                            bevelSegments={1}
                        />
                    </Subtraction>
                </Geometry>
                <WoodMaterial texture={textures.wood} />
            </mesh>

            <RoundedBox
                position={[0, 0.22, 0]}
                args={[2.32, 0.4, 1.07]}
                radius={0.08}
                smoothness={2}
                bevelSegments={1}
                castShadow
                receiveShadow
            >
                <WoodMaterial texture={textures.wood} />
            </RoundedBox>
            {[0.04, 0.445].map((y) => (
                <RoundedBox
                    key={y}
                    position={[0, y, 0]}
                    args={[2.46, 0.08, 1.16]}
                    radius={0.025}
                    smoothness={2}
                    bevelSegments={1}
                    castShadow
                    receiveShadow
                >
                    <WoodMaterial texture={textures.wood} />
                </RoundedBox>
            ))}
            <RoundedBox
                position={[0, 0.245, 0.55]}
                args={[1.43, 0.3, 0.035]}
                castShadow
                receiveShadow
                radius={0.015}
                smoothness={2}
                bevelSegments={1}
            >
                <WoodMaterial texture={textures.wood} />
            </RoundedBox>
            <mesh
                position={[0, 0.26, 0.622]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.055, 0.055, 0.25, 8]} />
                <meshStandardMaterial
                    color="#d9a55c"
                    roughness={0.5}
                />
            </mesh>

            <TrimTube
                points={artwork.outer}
                radius={0.115}
                color={CREAM}
                glow
            />
            <TrimTube
                points={artwork.stripe}
                radius={0.019}
                color={RED}
                glow
            />
            <TrimTube
                points={artwork.bottomTrim}
                radius={0.115}
                color={CREAM}
            />
            {[-1, 1].map((side) => (
                <group
                    key={side}
                    position={[side * 0.88, 0.81, 0.57]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                    >
                        <cylinderGeometry args={[0.148, 0.148, 0.65, 12]} />
                        <meshStandardMaterial
                            color="#202124"
                            metalness={0.35}
                            roughness={0.38}
                        />
                    </mesh>
                    {[0.18, 0.23, 0.28, 0.325].map((y) => (
                        <mesh
                            key={y}
                            position={[0, y, 0]}
                            rotation={[Math.PI / 2, 0, 0]}
                            castShadow
                            receiveShadow
                        >
                            <torusGeometry args={[0.148, 0.013, 4, 12]} />
                            <meshStandardMaterial
                                color="#353536"
                                metalness={0.4}
                                roughness={0.4}
                            />
                        </mesh>
                    ))}
                </group>
            ))}

            <mesh
                position={[0, 0, 0.275]}
                receiveShadow
            >
                <shapeGeometry args={[artwork.window]} />
                <meshStandardMaterial
                    color="#171c20"
                    roughness={0.5}
                />
            </mesh>
            <mesh
                position={[0, 2.99, 0.37]}
                scale={[1, 1, 0.26]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.4, 0.4, 0.02, 16]} />
                <meshStandardMaterial
                    color="#111315"
                    metalness={0.3}
                    roughness={0.5}
                />
            </mesh>
            <mesh
                position={[0, 3.006, 0.37]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.065, 0.065, 0.005, 12]} />
                <meshStandardMaterial
                    color={RED}
                    roughness={0.5}
                />
            </mesh>
            <ChromeRod
                from={[0.37, 3.025, 0.35]}
                to={[0.09, 3.025, 0.4]}
                radius={0.012}
            />
            <mesh position={[0, 0, 0.512]}>
                <shapeGeometry args={[artwork.window]} />
                <meshStandardMaterial
                    color="#7c9d9d"
                    transparent
                    opacity={0.14}
                    roughness={0.18}
                    depthWrite={false}
                />
            </mesh>
            <TrimTube
                points={artwork.windowBorder}
                radius={0.019}
                color={CHROME}
                metal
            />
            {textures.archLabel && (
                <mesh position={[0, 3.4, 0.526]}>
                    <planeGeometry args={[1.06, 0.53]} />
                    <meshBasicMaterial
                        map={textures.archLabel}
                        transparent
                        depthWrite={false}
                        toneMapped={false}
                    />
                </mesh>
            )}

            <SelectionPanel badge={textures.badge} />
            {[-1, 1].map((side) => (
                <SideOrnament
                    key={side}
                    side={side}
                />
            ))}
            <RoundedBox
                position={[0, 2.19, 0.58]}
                args={[1.24, 0.22, 0.09]}
                castShadow
                receiveShadow
                radius={0.025}
                smoothness={2}
                bevelSegments={1}
            >
                <ChromeMaterial />
            </RoundedBox>
            <mesh
                position={[0, 2.19, 0.632]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.51, 0.065, 0.014]} />
                <meshStandardMaterial color="#282b2e" />
            </mesh>
            {[-1, 1].map((side) => (
                <RoundedBox
                    key={side}
                    position={[side * 0.46, 2.19, 0.641]}
                    args={[0.17, 0.09, 0.023]}
                    castShadow
                    receiveShadow
                    radius={0.01}
                    smoothness={2}
                    bevelSegments={1}
                >
                    <meshStandardMaterial
                        color={RED}
                        emissive={RED}
                        emissiveIntensity={0.2}
                        roughness={0.3}
                    />
                </RoundedBox>
            ))}
            <DiamondGrille cloth={textures.cloth} />
            <StarEmblem />

            <RoundedBox
                position={[0, 4.05, 0.55]}
                args={[0.47, 0.09, 0.12]}
                castShadow
                receiveShadow
                radius={0.025}
                smoothness={2}
                bevelSegments={1}
            >
                <ChromeMaterial />
            </RoundedBox>
            {[-0.16, 0, 0.16].map((x) => (
                <group
                    key={x}
                    position={[x, 4.08, 0.56]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                    >
                        <torusGeometry args={[0.082, 0.026, 5, 10, Math.PI]} />
                        <ChromeMaterial />
                    </mesh>
                    <mesh
                        position={[0, 0.02, 0.012]}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry args={[0.066, 0.061, 0.028]} />
                        <meshStandardMaterial
                            color={RED}
                            roughness={0.3}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
