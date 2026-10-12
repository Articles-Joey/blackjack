"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import StoveFireLight from "./StoveFireLight";

const SMOKE_VERTEX = `
attribute float aSize;
attribute float aAlpha;
uniform float uScale;
varying float vAlpha;
void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
}`;
const SMOKE_FRAGMENT = `
uniform vec3 uColor;
varying float vAlpha;
void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
}`;

// Stable per-particle pseudo-random values in [0, 1).
const hash = (i, salt) => {
    const value = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
};

// Puffs rise `height` units, widen, and fade out completely on arrival.
function Smoke({
    position,
    unit,
    height,
    width,
    count,
    duration,
    opacity,
    color,
    reducedMotion = false,
}) {
    const pointsRef = useRef();
    const materialRef = useRef();
    const arrays = useMemo(
        () => ({
            positions: new Float32Array(count * 3),
            sizes: new Float32Array(count),
            alphas: new Float32Array(count),
        }),
        [count],
    );
    const uniforms = useMemo(
        () => ({ uScale: { value: 1 }, uColor: { value: new THREE.Color() } }),
        [],
    );

    useFrame(({ clock, size, gl, invalidate }) => {
        const points = pointsRef.current;
        if (!points) return;
        const attributes = points.geometry.attributes;
        const positions = attributes.position.array;
        const sizes = attributes.aSize.array;
        const alphas = attributes.aAlpha.array;
        const time = reducedMotion ? 1 : clock.elapsedTime;
        for (let i = 0; i < count; i += 1) {
            const age = (time / duration + i / count) % 1;
            const angle =
                hash(i, 1) * Math.PI * 2 + age * (1.5 + hash(i, 2) * 2);
            const radius = width * 0.4 * (0.5 + hash(i, 3) * 0.6) * age;
            positions[i * 3] =
                Math.cos(angle) * radius + age * age * width * 0.6;
            positions[i * 3 + 1] = height * (1 - Math.pow(1 - age, 1.8));
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            sizes[i] = width * (0.3 + 0.7 * age) * unit;
            alphas[i] =
                opacity *
                THREE.MathUtils.smoothstep(age, 0, 0.1) *
                (1 - THREE.MathUtils.smoothstep(age, 0.45, 1));
        }
        attributes.position.needsUpdate = true;
        attributes.aSize.needsUpdate = true;
        attributes.aAlpha.needsUpdate = true;
        const material = materialRef.current;
        material.uniforms.uScale.value = size.height * gl.getPixelRatio() * 0.5;
        material.uniforms.uColor.value.set(color);
        if (!reducedMotion) invalidate();
    });

    return (
        <points
            ref={pointsRef}
            position={position}
            frustumCulled={false}
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[arrays.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    args={[arrays.sizes, 1]}
                />
                <bufferAttribute
                    attach="attributes-aAlpha"
                    args={[arrays.alphas, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={SMOKE_VERTEX}
                fragmentShader={SMOKE_FRAGMENT}
                transparent
                depthWrite={false}
            />
        </points>
    );
}

const SPARK_COUNT = 14;

// Same flame style as the campsite fire, authored at campfire size; scale the group to fit.
export function StoveFlames({
    position,
    scale,
    light = true,
    reducedMotion = false,
}) {
    const flameRef = useRef();
    const outerFlameRef = useRef();
    const innerFlameRef = useRef();
    const tongueRefs = useRef([]);
    const sparkRef = useRef();
    const lightRef = useRef();
    const sparkData = useMemo(() => {
        const positions = new Float32Array(SPARK_COUNT * 3);
        const colors = new Float32Array(SPARK_COUNT * 3);
        const seeds = new Float32Array(SPARK_COUNT * 4);
        const color = new THREE.Color();

        for (let index = 0; index < SPARK_COUNT; index += 1) {
            const offset = index * 4;
            seeds[offset] = Math.random();
            seeds[offset + 1] = Math.random();
            seeds[offset + 2] = Math.random();
            seeds[offset + 3] = 0.7 + Math.random() * 0.8;
            color
                .set(index % 3 === 0 ? "#ffd878" : "#ff7a30")
                .toArray(colors, index * 3);
        }

        return { positions, colors, seeds };
    }, []);

    useFrame(({ clock, invalidate }) => {
        const time = reducedMotion ? 1 : clock.elapsedTime;
        const flicker =
            1 +
            Math.sin(time * 11.3) * 0.09 +
            Math.sin(time * 17.9 + 0.7) * 0.05;

        if (flameRef.current) {
            flameRef.current.rotation.y = time * 0.35;
            flameRef.current.scale.set(
                0.94 + Math.sin(time * 8.7) * 0.06,
                flicker,
                0.94 + Math.sin(time * 7.1 + 1.8) * 0.05,
            );
        }
        if (outerFlameRef.current) {
            outerFlameRef.current.rotation.z = Math.sin(time * 4.2) * 0.1;
        }
        if (innerFlameRef.current) {
            innerFlameRef.current.rotation.z =
                Math.sin(time * 5.9 + 1.2) * 0.12;
        }
        tongueRefs.current.forEach((tongue, index) => {
            if (!tongue) return;
            tongue.rotation.z = Math.sin(time * (5.4 + index) + index) * 0.2;
            tongue.scale.y = 0.85 + Math.sin(time * (8 + index) + index) * 0.16;
        });

        if (sparkRef.current) {
            const positions = sparkRef.current.geometry.attributes.position;
            for (let index = 0; index < SPARK_COUNT; index += 1) {
                const seedOffset = index * 4;
                const positionOffset = index * 3;
                const speed = sparkData.seeds[seedOffset + 3];
                const life =
                    (time * speed * 0.7 + sparkData.seeds[seedOffset]) % 1;
                const angle =
                    sparkData.seeds[seedOffset + 1] * Math.PI * 2 + time * 0.55;
                const spread =
                    0.025 +
                    life * (0.1 + sparkData.seeds[seedOffset + 2] * 0.12);

                positions.array[positionOffset] =
                    Math.cos(angle) * spread +
                    Math.sin(time * 3 + index) * 0.02;
                positions.array[positionOffset + 1] = 0.1 + life * life * 0.8;
                positions.array[positionOffset + 2] =
                    Math.sin(angle) * spread +
                    Math.cos(time * 2.4 + index) * 0.02;
            }
            positions.needsUpdate = true;
        }

        if (lightRef.current) {
            lightRef.current.intensity = 1.4 * flicker;
            lightRef.current.position.x = Math.sin(time * 3.7) * 0.02;
            lightRef.current.position.z = 0.1 + Math.cos(time * 4.3) * 0.02;
        }
        if (!reducedMotion) invalidate();
    });

    return (
        <group
            name="stove-flames"
            position={position}
        >
            {light && (
                <pointLight
                    ref={lightRef}
                    position={[0, 0.15, 0.1]}
                    color="#ff9d42"
                    intensity={1.4}
                    distance={3}
                    decay={2}
                />
            )}
            <group scale={scale}>
                <group ref={flameRef}>
                    <mesh
                        ref={outerFlameRef}
                        position={[0, 0.31, 0]}
                    >
                        <coneGeometry args={[0.28, 0.62, 7, 3]} />
                        <meshStandardMaterial
                            color="#ff6328"
                            emissive="#ff3b16"
                            emissiveIntensity={4}
                            transparent
                            opacity={0.8}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                            flatShading
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh
                        ref={innerFlameRef}
                        position={[0.015, 0.25, 0.015]}
                    >
                        <coneGeometry args={[0.16, 0.48, 6, 2]} />
                        <meshStandardMaterial
                            color="#ffc24d"
                            emissive="#ff8a24"
                            emissiveIntensity={4.8}
                            transparent
                            opacity={0.88}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                            flatShading
                            toneMapped={false}
                        />
                    </mesh>
                    {[-1, 1].map((side, index) => (
                        <mesh
                            key={side}
                            ref={(mesh) => {
                                tongueRefs.current[index] = mesh;
                            }}
                            position={[side * 0.12, 0.22, 0.04]}
                            rotation={[0, 0, side * 0.32]}
                        >
                            <coneGeometry args={[0.1, 0.42, 5, 2]} />
                            <meshStandardMaterial
                                color="#ff8a2f"
                                emissive="#ff4f1c"
                                emissiveIntensity={3.6}
                                transparent
                                opacity={0.72}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                                flatShading
                                toneMapped={false}
                            />
                        </mesh>
                    ))}
                </group>
                <points
                    ref={sparkRef}
                    frustumCulled={false}
                >
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[sparkData.positions, 3]}
                            usage={THREE.DynamicDrawUsage}
                        />
                        <bufferAttribute
                            attach="attributes-color"
                            args={[sparkData.colors, 3]}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.04}
                        vertexColors
                        transparent
                        opacity={0.92}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                        toneMapped={false}
                    />
                </points>
            </group>
        </group>
    );
}

// Closed annular wall sections preserve the original hollow body and door opening
// using Three geometry, so the copied stove needs no CSG dependency.
function StoveWallSection({
    radius,
    wall,
    height,
    y,
    material,
    start = 0,
    sweep = Math.PI * 2,
}) {
    const args = useMemo(() => {
        const shape = new THREE.Shape();
        const innerRadius = radius - wall;
        if (sweep >= Math.PI * 2 - 0.0001) {
            shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
            const hole = new THREE.Path();
            hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
            shape.holes.push(hole);
        } else {
            const segments = Math.ceil((24 * sweep) / (Math.PI * 2));
            for (let index = 0; index <= segments; index++) {
                const angle = start + (sweep * index) / segments;
                const x = Math.sin(angle) * radius;
                const z = -Math.cos(angle) * radius;
                if (index === 0) shape.moveTo(x, z);
                else shape.lineTo(x, z);
            }
            for (let index = segments; index >= 0; index--) {
                const angle = start + (sweep * index) / segments;
                shape.lineTo(
                    Math.sin(angle) * innerRadius,
                    -Math.cos(angle) * innerRadius,
                );
            }
            shape.closePath();
        }
        return [
            shape,
            { depth: height, steps: 1, bevelEnabled: false, curveSegments: 12 },
        ];
    }, [radius, wall, height, start, sweep]);

    return (
        <mesh
            position={[0, y, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={material}
            castShadow
            receiveShadow
        >
            <extrudeGeometry args={args} />
        </mesh>
    );
}

// Door faces local +z, standing on y=0. `pipeTop` is the chimney top height.
export default function WoodStove({
    pipeTop = 3,
    color = "#2b2b2e",
    unit = 1,
    smoke = true,
    smokeHeight = 3,
    smokeWidth = 0.6,
    smokeParticles = 28,
    smokeDuration = 5,
    smokeOpacity = 0.45,
    smokeColor = "#d9dde0",
    reducedMotion = false,
    ...groupProps
}) {
    const materials = useMemo(
        () => ({
            metal: new THREE.MeshStandardMaterial({
                color,
                metalness: 0.6,
                roughness: 0.45,
            }),
            ember: new THREE.MeshStandardMaterial({
                color: "#ff7a30",
                emissive: "#ff5a18",
                emissiveIntensity: 2.5,
                toneMapped: false,
            }),
        }),
        [color],
    );
    useEffect(
        () => () => Object.values(materials).forEach((item) => item.dispose()),
        [materials],
    );

    const legHeight = 0.14;
    const bodyHeight = 0.6;
    const radius = 0.24;
    const wall = 0.025;
    const floor = 0.03;
    const doorWidth = 0.18;
    const doorHeight = 0.2;
    const doorBottom = 0.1;
    const pipeBottom = legHeight + bodyHeight;
    const doorCenterY = legHeight + doorBottom + doorHeight / 2;
    const frameBar = 0.025;
    const doorHalfAngle = Math.asin(doorWidth / (2 * radius));

    return (
        <group {...groupProps}>
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos((i * Math.PI) / 2 + Math.PI / 4) *
                            radius *
                            0.7,
                        legHeight / 2,
                        Math.sin((i * Math.PI) / 2 + Math.PI / 4) *
                            radius *
                            0.7,
                    ]}
                    material={materials.metal}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[0.04, legHeight, 0.04]} />
                </mesh>
            ))}
            <mesh
                position={[0, legHeight + floor / 2, 0]}
                material={materials.metal}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[radius, radius, floor, 24]} />
            </mesh>
            <StoveWallSection
                radius={radius}
                wall={wall}
                height={doorBottom - floor}
                y={legHeight + floor}
                material={materials.metal}
            />
            <StoveWallSection
                radius={radius}
                wall={wall}
                height={doorHeight}
                y={legHeight + doorBottom}
                material={materials.metal}
                start={doorHalfAngle}
                sweep={Math.PI * 2 - doorHalfAngle * 2}
            />
            <StoveWallSection
                radius={radius}
                wall={wall}
                height={bodyHeight - doorBottom - doorHeight}
                y={legHeight + doorBottom + doorHeight}
                material={materials.metal}
            />
            <mesh
                position={[0, pipeBottom + 0.02, 0]}
                material={materials.metal}
                castShadow
                receiveShadow
            >
                <cylinderGeometry
                    args={[radius + 0.02, radius + 0.02, 0.04, 24]}
                />
            </mesh>

            {/* Door frame */}
            {[-1, 1].map((s) => (
                <mesh
                    key={`side-${s}`}
                    castShadow
                    receiveShadow
                    position={[
                        s * (doorWidth / 2 + frameBar / 2),
                        doorCenterY,
                        radius - 0.005,
                    ]}
                    material={materials.metal}
                >
                    <boxGeometry
                        args={[frameBar, doorHeight + frameBar * 2, 0.03]}
                    />
                </mesh>
            ))}
            {[-1, 1].map((s) => (
                <mesh
                    key={`bar-${s}`}
                    castShadow
                    receiveShadow
                    position={[
                        0,
                        doorCenterY + (s * (doorHeight + frameBar)) / 2,
                        radius - 0.005,
                    ]}
                    material={materials.metal}
                >
                    <boxGeometry args={[doorWidth, frameBar, 0.03]} />
                </mesh>
            ))}

            {/* Interior */}
            <mesh
                position={[0, legHeight + floor + 0.01, 0]}
                material={materials.ember}
            >
                <cylinderGeometry
                    args={[
                        radius - wall - 0.01,
                        radius - wall - 0.01,
                        0.02,
                        20,
                    ]}
                />
            </mesh>
            <StoveFlames
                position={[0, legHeight + floor + 0.02, 0.02]}
                scale={0.5}
                light={false}
                reducedMotion={reducedMotion}
            />
            <StoveFireLight
                position={[0, doorCenterY, radius + 0.045]}
                reducedMotion={reducedMotion}
            />

            <mesh
                position={[0, (pipeBottom + pipeTop) / 2, 0]}
                material={materials.metal}
                castShadow
                receiveShadow
            >
                <cylinderGeometry
                    args={[0.045, 0.045, pipeTop - pipeBottom, 10]}
                />
            </mesh>
            <mesh
                position={[0, pipeTop, 0]}
                material={materials.metal}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.075, 0.06, 0.06, 10]} />
            </mesh>
            {smoke && (
                <Smoke
                    position={[0, pipeTop + 0.06, 0]}
                    unit={unit}
                    height={smokeHeight}
                    width={smokeWidth}
                    count={smokeParticles}
                    duration={smokeDuration}
                    opacity={smokeOpacity}
                    color={smokeColor}
                    reducedMotion={reducedMotion}
                />
            )}
        </group>
    );
}
