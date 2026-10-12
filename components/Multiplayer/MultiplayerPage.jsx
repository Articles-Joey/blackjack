"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AudioHandler from "@/components/AudioHandler";
import { useAudioStore } from "@/hooks/useAudioStore";
import { usePeerStore } from "@/hooks/usePeerStore";
import {
    capturePlayerPointer,
    usePlayerControllerStore,
} from "@/hooks/usePlayerControllerStore";
import MultiplayerSidebar from "./MultiplayerSidebar";
import MultiplayerGameCards from "./MultiplayerGameCards";
import { PLAYER_SEATS, seatPose } from "@/components/Game/playerSeats";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
});
export default function MultiplayerPage({
    onChangePlayMode,
    is3DMode,
    setIs3DMode,
}) {
    const state = usePeerStore();
    const self = state.players[state.selfId];
    useEffect(() => {
        usePlayerControllerStore.getState().setEnabled(true);
        setIs3DMode(true);
        const unload = () => usePeerStore.getState().disconnect();
        window.addEventListener("pagehide", unload);
        return () => {
            window.removeEventListener("pagehide", unload);
            unload();
            usePlayerControllerStore.getState().setEnabled(false);
            usePlayerControllerStore.setState({
                pose: seatPose(PLAYER_SEATS[0]),
            });
        };
    }, [setIs3DMode]);
    const play = (action) => {
        action();
        useAudioStore.getState().playCardSound();
        capturePlayerPointer();
    };
    return (
        <Box
            id="fullscreen-root"
            sx={{
                position: "relative",
                isolation: "isolate",
                minHeight: "100dvh",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
            }}
        >
            <AudioHandler />
            {is3DMode && (
                <GameCanvas
                    multiplayer
                    onDisable3D={() => setIs3DMode(false)}
                />
            )}
            <MultiplayerSidebar
                onChangePlayMode={onChangePlayMode}
                is3DMode={is3DMode}
                setIs3DMode={setIs3DMode}
            />
            <Box
                sx={{
                    zIndex: 1,
                    minWidth: 0,
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: "none",
                    ...(!self
                        ? {
                              position: "fixed",
                              left: 0,
                              right: 0,
                              bottom: "env(safe-area-inset-bottom, 0px)",
                          }
                        : is3DMode
                          ? {
                                position: { md: "fixed" },
                                left: 300,
                                right: 0,
                                bottom: "env(safe-area-inset-bottom, 0px)",
                                maxHeight: "45dvh",
                                overflowY: "auto",
                            }
                          : { flex: 1, alignSelf: "center" }),
                }}
            >
                {self ? (
                    <MultiplayerGameCards
                        state={state}
                        is3DMode={is3DMode}
                        onPlay={play}
                    />
                ) : (
                    <Box
                        sx={{
                            width: "fit-content",
                            maxWidth: 460,
                            p: 2.5,
                            bgcolor: "game.card",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            textAlign: "center",
                            boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
                            pointerEvents: "auto",
                        }}
                    >
                        <Typography>
                            Start a game or join a room to play with friends.
                            Each player receives 100 session points and their
                            own chair.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
