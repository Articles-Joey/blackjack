"use client";

import { useAudioStore } from "@/hooks/useAudioStore";
import { useStore } from "@/hooks/useStore";
import { useEffect, useRef } from "react";

export default function AudioHandler() {

    const audioSettings = useAudioStore((state) => state?.audioSettings);
    const setAudioSettings = useAudioStore((state) => state?.setAudioSettings);

    const musicRef = useRef(null);
    const interactedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const music = new Audio();
        music.preload = 'none';
        music.src = `/audio/tunetank-jazz-cafe-background-348913-compressed.mp3`;
        musicRef.current = music;

        music.onended = function () {
            music.currentTime = 0;
            music.play();
        };

        const tryPlay = () => {
            if (!interactedRef.current && audioSettings?.enabled) {
                interactedRef.current = true;
                music.play();
            }
        };

        if (audioSettings?.enabled) {
            if (interactedRef.current) {
                music.play();
            } else {
                const events = ['click', 'keydown', 'touchstart', 'pointerdown'];
                events.forEach((e) => document.addEventListener(e, tryPlay, { once: true }));

                return () => {
                    events.forEach((e) => document.removeEventListener(e, tryPlay));
                    music.pause();
                };
            }
        }

        return () => {
            music.pause();
        };
    }, [audioSettings?.enabled]);

    useEffect(() => {
        if (musicRef.current) {
            musicRef.current.volume = audioSettings?.enabled ? (audioSettings?.music_volume / 100) : 0;
        }
    }, [audioSettings?.music_volume, audioSettings?.enabled]);

    return null;

}