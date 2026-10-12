"use client";
import { Suspense, useEffect, useState, lazy } from "react";
import dynamic from "next/dynamic";

import { differenceInHours } from "date-fns";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const Ad = lazy(() => import("@articles-media/articles-dev-box/Ad"));
// import Ad from '@articles-media/articles-dev-box/Ad';

import ArticlesButton from "@/components/UI/Button";

import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";

import { useStore } from "@/hooks/useStore";
import { useGameState } from "@/hooks/useGameState";
import {
    OFFLINE_STORAGE_KEY,
    useOfflineScoreStore,
} from "@/hooks/useOfflineScoreStore";
import Sidebar from "@/components/UI/Sidebar";
import SessionButton from "@articles-media/articles-dev-box/SessionButton";
import AudioHandler from "@/components/AudioHandler";
import GameHandSummary from "@/components/Game/GameHandSummary";
import Card from "@/components/Game/GameCard";
import { useAudioStore } from "@/hooks/useAudioStore";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
    loading: () => (
        <Box
            role="status"
            sx={{ position: "fixed", bottom: "1rem", left: "1rem", zIndex: 0 }}
        >
            Loading 3D room…
        </Box>
    ),
});

export default function BlackjackPage() {
    const [is3DMode, setIs3DMode] = useState(false);
    const [showCardFaces, setShowCardFaces] = useState(false);
    const playMode = useOfflineScoreStore((state) => state.playMode);
    const hasHydrated = useOfflineScoreStore((state) => state._hasHydrated);
    const setPlayMode = useOfflineScoreStore((state) => state.setPlayMode);

    useEffect(() => {
        // Restore the selected mode before mounting any online session hooks.
        const hydrate = () => {
            const finish = () =>
                useOfflineScoreStore.getState().finishHydration();
            Promise.resolve(useOfflineScoreStore.persist?.rehydrate()).then(
                finish,
                finish,
            );
        };
        hydrate();
        const syncTabs = (event) => {
            if (event.key === OFFLINE_STORAGE_KEY || event.key === null)
                hydrate();
        };
        window.addEventListener("storage", syncTabs);
        return () => window.removeEventListener("storage", syncTabs);
    }, []);

    if (!hasHydrated)
        return (
            <Box
                role="status"
                sx={{ p: "2rem" }}
            >
                Loading play mode…
            </Box>
        );

    const viewProps = {
        is3DMode,
        setIs3DMode,
        showCardFaces,
        setShowCardFaces,
        onTogglePlayMode: () =>
            setPlayMode(playMode === "offline" ? "online" : "offline"),
        onPlayOffline: () => setPlayMode("offline"),
    };

    return playMode === "offline" ? (
        <OfflineBlackjackPage {...viewProps} />
    ) : (
        <OnlineBlackjackPage {...viewProps} />
    );
}

function OfflineBlackjackPage(props) {
    const gameState = useOfflineScoreStore();
    return (
        <BlackjackView
            {...props}
            isOffline
            gameState={gameState}
        />
    );
}

function OnlineBlackjackPage(props) {
    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);
    const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails(
        { token: userToken },
    );
    const gameState = useGameState();
    const { getLeaderboard, getWalletBalance } = gameState;

    useEffect(() => {
        getLeaderboard();
    }, [getLeaderboard]);

    useEffect(() => {
        if (userDetails?.user_id && !useGameState.getState().currentBet)
            getWalletBalance();
    }, [userDetails?.user_id, getWalletBalance]);

    return (
        <BlackjackView
            {...props}
            gameState={gameState}
            userToken={userToken}
            userDetails={userDetails}
            userDetailsLoading={userDetailsLoading}
        />
    );
}

