"use client";
import { create } from "zustand";
import {
    PLAYER_SCALE,
    PLAYER_SEATS,
    seatPose,
} from "@/components/Game/playerSeats";

export const THIRD_PERSON_MIN_DISTANCE = 1.5 * PLAYER_SCALE;
export const THIRD_PERSON_MAX_DISTANCE = 10 * PLAYER_SCALE;

export const usePlayerControllerStore = create((set) => ({
    enabled: false,
    thirdPerson: true,
    cameraDistance: 4.2 * PLAYER_SCALE,
    cameraDistanceChangedAt: 0,
    setCameraDistance: (distance) => {
        if (!Number.isFinite(distance)) return;
        const cameraDistance = Math.max(
            THIRD_PERSON_MIN_DISTANCE,
            Math.min(THIRD_PERSON_MAX_DISTANCE, distance),
        );
        set((state) =>
            state.cameraDistance === cameraDistance
                ? state
                : { cameraDistance, cameraDistanceChangedAt: Date.now() },
        );
    },
    pose: seatPose(PLAYER_SEATS[0]),
    canvas: null,
    hint: "E: stand up · V: camera",
    setEnabled: (enabled) => {
        if (
            !enabled &&
            typeof document !== "undefined" &&
            document.pointerLockElement
        )
            document.exitPointerLock();
        set({ enabled });
    },
    toggleCamera: () => set((state) => ({ thirdPerson: !state.thirdPerson })),
}));

export function capturePlayerPointer(force = false) {
    const { enabled, pose, canvas } = usePlayerControllerStore.getState();
    if (
        !enabled ||
        (!force && pose.seated) ||
        !canvas ||
        document.pointerLockElement === canvas
    )
        return;
    try {
        canvas.tabIndex = 0;
        canvas.focus({ preventScroll: true });
        const request = canvas.requestPointerLock?.();
        request?.catch?.(() => {}); // Esc/browser denial leaves the UI usable.
    } catch {
        /* Clicking the scene can retry after a browser lock cooldown. */
    }
}
