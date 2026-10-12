"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, RoundedBoxGeometry } from "@react-three/drei";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import { CatmullRomCurve3, Shape, Vector3 } from "three";
import useCaseClockMaterials from "./CaseClockMaterials";

const PIVOT_Y = 4.2;
const PENDULUM_LENGTH = 2.45;
const SWING_ANGLE = 0.09;
const SWING_PERIOD = 2.2;
const MINUTE_TURN_SECONDS = 10;
const INITIAL_MINUTE_ANGLE = (-8 * Math.PI) / 30;
const INITIAL_HOUR_ANGLE = Math.PI / 2 - Math.PI / 45;
const BRASS = "#b7954c";

function ClockWood({ texture }) {
    return (
        <meshStandardMaterial
            key={texture?.uuid ?? "plain-clock-wood"}
            map={texture}
            bumpMap={texture}
            bumpScale={0.009}
            color={texture ? "#ffffff" : "#7b3f20"}
            roughness={0.6}
        />
    );
}

function BrassMaterial() {
    return (
        <meshStandardMaterial
            color={BRASS}
            metalness={0.65}
            roughness={0.3}
        />
    );
}

function GlassMaterial({ opacity = 0.12 }) {
    return (
        <meshPhysicalMaterial
            color="#c4ddd7"
            transparent
            opacity={opacity}
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.08}
            depthWrite={false}
        />
    );
}

function WoodMolding({ position, size, texture, radius = 0.02 }) {
    return (
        <RoundedBox
            position={position}
            args={size}
            radius={radius}
            smoothness={2}
            bevelSegments={1}
            castShadow
            receiveShadow
        >
            <ClockWood texture={texture} />
        </RoundedBox>
    );
}

