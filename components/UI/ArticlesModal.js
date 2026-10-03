"use client";

import { useId, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ArticlesButton from "./Button";

export default function ArticlesModal({
    show = true,
    setShow,
    action,
    actionText,
    closeAction,
    closeText,
    title,
    children,
    backdrop,
    disableClose,
    disableAction,
    className,
    modalClassName,
    centered,
    scrollable,
    size,
    actionVariant,
    footerOverride,
}) {
    const [closing, setClosing] = useState(false);
    const titleId = useId();
    const setOpen = (open) => setClosing(!open);
    const close = () => setClosing(true);

    return (
        <Dialog
            className={modalClassName}
            aria-labelledby={titleId}
            maxWidth={size || "md"}
            fullWidth
            open={Boolean(show) && !closing}
            scroll={scrollable === false ? "body" : "paper"}
            hideBackdrop={backdrop === false}
            disableEscapeKeyDown={Boolean(disableClose)}
            onClose={(_, reason) => {
                if (disableClose || (backdrop === "static" && reason === "backdropClick")) return;
                close();
            }}
            slotProps={{
                paper: {
                    sx: {
                        ...(centered === false && { alignSelf: "flex-start", mt: 4 }),
                    },
                },
                transition: {
                    onExited: () => {
                        setShow?.(false);
                        setClosing(false);
                    },
                },
            }}
        >
            <DialogTitle id={titleId} sx={{ pr: disableClose ? 3 : 7 }}>
                {title || "Info"}
                {!disableClose && (
                    <IconButton aria-label="Close dialog" onClick={close} sx={{ position: "absolute", right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent className={className}>{children ?? "..."}</DialogContent>
            <DialogActions sx={{ justifyContent: "space-between" }}>
                {footerOverride ? (
                    typeof footerOverride === "function" ? footerOverride(setOpen) : footerOverride
                ) : (
                    <>
                        {!action && <Box />}
                        {(!disableClose || closeAction) && (
                            <ArticlesButton variant="outline-dark" onClick={closeAction || close}>
                                {closeText || "Close"}
                            </ArticlesButton>
                        )}
                        {action && (
                            <ArticlesButton
                                variant={actionVariant || "articles"}
                                disabled={disableAction}
                                onClick={() => action(setOpen)}
                            >
                                {actionText || "Continue"}
                            </ArticlesButton>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
