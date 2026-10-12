"use client";
import ArticlesButton from "./Button";
import {
    capturePlayerPointer,
    usePlayerControllerStore,
} from "@/hooks/usePlayerControllerStore";

export default function PlayerControls() {
    const enabled = usePlayerControllerStore((s) => s.enabled);
    const thirdPerson = usePlayerControllerStore((s) => s.thirdPerson);
    return (
        <>
            <ArticlesButton
                sx={{ width: "100%", mb: "0.5rem" }}
                onClick={() => {
                    usePlayerControllerStore.getState().setEnabled(!enabled);
                    if (!enabled) capturePlayerPointer();
                }}
            >
                Player Mode: {enabled ? "On" : "Off"}
            </ArticlesButton>
            {enabled && (
                <>
                    <ArticlesButton
                        small
                        sx={{ width: "100%", mb: "0.5rem" }}
                        onClick={() =>
                            usePlayerControllerStore.getState().toggleCamera()
                        }
                    >
                        Camera: {thirdPerson ? "Third person" : "First person"}{" "}
                        (V)
                    </ArticlesButton>
                </>
            )}
        </>
    );
}
