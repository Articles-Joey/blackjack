"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ArticlesButton from "@/components/UI/Button";
import Card from "@/components/Game/GameCard";

const panelSx = {
    minWidth: 0,
    p: 2,
    bgcolor: "game.card",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
    pointerEvents: "auto",
};

function HandDetails({ label, hand, showCards }) {
    const cards = hand?.cards ?? [];
    return (
        <Box sx={{ minWidth: 0 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 0.5,
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                >
                    {hand?.count ?? 0}
                </Typography>
            </Box>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
            >
                {cards.length
                    ? cards
                          .map((card) =>
                              card.number
                                  ? `${card.number}${card.suit}`
                                  : "Face down",
                          )
                          .join(" · ")
                    : "No cards yet"}
            </Typography>
            {showCards && cards.length > 0 && (
                <Box sx={{ overflowX: "auto", mt: 1 }}>
                    <table>
                        <tbody>
                            <tr>
                                {cards.map((card, index) => (
                                    <Card
                                        key={index}
                                        number={card.number}
                                        suit={card.suit}
                                    />
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </Box>
            )}
        </Box>
    );
}

export default function MultiplayerGameCards({ state, is3DMode, onPlay }) {
    const self = state.players[state.selfId];
    const canDeal = Object.values(state.players).some((player) => player.bet);
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
                width: 820,
                maxWidth: "100%",
                pointerEvents: "none",
            }}
        >
            <Box
                component="section"
                aria-label="Betting and game controls"
                sx={panelSx}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        alignItems: "baseline",
                        mb: 0.5,
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                    >
                        {self.nickname}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        <b>{self.wallet}</b> points
                    </Typography>
                </Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1.5 }}
                >
                    Round {state.round || 1} · {state.phase}
                </Typography>
                {state.phase === "betting" && !self.bet && (
                    <Box
                        component="form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            state.placeBet();
                        }}
                        sx={{ mb: 1.5 }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mb: 1,
                            }}
                        >
                            {[1, 5, 20, 50, 100].map((amount) => (
                                <ArticlesButton
                                    key={amount}
                                    small
                                    onClick={() => state.setInputValue(amount)}
                                >
                                    {amount}
                                </ArticlesButton>
                            ))}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                size="small"
                                label="Bet"
                                value={state.inputValue}
                                onChange={(event) =>
                                    state.setInputValue(event.target.value)
                                }
                                sx={{ flex: 1, minWidth: 0 }}
                                slotProps={{
                                    htmlInput: { inputMode: "numeric" },
                                }}
                            />
                            <ArticlesButton
                                type="submit"
                                small
                            >
                                Place Bet
                            </ArticlesButton>
                        </Box>
                    </Box>
                )}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {self.status === "playing" && (
                        <>
                            <ArticlesButton
                                small
                                onClick={() => onPlay(state.hit)}
                            >
                                Hit
                            </ArticlesButton>
                            <ArticlesButton
                                small
                                onClick={() => onPlay(state.stand)}
                            >
                                Stand
                            </ArticlesButton>
                        </>
                    )}
                    {state.isHost && state.phase === "betting" && (
                        <ArticlesButton
                            small
                            disabled={!canDeal}
                            onClick={() => onPlay(state.dealRound)}
                        >
                            Deal Round
                        </ArticlesButton>
                    )}
                    {state.isHost && state.phase === "finished" && (
                        <ArticlesButton
                            small
                            onClick={state.nextRound}
                        >
                            Next Round
                        </ArticlesButton>
                    )}
                </Box>
                <Box
                    role="status"
                    sx={{ mt: 1.5 }}
                >
                    {self.message && (
                        <Typography variant="body2">
                            {state.isHost &&
                            self.status === "ready" &&
                            self.message === "Waiting for the host to deal."
                                ? "Deal when everyone is ready."
                                : self.message}
                        </Typography>
                    )}
                    {!state.isHost &&
                        state.phase === "betting" &&
                        !self.bet && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Place your bet; the host deals when everyone is
                                ready.
                            </Typography>
                        )}
                    {!state.isHost && state.phase === "finished" && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Waiting for the next round.
                        </Typography>
                    )}
                    {!self.bet && state.phase === "playing" && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Watching this hand. You can bet next round.
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box
                component="section"
                aria-label="Your hand and dealer hand"
                aria-live="polite"
                sx={{
                    ...panelSx,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <HandDetails
                    label="Your Hand"
                    hand={self.bet ? self.hand : undefined}
                    showCards={!is3DMode}
                />
                <Box
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        pt: 1.5,
                    }}
                >
                    <HandDetails
                        label="Dealer's Hand"
                        hand={state.dealer}
                        showCards={!is3DMode}
                    />
                </Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: "auto",
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    {self.bet ? (
                        <>
                            Current bet: <b>{self.bet} points</b>
                        </>
                    ) : (
                        "Place a bet to join the next deal."
                    )}
                </Typography>
                {!is3DMode &&
                    Object.values(state.players)
                        .filter((player) => player.id !== self.id)
                        .map((player) => (
                            <HandDetails
                                key={player.id}
                                label={player.nickname}
                                hand={player.hand}
                                showCards
                            />
                        ))}
            </Box>
        </Box>
    );
}
