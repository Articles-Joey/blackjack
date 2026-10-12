"use client";

import Box from "@mui/material/Box";
import CardFace from "./CardFace";

export default function GameCard({ number, suit }) {
    return (
        <td>
            <Box
                sx={{
                    height: "100px",
                    width: "66px",
                    bgcolor: "game.card",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "0.375rem",
                    overflow: "hidden",
                    "@media (min-width: 992px)": {
                        height: "150px",
                        width: "100px",
                    },
                }}
            >
                <CardFace
                    number={number}
                    suit={suit}
                />
            </Box>
        </td>
    );
}
