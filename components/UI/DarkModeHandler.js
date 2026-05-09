"use client"
import { useStore } from '@/hooks/useStore';
import { useEffect } from "react";

// import { useEightBallStore } from "@/hooks/useEightBallStore";
// import { useStore } from "../hooks/useStore";

export default function DarkModeHandler({ children }) {

    // const theme = useEightBallStore(state => state.theme);
    const darkMode = useStore((state) => state.darkMode);

    useEffect(() => {

        if (darkMode == null) {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            useStore.getState().setDarkMode(prefersDark ? true : false);
        }

        if (darkMode) {
            document.body.setAttribute("data-bs-theme", 'dark');
        } else {
            document.body.setAttribute("data-bs-theme", 'light');
        }

    }, [darkMode]);

    return (
        <>
        </>
    );
}
