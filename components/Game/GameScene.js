"use client";

import { Suspense, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import PlayingCard from "./PlayingCard";
import GameRoom from "./GameRoom";
import SceneOrbitControls from "./SceneOrbitControls";
import CardStack from "./CardStack";
import Ashtray from "./Ashtray";
import Dealer from "./Dealer";
import Players from "./Players";
import PlayerController from "./PlayerController";
import MultiplayerTable, {
    ChairName,
} from "@/components/Multiplayer/MultiplayerTable";
import { DEALER_SEAT, PLAYER_SEATS } from "./playerSeats";
import { usePlayerControllerStore } from "@/hooks/usePlayerControllerStore";

function Hand({ cards = [], z, reducedMotion, cardAppearance }) {
    const spacing = Math.min(0.92, 6 / Math.max(cards.length, 1));

    return cards.map((card, index) => (
        <PlayingCard
            key={index}
            number={card.number}
            suit={card.suit}
            position={[
                (index - (cards.length - 1) / 2) * spacing,
                0.105 + index * 0.003,
                z,
            ]}
            delay={index * 0.12}
            reducedMotion={reducedMotion}
            appearance={cardAppearance}
        />
    ));
}

function ChipStack({ position, color, count }) {
    return (
        <group position={position}>
            {Array.from({ length: count }, (_, index) => (
                <group
                    key={index}
                    position={[0, index * 0.07, 0]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                    >
                        <cylinderGeometry args={[0.23, 0.23, 0.065, 32]} />
                        <meshStandardMaterial
                            color={color}
                            roughness={0.55}
                        />
                    </mesh>
                    <mesh
                        position={[0, 0.034, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <ringGeometry args={[0.15, 0.17, 32]} />
                        <meshStandardMaterial color="#eee4c6" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Scene construction stays separate from the canvas and the game's controls.
export default function GameScene({
    player,
    dealer,
    currentBet,
    reducedMotion = false,
    cardAppearance,
    multiplayer = false,
}) {
    const invalidate = useThree((state) => state.invalidate);
    const playerMode = usePlayerControllerStore((state) => state.enabled);

    useEffect(() => {
        // Render the cleared table even after the last card stops requesting frames.
        invalidate();
    }, [currentBet, player, dealer, invalidate]);

    return (
        <>
            <color
                attach="background"
                args={["#191612"]}
            />
            <ambientLight intensity={0.75} />
            <hemisphereLight args={["#fff0d2", "#263a2b", 1.2]} />
            {!playerMode && (
                <SceneOrbitControls reducedMotion={reducedMotion} />
            )}
            <GameRoom reducedMotion={reducedMotion} />
            <Suspense fallback={null}>
                <Dealer />
                <PlayerController
                    key={multiplayer ? "multiplayer" : "solo"}
                    multiplayer={multiplayer}
                />
                {multiplayer && <Players />}
                <ChairName
                    seat={DEALER_SEAT}
                    nickname="Dealer"
                />
                {!multiplayer && (
                    <ChairName
                        seat={PLAYER_SEATS[0]}
                        nickname="You"
                    />
                )}
            </Suspense>
            {/* Include corner furniture in the shadow camera's coverage. */}
            <directionalLight
                position={[3, 7, 4]}
                intensity={2.4}
                color="#ffedcf"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-22}
                shadow-camera-right={22}
                shadow-camera-top={22}
                shadow-camera-bottom={-22}
                shadow-camera-far={40}
                shadow-normalBias={0.025}
            />
            <pointLight
                position={[-9, 4.5, -8]}
                color="#ffd8a4"
                intensity={65}
                distance={30}
                decay={2}
            />
            <pointLight
                position={[9, 4.5, 8]}
                color="#ffe6be"
                intensity={65}
                distance={30}
                decay={2}
            />

            <mesh
                position={[0, -0.16, 0]}
                scale={[4.35, 1, 2.95]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[1, 1, 0.38, 96]} />
                <meshStandardMaterial
                    color="#35251f"
                    roughness={0.75}
                />
            </mesh>
            <mesh
                position={[0, 0.015, 0]}
                scale={[4.08, 1, 2.68]}
                receiveShadow
            >
                <cylinderGeometry args={[1, 1, 0.1, 96]} />
                <meshStandardMaterial
                    color="#126047"
                    roughness={0.95}
                />
            </mesh>
            <mesh
                position={[0, 0.071, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[3.8, 2.4, 1]}
            >
                <ringGeometry args={[0.985, 1, 96]} />
                <meshStandardMaterial
                    color="#c5a66a"
                    roughness={0.7}
                />
            </mesh>

            {multiplayer && (
                <Suspense fallback={null}>
                    <MultiplayerTable
                        cardAppearance={cardAppearance}
                        reducedMotion={reducedMotion}
                    />
                </Suspense>
            )}

            {!multiplayer && Boolean(currentBet) && (
                <>
                    <Hand
                        cards={dealer?.cards}
                        z={-1.05}
                        reducedMotion={reducedMotion}
                        cardAppearance={cardAppearance}
                    />
                    <Hand
                        cards={player?.cards}
                        z={1.05}
                        reducedMotion={reducedMotion}
                        cardAppearance={cardAppearance}
                    />
                </>
            )}

            {!multiplayer && (
                <>
                    <ChipStack
                        position={[-3.1, 0.105, 0.5]}
                        color="#ba3746"
                        count={4}
                    />
                    <ChipStack
                        position={[-2.65, 0.105, 0.8]}
                        color="#e5d5ae"
                        count={3}
                    />
                    <ChipStack
                        position={[3.1, 0.105, -0]}
                        color="#305cba"
                        count={5}
                    />
                    <CardStack
                        position={[2.8, 0.07, -1.2]}
                        appearance={cardAppearance}
                    />
                    <Ashtray
                        position={[-2.65, 0.07, -0.15]}
                        rotation={[0, 0.35, 0]}
                        reducedMotion={reducedMotion}
                    />
                </>
            )}
        </>
    );
}
