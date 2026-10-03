"use client";

import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    const cardBackground = mode === "dark" ? "#313131" : "#fff";

    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: { main: "#f9edcd" },
            game: { card: cardBackground },
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { fontSize: "0.75rem" },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [{
                            props: { severity: "info" },
                            style: { backgroundColor: "#60a5fa" },
                        }],
                    },
                },
            },
            MuiCssBaseline: {
                // Dev-box still uses these compatibility utilities internally.
                styleOverrides: (muiTheme) => ({
                    ...bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(muiTheme),
                    ":root": {
                        "--card-background-override": cardBackground,
                        "--articles-card-font-color": mode === "dark" ? "#fff" : "#212529",
                    },
                }),
            },
        },
    });
}

export default createAppTheme();
