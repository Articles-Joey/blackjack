"use client";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArticlesButton from "./Button";

export default function PlayModeSelect({ value, onChange }) {
    const [anchor, setAnchor] = useState(null);
    return (
        <>
            <ArticlesButton
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                sx={{ width: "100%", mb: "0.5rem" }}
            >
                Play Mode: {value[0].toUpperCase() + value.slice(1)}{" "}
                <ArrowDropDownIcon />
            </ArticlesButton>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
            >
                {["online", "offline", "multiplayer"].map((mode) => (
                    <MenuItem
                        key={mode}
                        selected={mode === value}
                        onClick={() => {
                            setAnchor(null);
                            onChange(mode);
                        }}
                    >
                        {mode[0].toUpperCase() + mode.slice(1)}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
