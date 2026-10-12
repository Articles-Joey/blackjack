"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { usePlayerControllerStore } from "@/hooks/usePlayerControllerStore";

function HandSummary({ label, hand }) {
    const cards = hand?.cards ?? [];
    return (
        <Typography variant="body2">
            {label} ({hand?.count ?? 0}):{" "}
            {cards.length
                ? cards
                      .map((card) =>
                          card.number
                              ? `${card.number}${card.suit}`
                              : "Face down",
                      )
                      .join(", ")
                : "No cards"}
        </Typography>
    );
}

export default function GameHandSummary({ player, dealer, currentBet }) {
    const playerMode = usePlayerControllerStore((state) => state.enabled);

    return (
        <Box
            aria-live="polite"
            aria-atomic="true"
            sx={{
                textAlign: "center",
                mt: "0.5rem",
            }}
        >
            <Paper
                sx={(theme) => ({
                    p: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                })}
            >
                <HandSummary
                    label="Your Hand"
                    hand={currentBet ? player : undefined}
                />
                <HandSummary
                    label="Dealer's Hand"
                    hand={currentBet ? dealer : undefined}
                />
                <Typography variant="body2">
                    {currentBet
                        ? `Current bet: ${currentBet} points`
                        : "Place a bet to deal the cards."}
                </Typography>
                {!playerMode && (
                    <Typography
                        variant="caption"
                        sx={{ display: "block", mt: "0.5rem" }}
                    >
                        Drag the background to orbit · Scroll or pinch to zoom
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
