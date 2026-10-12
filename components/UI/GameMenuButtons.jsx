"use client";

import Box from "@mui/material/Box";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { useStore } from "@/hooks/useStore";

export default function GameMenuButtons() {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", mb: "1rem" }}>
            <GameMenuPrimaryButtonGroup
                useStore={useStore}
                type="GameMenu"
                SettingsOverride={<></>}
                SidebarOverride={<></>}
                LeaveGameOverride={<></>}
            />
            <GameMenuPrimaryButtonGroup
                useStore={useStore}
                type="Landing"
            />
        </Box>
    );
}