function BlackjackView({
    gameState,
    isOffline = false,
    userToken,
    userDetails,
    userDetailsLoading,
    is3DMode,
    setIs3DMode,
    showCardFaces,
    setShowCardFaces,
    onTogglePlayMode,
    onPlayOffline,
}) {
    const darkMode = useStore((state) => state.darkMode);
    const screenshotMode = useStore((state) => state.screenshotMode);
    const previewCards = is3DMode && showCardFaces;

    const {
        wallet,
        inputValue,
        currentBet,
        gameOver,
        player,
        dealer,
        message,
        lastClaim,
        setInputValue,
        startNewGame,
        placeBet,
        hit,
        stand,
    } = gameState;

    return (
        <Box
            sx={(theme) => ({
                position: "relative",
                isolation: "isolate",
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff",
                backgroundImage:
                    theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #071d16, #0b151b)"
                        : "linear-gradient(135deg, #e2efe7, #f8f4e9)",
                "@media (min-width: 992px)": {
                    minHeight: "100vh",
                    pb: 0,
                    flexDirection: "row",
                },
                "& .ad-wrap": {
                    position: "relative",
                    zIndex: 2,
                    mx: "auto",
                    "@media (min-width: 992px)": {
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        right: "1rem",
                    },
                },
            })}
            id="fullscreen-root"
        >
            <AudioHandler />

            {!is3DMode && (
                <Box
                    component="img"
                    src={
                        `img/background-small.jpg`
                        // `${process.env.NEXT_PUBLIC_CDN}games/Blackjack/background-small.jpg`
                    }
                    alt="Poker table background"
                    sx={(theme) => ({
                        position: "fixed",
                        top: 0,
                        opacity: theme.palette.mode === "dark" ? 0.2 : 0.5,
                        height: "100vh",
                        width: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    })}
                />
            )}

            {is3DMode && (
                <GameCanvas
                    player={currentBet ? player : undefined}
                    dealer={currentBet ? dealer : undefined}
                    currentBet={currentBet}
                    onDisable3D={() => setIs3DMode(false)}
                    showCardFaces={previewCards}
                />
            )}

            <Sidebar
                is3DMode={is3DMode}
                onToggle3DMode={() => {
                    setIs3DMode((enabled) => !enabled);
                    setShowCardFaces(false);
                }}
                showCardFaces={previewCards}
                onToggleCardFaces={() =>
                    setShowCardFaces((enabled) => !enabled)
                }
                isOffline={isOffline}
                onTogglePlayMode={onTogglePlayMode}
                gameState={gameState}
                userDetails={userDetails}
            />

            {!previewCards && (
                <Box
                    sx={{
                        position: is3DMode ? "fixed" : undefined,
                        bottom: is3DMode
                            ? "env(safe-area-inset-bottom, 0px)"
                            : undefined,
                        left: is3DMode ? 0 : undefined,
                        right: is3DMode ? 0 : undefined,
                        p: is3DMode ? "0.5rem 1rem" : "3rem 1rem",
                        display: "flex",
                        flexDirection: is3DMode ? "row" : "column",
                        flexWrap: is3DMode ? "wrap" : undefined,
                        gap: is3DMode ? "0.25rem 1rem" : undefined,
                        justifyContent: "center",
                        alignItems: "center",
                        width: is3DMode ? "auto" : "100%",
                        minWidth: 0,
                        maxHeight: is3DMode ? "40dvh" : undefined,
                        overflowY: is3DMode ? "auto" : undefined,
                        zIndex: 1,
                        color: is3DMode ? "#fff" : undefined,
                        textShadow: is3DMode
                            ? "0 1px 4px rgba(0, 0, 0, 0.8)"
                            : undefined,
                        pointerEvents: is3DMode ? "none" : "auto",
                        "& > *": { pointerEvents: "auto", maxWidth: "100%" },
                        "@media (min-width: 992px)": {
                            left: is3DMode ? "calc(300px + 1rem)" : undefined,
                            right: is3DMode ? "calc(250px + 1rem)" : undefined,
                            mx: is3DMode ? 0 : "calc(250px + 1rem)",
                        },
                        ...(screenshotMode && {
                            display: "none!important",
                        }),
                    }}
                >
                    {!is3DMode && (
                        <Box
                            component="img"
                            src="/img/icon.png"
                            height={100}
                            alt=""
                            sx={{ mb: "0.25rem" }}
                        />
                    )}

                    {!isOffline && !userDetails?.user_id ? (
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    mb: "1rem",
                                    mt: "0.5rem",
                                    fontSize: "1.5rem",
                                }}
                            >
                                Please login to play
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    flexWrap: "wrap",
                                    mb: "1.5rem",
                                }}
                            >
                                <SessionButton
                                    port={process.env.NEXT_PUBLIC_GAME_PORT}
                                    size="lg"
                                />

                                <ArticlesButton
                                    size="sm"
                                    onClick={onPlayOffline}
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    <ToggleOnIcon sx={{ mr: "0.25rem" }} />
                                    Offline Play
                                </ArticlesButton>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: "0.5rem" }}>
                                {currentBet && (
                                    <>
                                        <ArticlesButton
                                            small
                                            disabled={
                                                isOffline
                                                    ? !gameOver
                                                    : differenceInHours(
                                                          new Date(),
                                                          new Date(lastClaim),
                                                      ) < 24
                                            }
                                            sx={{ mr: "1.5rem" }}
                                            onClick={() => {
                                                startNewGame();
                                            }}
                                        >
                                            New Game
                                        </ArticlesButton>
                                        <ArticlesButton
                                            small
                                            disabled={gameOver}
                                            onClick={() => {
                                                hit();
                                            }}
                                        >
                                            Hit
                                        </ArticlesButton>
                                        <ArticlesButton
                                            small
                                            disabled={gameOver}
                                            onClick={() => {
                                                stand(userDetails);
                                            }}
                                        >
                                            Stand
                                        </ArticlesButton>
                                    </>
                                )}
                            </Box>

                            <Typography sx={{ mb: "0.5rem" }}>
                                {isOffline ? "Offline Points" : "Points"}:{" "}
                                <b>{wallet}</b>
                            </Typography>

                            {!currentBet ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        mb: "1rem",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            mb: "0.5rem",
                                        }}
                                    >
                                        <Box sx={{ mr: "0.5rem" }}>
                                            <ArticlesButton
                                                onClick={() => {
                                                    setInputValue(1);
                                                }}
                                            >
                                                1
                                            </ArticlesButton>
                                            <ArticlesButton
                                                onClick={() => {
                                                    setInputValue(5);
                                                }}
                                            >
                                                5
                                            </ArticlesButton>
                                            <ArticlesButton
                                                onClick={() => {
                                                    setInputValue(20);
                                                }}
                                            >
                                                20
                                            </ArticlesButton>
                                            <ArticlesButton
                                                onClick={() => {
                                                    setInputValue(50);
                                                }}
                                            >
                                                50
                                            </ArticlesButton>
                                            <ArticlesButton
                                                onClick={() => {
                                                    setInputValue(100);
                                                }}
                                            >
                                                100
                                            </ArticlesButton>
                                        </Box>

                                        <Box
                                            component="form"
                                            onSubmit={(event) =>
                                                event.preventDefault()
                                            }
                                        >
                                            <TextField
                                                size="small"
                                                type="text"
                                                name="bet"
                                                value={
                                                    Number.isNaN(inputValue)
                                                        ? ""
                                                        : (inputValue ?? "")
                                                }
                                                onChange={(e) =>
                                                    setInputValue(
                                                        isOffline
                                                            ? e.target.value.trim() ===
                                                              ""
                                                                ? ""
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                            : parseInt(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                slotProps={{
                                                    htmlInput: {
                                                        "aria-label":
                                                            "Bet amount",
                                                        inputMode: "numeric",
                                                    },
                                                }}
                                                sx={{
                                                    width: "100px",
                                                    bgcolor: is3DMode
                                                        ? "game.card"
                                                        : undefined,
                                                    borderRadius: "0.25rem",
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <ArticlesButton
                                        small
                                        onClick={() => {
                                            useAudioStore
                                                .getState()
                                                .playCardSound();
                                            placeBet(userDetails);
                                        }}
                                    >
                                        Place Bet
                                    </ArticlesButton>
                                </Box>
                            ) : null}

                            {gameOver ? (
                                <Box>
                                    <ArticlesButton
                                        small

                                        onClick={() => {
                                            startNewGame("continue");
                                        }}
                                    >
                                        Continue
                                    </ArticlesButton>
                                </Box>
                            ) : null}

                            {currentBet && !is3DMode && (
                                <Box
                                    sx={{
                                        width: "100%",
                                        px: "0.75rem",
                                        mx: "auto",
                                        overflowX: "auto",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{ mb: 0, mt: "1rem" }}
                                            >
                                                Your Hand ({player.count})
                                            </Typography>

                                            <Box
                                                component="table"
                                                sx={{
                                                    borderCollapse: "collapse",
                                                }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        {player.cards.map(
                                                            (card, i) => {
                                                                return (
                                                                    <Card
                                                                        key={i}
                                                                        number={
                                                                            card.number
                                                                        }
                                                                        suit={
                                                                            card.suit
                                                                        }
                                                                    />
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                </tbody>
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{ mb: 0, mt: "1rem" }}
                                            >
                                                {`Dealer's Hand`} (
                                                {dealer.count})
                                            </Typography>
                                            <Box
                                                component="table"
                                                sx={{
                                                    borderCollapse: "collapse",
                                                }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        {dealer.cards.map(
                                                            (card, i) => {
                                                                return (
                                                                    <Card
                                                                        key={i}
                                                                        number={
                                                                            card.number
                                                                        }
                                                                        suit={
                                                                            card.suit
                                                                        }
                                                                    />
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                </tbody>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            <Typography sx={{ mb: "1rem" }}>
                                {message}
                            </Typography>
                        </>
                    )}

                    {is3DMode && (
                        <GameHandSummary
                            player={currentBet ? player : undefined}
                            dealer={currentBet ? dealer : undefined}
                            currentBet={currentBet}
                        />
                    )}
                </Box>
            )}

            {!isOffline && !previewCards && (
                <Suspense>
                    <Ad
                        style="Default"
                        section={"Games"}
                        section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                        darkMode={darkMode ? true : false}
                        user_ad_token={userToken}
                        userDetails={userDetails}
                        userDetailsLoading={userDetailsLoading}
                    />
                </Suspense>
            )}
        </Box>
    );
}
