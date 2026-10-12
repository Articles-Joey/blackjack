"use client";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import ArticlesButton from "@/components/UI/Button";
import PlayModeSelect from "@/components/UI/PlayModeSelect";
import PlayerControls from "@/components/UI/PlayerControls";
import GameMenuButtons from "@/components/UI/GameMenuButtons";
import { usePeerStore } from "@/hooks/usePeerStore";

export default function MultiplayerSidebar({
    onChangePlayMode,
    is3DMode,
    setIs3DMode,
}) {
    const state = usePeerStore();
    const [joining, setJoining] = useState(false);
    const [room, setRoom] = useState("");
    const [nickname, setNickname] = useState(state.nickname);
    useEffect(() => {
        setNickname(state.nickname);
    }, [state.nickname]);
    const connected = state.status === "connected";
    const busy = state.status === "connecting";
    useEffect(() => {
        if (connected) setJoining(false);
    }, [connected]);
    return (
        <Box
            sx={{
                p: 1,
                zIndex: 2,
                position: "relative",
                width: { xs: "100%", md: 300 },
                maxHeight: { md: "100dvh" },
                overflowY: "auto",
                flexShrink: 0,
            }}
        >
            <PlayModeSelect
                value="multiplayer"
                onChange={onChangePlayMode}
            />
            {!connected && (
                <Box sx={{ display: "flex", mb: 1 }}>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        disabled={busy}
                        onClick={() => {
                            state.setNickname(nickname);
                            state.startSession();
                        }}
                    >
                        Start Game
                    </ArticlesButton>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        disabled={busy}
                        onClick={() => {
                            state.clearError();
                            setJoining(true);
                        }}
                    >
                        Join Game
                    </ArticlesButton>
                </Box>
            )}
            {busy && (
                <Box sx={{ bgcolor: "game.card", p: 1, mb: 1 }}>
                    <Typography>Connecting…</Typography>
                    <ArticlesButton
                        small
                        onClick={() => state.disconnect()}
                    >
                        Cancel
                    </ArticlesButton>
                </Box>
            )}
            {state.error && (
                <Alert
                    severity="info"
                    sx={{ mb: 1 }}
                >
                    {state.error}
                </Alert>
            )}
            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault();
                    state.setNickname(nickname);
                }}
                sx={{
                    display: "flex",
                    gap: 0.5,
                    p: 1,
                    bgcolor: "game.card",
                    mb: 1,
                    borderRadius: 1,
                }}
            >
                <TextField
                    label="Nickname"
                    size="small"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    slotProps={{ htmlInput: { maxLength: 24 } }}
                />
                <ArticlesButton
                    type="submit"
                    small
                    disabled={!nickname.trim()}
                >
                    {connected ? "Update" : "Save"}
                </ArticlesButton>
            </Box>
            <ArticlesButton
                sx={{ width: "100%", mb: 1 }}
                onClick={() => setIs3DMode(!is3DMode)}
            >
                3D Mode: {is3DMode ? "On" : "Off"}
            </ArticlesButton>
            {is3DMode && <PlayerControls />}
            {connected && (
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: "game.card",
                        borderRadius: 1,
                        mb: 1,
                    }}
                >
                    <Typography variant="h6">Room {state.roomId}</Typography>
                    <Typography variant="body2">
                        Share this six digit ID ·{" "}
                        {Object.keys(state.players).length}/7 players
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: 700 }}>
                        Session leaderboard
                    </Typography>
                    {Object.values(state.players)
                        .sort((a, b) => b.wallet - a.wallet)
                        .map((player, index) => (
                            <Box
                                key={player.id}
                                sx={{
                                    py: 1,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Typography sx={{ overflowWrap: "anywhere" }}>
                                    {index + 1}. {player.nickname}
                                    {player.id === state.selfId
                                        ? " (you)"
                                        : ""}{" "}
                                    — <b>{player.wallet}</b>
                                </Typography>
                                <Typography variant="caption">
                                    {player.status} · W {player.wins} / L{" "}
                                    {player.losses} / P {player.pushes}
                                </Typography>
                                {state.isHost && player.id !== state.selfId && (
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <ArticlesButton
                                            small
                                            onClick={() =>
                                                state.kickPlayer(player.id)
                                            }
                                        >
                                            Kick
                                        </ArticlesButton>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    <Typography
                        variant="body2"
                        sx={{ my: 1 }}
                    >
                        Everyone starts with 100 session points. These points
                        disappear when you leave. Only the host can reset
                        balances between hands.
                    </Typography>
                    <Box sx={{ display: "flex" }}>
                        {state.isHost && (
                            <ArticlesButton
                                small
                                sx={{ width: "50%" }}
                                title="Reset every player's session balance to 100"
                                disabled={
                                    state.phase === "playing" ||
                                    (state.phase === "betting" &&
                                        Object.values(state.players).some(
                                            (player) => player.bet,
                                        ))
                                }
                                onClick={state.resetBalances}
                            >
                                Reset to 100
                            </ArticlesButton>
                        )}
                        <ArticlesButton
                            small
                            sx={{ width: state.isHost ? "50%" : "100%" }}
                            onClick={() => state.disconnect()}
                        >
                            {state.isHost ? "End Game" : "Leave Game"}
                        </ArticlesButton>
                    </Box>
                </Box>
            )}
            <Box sx={{ pt: 1 }}>
                <GameMenuButtons />
            </Box>
            <Dialog
                open={joining}
                onClose={() => !busy && setJoining(false)}
                fullWidth
                maxWidth="xs"
            >
                <Box
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        state.setNickname(nickname);
                        state.startSession(room);
                    }}
                >
                    <DialogTitle>Join a multiplayer room</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            margin="dense"
                            label="Six digit room ID"
                            value={room}
                            onChange={(event) =>
                                setRoom(
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6),
                                )
                            }
                            slotProps={{
                                htmlInput: {
                                    inputMode: "numeric",
                                    maxLength: 6,
                                },
                            }}
                        />
                        {state.error && (
                            <Alert severity="error">{state.error}</Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <ArticlesButton
                            onClick={() => {
                                if (busy) state.disconnect();
                                setJoining(false);
                            }}
                        >
                            Cancel
                        </ArticlesButton>
                        <ArticlesButton
                            type="submit"
                            disabled={busy || room.length !== 6}
                        >
                            {busy ? "Connecting…" : "Join Game"}
                        </ArticlesButton>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
