"use client";

import { useId, useMemo } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import {
    CARD_WIDTH,
    CARD_HEIGHT,
    createCardSvgContent,
    getCardAppearance,
} from "./cardArtwork";

export default function CardFace({ number, suit, sx }) {
    const theme = useTheme();
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const appearance = useMemo(() => getCardAppearance(theme), [theme]);
    const artwork = useMemo(
        () =>
            createCardSvgContent(number, suit, appearance, id, undefined, {
                centerStrokeWidth: 1.25,
            }),
        [number, suit, appearance, id],
    );

    return (
        <Box
            component="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
            role="img"
            aria-label={number ? `${number}${suit ?? ""}` : "Face-down card"}
            focusable="false"
            sx={[
                {
                    display: "block",
                    width: "100%",
                    height: "100%",
                    userSelect: "none",
                },
                ...(Array.isArray(sx) ? sx : [sx ?? {}]),
            ]}
            dangerouslySetInnerHTML={{ __html: artwork }}
        />
    );
}
