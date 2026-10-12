"use client";

import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArticlesButton from "./Button";
import { CLAIM_INTERVAL } from "@/hooks/useOfflineScoreStore";

export default function DailyClaim({
    isOffline,
    userDetails,
    lastClaim,
    claim,
    getWalletBalance,
}) {
    const [now, setNow] = useState(() => Date.now());
    const nextClaim = lastClaim
        ? new Date(lastClaim).getTime() + CLAIM_INTERVAL
        : null;
    const available = nextClaim === null || now >= nextClaim;

    useEffect(() => {
        setNow(Date.now());
    }, [lastClaim]);

    return (
        <Box
            sx={{
                bgcolor: "game.card",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "0.375rem",
                mb: "0.5rem",
            }}
        >
            <Box
                sx={{
                    p: "0.5rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        m: 0,
                        fontSize: "1rem",
                        fontWeight: 500,
                        lineHeight: 1.2,
                    }}
                >
                    {isOffline ? "Offline Daily Claim" : "Next Claim"}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "#000",
                            color: "#fff",
                            fontSize: "0.75em",
                            fontWeight: 700,
                            px: "0.65em",
                            py: "0.35em",
                            borderRadius: "0.375rem",
                        }}
                    >
                        {available ? (
                            "Available now"
                        ) : (
                            <Countdown
                                key={nextClaim}
                                daysInHours
                                date={nextClaim}
                                onComplete={() => setNow(Date.now())}
                            />
                        )}
                    </Box>
                    {!isOffline && (
                        <IconButton
                            aria-label="Refresh wallet balance"
                            sx={{
                                bgcolor: "#212529",
                                color: "#fff",
                                p: "0.15rem",
                                borderRadius: "0.375rem",
                                "&:hover": { bgcolor: "#000" },
                            }}
                            onClick={() => getWalletBalance()}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            </Box>
            <Box sx={{ p: "0.5rem" }}>
                <Box>
                    <small>One claim per 24 hours</small>
                </Box>
                <ArticlesButton
                    disabled={
                        !available || (!isOffline && !userDetails?.user_id)
                    }
                    sx={{ mb: "0.25rem", width: "100%" }}
                    onClick={() => claim(userDetails)}
                >
                    Claim 100 Points
                </ArticlesButton>
                {nextClaim !== null &&
                    Number.isFinite(nextClaim) &&
                    !available && (
                        <Box sx={{ lineHeight: 1.25 }}>
                            <small>
                                Next claim{" "}
                                {format(
                                    new Date(nextClaim),
                                    "MM/dd/yy hh:mmaa",
                                )}
                            </small>
                        </Box>
                    )}
            </Box>
        </Box>
    );
}
