"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "@/hooks/useStore";
import {
    THIRD_PERSON_MIN_DISTANCE,
    THIRD_PERSON_MAX_DISTANCE,
    usePlayerControllerStore,
} from "@/hooks/usePlayerControllerStore";

export default function CameraDistanceIndicator() {
    const enabled = usePlayerControllerStore((state) => state.enabled);
    const thirdPerson = usePlayerControllerStore((state) => state.thirdPerson);
    const hasCanvas = usePlayerControllerStore((state) =>
        Boolean(state.canvas),
    );
    const distance = usePlayerControllerStore((state) => state.cameraDistance);
    const changedAt = usePlayerControllerStore(
        (state) => state.cameraDistanceChangedAt,
    );
    const screenshotMode = useStore((state) => state.screenshotMode);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const remaining = 3000 - (Date.now() - changedAt);
        if (
            !enabled ||
            !thirdPerson ||
            !hasCanvas ||
            !changedAt ||
            remaining <= 0
        ) {
            setVisible(false);
            return;
        }
        setVisible(true);
        const timer = window.setTimeout(() => setVisible(false), remaining);
        return () => window.clearTimeout(timer);
    }, [enabled, thirdPerson, hasCanvas, changedAt, distance]);

    // Stay mounted so the timeout can animate the panel offscreen before hiding it.
    const shown =
        visible && enabled && thirdPerson && hasCanvas && !screenshotMode;

    const percent =
        ((distance - THIRD_PERSON_MIN_DISTANCE) /
            (THIRD_PERSON_MAX_DISTANCE - THIRD_PERSON_MIN_DISTANCE)) *
        100;

    return (
        <Box
            aria-hidden={!shown}
            sx={{
                position: "fixed",
                right: "calc(1rem + env(safe-area-inset-right, 0px))",
                top: "50%",
                transform: shown
                    ? "translate(0, -50%)"
                    : "translate(calc(100% + 1rem + env(safe-area-inset-right, 0px)), -50%)",
                visibility: shown ? "visible" : "hidden",
                transition:
                    "transform 250ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s",
                transitionDelay: shown ? "0s, 0s" : "0s, 250ms",
                "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                },
                zIndex: 10,
                pointerEvents: "none",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                p: 1.25,
                borderRadius: 2,
                bgcolor: "rgba(15, 20, 18, 0.82)",
                color: "#fff",
                fontVariantNumeric: "tabular-nums",
            }}
        >
            <Typography variant="caption">
                Max {THIRD_PERSON_MAX_DISTANCE.toFixed(1)}
            </Typography>
            <Box
                role="progressbar"
                aria-label="Third person camera distance"
                aria-valuemin={THIRD_PERSON_MIN_DISTANCE}
                aria-valuemax={THIRD_PERSON_MAX_DISTANCE}
                aria-valuenow={distance}
                aria-valuetext={distance.toFixed(1)}
                sx={{
                    position: "relative",
                    width: 8,
                    height: "clamp(80px, 22vh, 180px)",
                    borderRadius: 1,
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        height: `${percent}%`,
                        borderRadius: 1,
                        bgcolor: "#e5c987",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: `${percent}%`,
                        left: "50%",
                        transform: "translate(-50%, 50%)",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        boxShadow: "0 1px 5px #000",
                    }}
                />
            </Box>
            <Typography variant="caption">
                Min {THIRD_PERSON_MIN_DISTANCE.toFixed(1)}
            </Typography>
            <Typography
                variant="body2"
                sx={{ fontWeight: 700 }}
            >
                {distance.toFixed(1)}
            </Typography>
        </Box>
    );
}