function Pendulum({ reducedMotion }) {
    const pivot = useRef();
    const invalidate = useThree((state) => state.invalidate);
    useEffect(() => {
        invalidate();
    }, [reducedMotion, invalidate]);

    useFrame(({ clock, invalidate: requestFrame }) => {
        if (!pivot.current) return;
        pivot.current.rotation.z = reducedMotion
            ? 0
            : Math.sin((clock.getElapsedTime() * Math.PI * 2) / SWING_PERIOD) *
              SWING_ANGLE;
        if (!reducedMotion) requestFrame();
    });

    return (
        <group name="clock-pendulum-assembly">
            {/* The fixed support and axle remain outside the rotating group. */}
            <mesh position={[0, PIVOT_Y + 0.055, 0.155]}>
                <boxGeometry args={[0.19, 0.11, 0.065]} />
                <meshStandardMaterial
                    color="#55462b"
                    metalness={0.5}
                    roughness={0.6}
                />
            </mesh>
            <mesh
                position={[0, PIVOT_Y, 0.185]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <cylinderGeometry args={[0.027, 0.027, 0.065, 12]} />
                <BrassMaterial />
            </mesh>
            {/* Geometry extends down from this top origin, so only the lower end travels. */}
            <group
                ref={pivot}
                name="clock-pendulum-top-pivot"
                position={[0, PIVOT_Y, 0.155]}
            >
                <mesh
                    position={[0, -PENDULUM_LENGTH / 2, 0]}
                    castShadow
                >
                    <cylinderGeometry
                        args={[0.013, 0.013, PENDULUM_LENGTH, 8]}
                    />
                    <BrassMaterial />
                </mesh>
                <mesh
                    position={[0, -PENDULUM_LENGTH, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    castShadow
                    receiveShadow
                >
                    <cylinderGeometry args={[0.17, 0.17, 0.07, 20]} />
                    <BrassMaterial />
                </mesh>
                <mesh position={[0, -PENDULUM_LENGTH, 0.038]}>
                    <circleGeometry args={[0.137, 20]} />
                    <meshStandardMaterial
                        color="#d2b169"
                        metalness={0.55}
                        roughness={0.32}
                    />
                </mesh>
                <mesh position={[0, -PENDULUM_LENGTH, 0.041]}>
                    <ringGeometry args={[0.107, 0.113, 20]} />
                    <meshStandardMaterial
                        color="#8f7138"
                        metalness={0.55}
                        roughness={0.4}
                    />
                </mesh>
            </group>
        </group>
    );
}

function ClockHand({ length, angle, z, meshRef }) {
    const args = useMemo(() => {
        const outline = new Shape();
        const points = [
            [0, length],
            [-0.024, length - 0.04],
            [-0.007, length - 0.075],
            [-0.007, 0.1],
            [-0.025, 0.065],
            [-0.007, 0.03],
            [-0.007, -0.06],
            [0.007, -0.06],
            [0.007, 0.03],
            [0.025, 0.065],
            [0.007, 0.1],
            [0.007, length - 0.075],
            [0.024, length - 0.04],
        ];
        points.forEach(([x, y], index) => {
            if (index === 0) outline.moveTo(x, y);
            else outline.lineTo(x, y);
        });
        outline.closePath();
        return [outline, { depth: 0.007, bevelEnabled: false }];
    }, [length]);
    return (
        <mesh
            ref={meshRef}
            position={[0, 5.1595, z]}
            rotation={[0, 0, angle]}
        >
            <extrudeGeometry args={args} />
            <meshStandardMaterial
                color="#302d24"
                metalness={0.35}
                roughness={0.5}
            />
        </mesh>
    );
}

function ClockHands({ reducedMotion }) {
    const minute = useRef();
    const hour = useRef();
    const elapsed = useRef(0);
    const invalidate = useThree((state) => state.invalidate);
    useEffect(() => {
        invalidate();
    }, [reducedMotion, invalidate]);

    useFrame((state, delta) => {
        if (reducedMotion || !minute.current || !hour.current) return;
        // One shared phase keeps the gearing exact: 360 degrees of minutes = 30 degrees of hours.
        elapsed.current =
            (elapsed.current + Math.min(delta, 0.1)) %
            (MINUTE_TURN_SECONDS * 12);
        const minuteRotation =
            (elapsed.current * Math.PI * 2) / MINUTE_TURN_SECONDS;
        minute.current.rotation.z = INITIAL_MINUTE_ANGLE - minuteRotation;
        hour.current.rotation.z = INITIAL_HOUR_ANGLE - minuteRotation / 12;
        state.invalidate();
    });

    return (
        <group name="clock-animated-hands">
            <ClockHand
                meshRef={hour}
                length={0.27}
                angle={INITIAL_HOUR_ANGLE}
                z={0.24}
            />
            <ClockHand
                meshRef={minute}
                length={0.35}
                angle={INITIAL_MINUTE_ANGLE}
                z={0.251}
            />
        </group>
    );
}

function CabinetHardware() {
    return (
        <group>
            {[1.72, 4.08].map((y) => (
                <mesh
                    key={y}
                    position={[0.49, y, 0.325]}
                >
                    <boxGeometry args={[0.035, 0.15, 0.025]} />
                    <BrassMaterial />
                </mesh>
            ))}
            <mesh position={[-0.49, 2.07, 0.331]}>
                <sphereGeometry args={[0.027, 8, 4]} />
                <BrassMaterial />
            </mesh>
            <mesh position={[-0.49, 2.025, 0.365]}>
                <torusGeometry args={[0.045, 0.009, 5, 12]} />
                <BrassMaterial />
            </mesh>
        </group>
    );
}

// Local +z faces the room; the scalloped plinth rests on y=0.
export default function CaseClock({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    reducedMotion = false,
}) {
    const textures = useCaseClockMaterials();
    const face = useMemo(() => {
        const arch = new Shape();
        arch.moveTo(-0.5, 4.65);
        arch.lineTo(0.5, 4.65);
        arch.lineTo(0.5, 5.55);
        const border = [
            [-0.5, 4.65, 0.371],
            [0.5, 4.65, 0.371],
            [0.5, 5.55, 0.371],
        ];
        for (let index = 1; index <= 16; index++) {
            const angle = (index * Math.PI) / 16;
            const x = Math.cos(angle) * 0.5;
            const y = 5.55 + Math.sin(angle) * 0.5;
            arch.lineTo(x, y);
            border.push([x, y, 0.371]);
        }
        arch.closePath();
        border.push([-0.5, 4.65, 0.371]);
        return {
            arch,
            cutterArgs: [arch, { depth: 0.4, steps: 1, bevelEnabled: false }],
            borderCurve: new CatmullRomCurve3(
                border.map((point) => new Vector3(...point)),
                false,
                "centripetal",
            ),
        };
    }, []);

    return (
        <group
            name="case-clock"
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <mesh
                castShadow
                receiveShadow
            >
                <Geometry>
                    <Base position={[0, 0.12, 0]}>
                        <RoundedBoxGeometry
                            args={[1.4, 0.24, 0.7]}
                            radius={0.025}
                            smoothness={2}
                            bevelSegments={1}
                        />
                    </Base>
                    <Subtraction
                        position={[0, -0.2, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry args={[0.4, 0.4, 0.95, 16]} />
                    </Subtraction>
                </Geometry>
                <ClockWood texture={textures.wood} />
            </mesh>
            <WoodMolding
                position={[0, 0.285, 0]}
                size={[1.38, 0.09, 0.72]}
                texture={textures.wood}
            />
            <WoodMolding
                position={[0, 0.82, 0]}
                size={[1.18, 1.04, 0.6]}
                texture={textures.wood}
            />
            <WoodMolding
                position={[0, 0.82, 0.311]}
                size={[1.03, 0.85, 0.036]}
                texture={textures.wood}
                radius={0.012}
            />
            <WoodMolding
                position={[0, 1.34, 0]}
                size={[1.22, 0.09, 0.64]}
                texture={textures.wood}
            />

            {/* Deep CSG recess leaves a wooden back, side walls, and a clear glass door. */}
            <mesh
                castShadow
                receiveShadow
            >
                <Geometry>
                    <Base position={[0, 2.89, 0]}>
                        <RoundedBoxGeometry
                            args={[1.16, 3.22, 0.56]}
                            radius={0.02}
                            smoothness={2}
                            bevelSegments={1}
                        />
                    </Base>
                    <Subtraction position={[0, 2.93, 0.28]}>
                        <RoundedBoxGeometry
                            args={[0.88, 2.98, 0.52]}
                            radius={0.025}
                            smoothness={2}
                            bevelSegments={1}
                        />
                    </Subtraction>
                </Geometry>
                <ClockWood texture={textures.wood} />
            </mesh>
            <mesh
                position={[0, 2.93, 0.022]}
                receiveShadow
            >
                <planeGeometry args={[0.875, 2.975]} />
                <meshStandardMaterial
                    color="#322016"
                    roughness={1}
                />
            </mesh>
            <Pendulum reducedMotion={reducedMotion} />
            <mesh position={[0, 2.93, 0.305]}>
                <planeGeometry args={[0.85, 2.93]} />
                <GlassMaterial />
            </mesh>
            {[-0.32, 0.29].map((x) => (
                <mesh
                    key={x}
                    position={[x, 2.93, 0.307]}
                    rotation={[0, 0, -0.015]}
                >
                    <planeGeometry args={[0.014, 2.66]} />
                    <meshBasicMaterial
                        color="#f4eee0"
                        transparent
                        opacity={0.09}
                        depthWrite={false}
                    />
                </mesh>
            ))}
            <CabinetHardware />

            <WoodMolding
                position={[0, 4.41, 0]}
                size={[1.34, 0.07, 0.68]}
                texture={textures.wood}
            />
            <WoodMolding
                position={[0, 4.49, 0]}
                size={[1.48, 0.1, 0.78]}
                texture={textures.wood}
            />
            <mesh
                castShadow
                receiveShadow
            >
                <Geometry>
                    <Base position={[0, 5.4, 0]}>
                        <RoundedBoxGeometry
                            args={[1.32, 1.77, 0.7]}
                            radius={0.025}
                            smoothness={2}
                            bevelSegments={1}
                        />
                    </Base>
                    <Subtraction position={[0, 0, 0.2]}>
                        <extrudeGeometry args={face.cutterArgs} />
                    </Subtraction>
                </Geometry>
                <ClockWood texture={textures.wood} />
            </mesh>
            <mesh
                position={[0, 5.35, 0.207]}
                receiveShadow
            >
                <planeGeometry args={[1, 1.4]} />
                <meshStandardMaterial
                    key={textures.dial?.uuid ?? "plain-dial"}
                    map={textures.dial}
                    color={textures.dial ? "#ffffff" : "#dcc592"}
                    roughness={0.9}
                />
            </mesh>
            <mesh position={[0, 5.1595, 0.221]}>
                <torusGeometry args={[0.416, 0.008, 5, 48]} />
                <BrassMaterial />
            </mesh>
            <ClockHands reducedMotion={reducedMotion} />
            <mesh position={[0, 5.1595, 0.266]}>
                <circleGeometry args={[0.028, 12]} />
                <BrassMaterial />
            </mesh>
            <mesh position={[0, 0, 0.372]}>
                <shapeGeometry args={[face.arch]} />
                <GlassMaterial opacity={0.1} />
            </mesh>
            <mesh>
                <tubeGeometry args={[face.borderCurve, 48, 0.014, 6, false]} />
                <meshStandardMaterial
                    color="#704827"
                    roughness={0.6}
                />
            </mesh>

            <WoodMolding
                position={[0, 6.285, 0]}
                size={[1.42, 0.08, 0.74]}
                texture={textures.wood}
            />
            <WoodMolding
                position={[0, 6.36, 0]}
                size={[1.57, 0.09, 0.81]}
                texture={textures.wood}
            />
            <WoodMolding
                position={[0, 6.435, 0]}
                size={[1.72, 0.08, 0.89]}
                texture={textures.wood}
            />
        </group>
    );
}
