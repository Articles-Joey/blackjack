"use client";

import { Component, Suspense, useMemo } from "react";
import { Physics } from "@react-three/rapier";
import { JUMP_GRAVITY } from "./playerJump";
import { Canvas } from "@react-three/fiber";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ArticlesButton from "@/components/UI/Button";
import GameScene from "./GameScene";
import CardFacePreview from "./CardFacePreview";
import { getCardAppearance } from "./cardArtwork";
import { Stats } from "@react-three/drei";
import { useStore } from "@/hooks/useStore";
import CameraDistanceIndicator from "@/components/UI/CameraDistanceIndicator";
import PlayerKeyGuide from "@/components/UI/PlayerKeyGuide";

class CanvasErrorBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

export default function GameCanvas({
    player,
    dealer,
    currentBet,
    onDisable3D,
    showCardFaces = false,
    multiplayer = false,
}) {
    const showStats = useStore((state) => state?.debugConfig?.showStats);
    const debug = useStore((state) => state.debug);
    const theme = useTheme();
    const cardAppearance = useMemo(() => getCardAppearance(theme), [theme]);
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const fallback = (
        <Box
            role="status"
            sx={{
                position: "absolute",
                bottom: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                p: "1rem",
                textAlign: "center",
                color: "#fff",
                bgcolor: "#191612",
                borderRadius: "0.5rem",
            }}
        >
            <Typography sx={{ mb: "1rem" }}>
                3D is unavailable on this device.
            </Typography>
            <ArticlesButton onClick={onDisable3D}>Use 2D Mode</ArticlesButton>
        </Box>
    );

    return (
        <>
            <Box
                role="region"
                aria-label={
                    showCardFaces
                        ? "All 52 card faces, arranged A through K in rows of hearts, diamonds, clubs, and spades. Drag to pan and scroll or pinch to zoom."
                        : "3D blackjack room. Drag the background to orbit and scroll or pinch to zoom."
                }
                sx={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100dvh",
                    zIndex: 0,
                    pointerEvents: "auto",
                    touchAction: "none",
                    overflow: "hidden",
                    bgcolor: "#191612",
                }}
            >
                <CanvasErrorBoundary fallback={fallback}>
                    <Canvas
                        key={showCardFaces ? "card-preview" : "game-room"}
                        orthographic={showCardFaces}
                        shadows
                        frameloop={showCardFaces ? "demand" : "always"}
                        dpr={[1, 1.5]}
                        camera={
                            showCardFaces
                                ? {
                                      position: [0, 14, 0.001],
                                      near: 0.1,
                                      far: 80,
                                      zoom: 1,
                                  }
                                : {
                                      position: [6, 6.5, 8.5],
                                      fov: 48,
                                      near: 0.1,
                                      far: 80,
                                  }
                        }
                        gl={{ antialias: true, alpha: false }}
                        fallback={fallback}
                    >
                        {showStats && (
                            <>
                                <Stats className="stats-overlay" />
                            </>
                        )}
                        {showCardFaces ? (
                            <CardFacePreview cardAppearance={cardAppearance} />
                        ) : (
                            <Suspense fallback={null}>
                                <Physics
                                    debug={debug ? true : false}
                                    gravity={[0, -JUMP_GRAVITY, 0]}
                                    timeStep={1 / 60}
                                    updatePriority={-1}
                                >
                                    <GameScene
                                        player={player}
                                        dealer={dealer}
                                        currentBet={currentBet}
                                        reducedMotion={reducedMotion}
                                        cardAppearance={cardAppearance}
                                        multiplayer={multiplayer}
                                    />
                                </Physics>
                            </Suspense>
                        )}
                    </Canvas>
                </CanvasErrorBoundary>
            </Box>
            {!showCardFaces && <CameraDistanceIndicator />}
            {!showCardFaces && <PlayerKeyGuide />}
        </>
    );
}
