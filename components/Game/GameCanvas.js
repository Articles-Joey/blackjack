import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader, Vector3 } from "three";

import { Debug, Physics, useBox, useSphere } from "@react-three/cannon";
import { degToRad } from "three/src/math/MathUtils";

import { Model as SpacesuitModel } from "@/components/Models/Spacesuit";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { useGameStore } from "@/hooks/useGameStore";

import { Player } from "./Player";
import { FPV } from "./FPV";
import TopCheckpoint from "./TopCheckpoint";
import Obstacles from "./Obstacles";

function GameCanvas(props) {

    const {
        debug,
        controlType,
        topCheckpoint
    } = useGameStore(state => ({
        debug: state.debug,
        controlType: state.controlType,
        topCheckpoint: state.topCheckpoint
    }));

    let gameContent = (
        <>
            {controlType == "Mouse and Keyboard" &&
                <Player />
            }

            {/* Bottom Ground */}
            <Ground
                args={[10, 0.25, 5]}
                position={[0, 0, 0]}
            />

            <SpacesuitModel
                position={[0, 0.15, -1]}
                scale={0.6}
                action="Run"
            />

            <Ramp
                args={[10, 0.25, 100]}
                position={[0, 25, 43.5]}
                rotation={[degToRad(-30), 0, 0]}
            />

            {/* Top Ground */}
            <Ground
                args={[10, 0.25, 15]}
                position={[0, 49.98, 94.25]}
            />

            <TopCheckpoint
                args={[
                    (10 / 1.2),
                    2.25,
                    (15 / 1.2),
                ]}
                position={[0, 51, 94.25]}
            />

            {topCheckpoint &&
                <Text
                    position={[0, 52, 94.25]}
                    color="black"
                    rotation={[0, degToRad(180), 0]}
                >
                    You made it!
                </Text>
            }

            <ModelKennyNLMiniGolfFlagRed
                position={[0, 49.98, 90.25]}
            />

            <Wall
                args={[0.1, 50, 100]}
                position={[-5, 25, 50]}
            />

            <Wall
                args={[0.1, 50, 100]}
                position={[5, 25, 50]}
            />

            <Obstacles />
        </>
    )

    let physicsContent
    if (debug) {
        physicsContent = (
            <Debug>
                {gameContent}
            </Debug>
        )
    } else {
        physicsContent = (
            gameContent
        )
    }

    return (
        <Canvas camera={{ position: [0, -2, -10], fov: 50 }}>

            {controlType !== "Mouse and Keyboard" &&
                <OrbitControls
                // autoRotate={gameState?.status == 'In Lobby'}
                />
            }

            <Sky
                sunPosition={[0, 10, 0]}
            />

            <ambientLight intensity={5} />
            {/* <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} /> */}

            {controlType == "Mouse and Keyboard" &&
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            }

            <Physics>

                {physicsContent}

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)

function Ground({ args, position }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="gray" />
        </mesh>
    )

}

function Wall({ args, position }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial
                color="gray"
                transparent={true}
                opacity={0.5}
            />
        </mesh>
    )

}

function Ramp({ args, position, rotation }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
        rotation: rotation
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="gray" />
        </mesh>
    )

}