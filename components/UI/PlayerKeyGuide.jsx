"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "@/hooks/useStore";
import { usePlayerControllerStore } from "@/hooks/usePlayerControllerStore";

export default function PlayerKeyGuide() {
    const enabled = usePlayerControllerStore((state) => state.enabled);
    const seated = usePlayerControllerStore((state) => state.pose.seated);
    const thirdPerson = usePlayerControllerStore((state) => state.thirdPerson);
    const hasCanvas = usePlayerControllerStore((state) =>
        Boolean(state.canvas),
    );
    const hint = usePlayerControllerStore((state) => state.hint);
    const screenshotMode = useStore((state) => state.screenshotMode);
    if (!enabled || !hasCanvas || screenshotMode) return null;

    const guides = seated
        ? [
              ["E", "Stand up"],
              ["Right-drag", "Look around"],
          ]
        : [
              ["WASD", "Move / strafe"],
              ["Mouse", "Look"],
              ["E", "Sit near your seat"],
              ["Esc", "Free cursor"],
              ["Click", "Resume looking"],
          ];
    guides.push(["V", "Switch camera"]);
    if (thirdPerson) guides.push(["Scroll", "Zoom camera"]);

    return (
        <Box
            aria-label="Player controls"
            sx={{
                position: "fixed",
                top: "calc(1rem + env(safe-area-inset-top, 0px))",
                right: "calc(1rem + env(safe-area-inset-right, 0px))",
                zIndex: 3,
                pointerEvents: "none",
                width: "fit-content",
                maxWidth: 230,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(15, 20, 18, 0.82)",
                color: "#fff",
                boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    alignItems: "center",
                    gap: "6px 12px",
                }}
            >
                {guides.map(([key, label]) => (
                    <Box
                        key={key}
                        sx={{ display: "contents" }}
                    >
                        <Box
                            component="kbd"
                            sx={{
                                font: "inherit",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textAlign: "center",
                                px: 0.75,
                                py: 0.25,
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderBottomWidth: 2,
                                borderRadius: 0.75,
                                bgcolor: "rgba(255,255,255,0.08)",
                            }}
                        >
                            {key}
                        </Box>
                        <Typography variant="caption">{label}</Typography>
                    </Box>
                ))}
            </Box>
            {seated && (
                <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, opacity: 0.7 }}
                >
                    Cursor is free while seated.
                </Typography>
            )}
            {!seated && hint.startsWith("Move closer") && (
                <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, color: "#e5c987" }}
                >
                    Move closer to your chair or a free barstool.
                </Typography>
            )}
        </Box>
    );
}
