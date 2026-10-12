"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAudioStore } from "./useAudioStore";

export const OFFLINE_STORAGE_KEY = "blackjack-offline-score";
export const CLAIM_INTERVAL = 24 * 60 * 60 * 1000;

function emptyHand() {
    return { cards: [], count: 0 };
}

function shuffledDeck() {
    const deck = [];
    for (const suit of ["♦", "♣", "♥", "♠"]) {
        for (const number of [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]) {
            deck.push({ number, suit });
        }
    }
    for (let index = deck.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [deck[index], deck[other]] = [deck[other], deck[index]];
    }
    return deck;
}

function handCount(cards) {
    let total = 0;
    let aces = 0;
    for (const card of cards) {
        if (!card.number) continue;
        if (card.number === "A") {
            total += 11;
            aces++;
        } else {
            total += typeof card.number === "number" ? card.number : 10;
        }
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

function hand(cards) {
    return { cards, count: handCount(cards) };
}

// This store never imports the online wallet or calls the server.
export const useOfflineScoreStore = create()(
    persist(
        (set, get) => ({
            _hasHydrated: false,
            initialized: false,
            playMode: "online",
            wallet: 100,
            lastClaim: null,
            lastPlay: null,
            inputValue: "",
            currentBet: null,
            deck: [],
            player: emptyHand(),
            dealer: emptyHand(),
            dealerHoleCard: null,
            gameOver: false,
            message: null,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            pushes: 0,

            finishHydration: () => {
                if (get()._hasHydrated) return;
                const initialWallet = get().initialized
                    ? {}
                    : {
                          initialized: true,
                          wallet: 100,
                          lastClaim: new Date().toISOString(),
                      };
                set({ ...initialWallet, _hasHydrated: true });
            },

            setPlayMode: (playMode) => {
                if (["online", "offline", "multiplayer"].includes(playMode))
                    set({ playMode });
            },

            setInputValue: (inputValue) => set({ inputValue }),

            startNewGame: () => {
                const { currentBet, gameOver, wallet } = get();
                if (currentBet && !gameOver) {
                    set({
                        message:
                            "Finish your current hand before starting another.",
                    });
                    return;
                }
                set({
                    deck: [],
                    player: emptyHand(),
                    dealer: emptyHand(),
                    dealerHoleCard: null,
                    inputValue: "",
                    currentBet: null,
                    gameOver: false,
                    message:
                        wallet > 0
                            ? null
                            : "You are out of offline points. Claim 100 points when your daily claim is available.",
                });
            },

            placeBet: () => {
                const { _hasHydrated, inputValue, wallet, currentBet } = get();
                if (!_hasHydrated) return;
                if (currentBet) {
                    set({
                        message:
                            "Finish this round and choose Continue before betting again.",
                    });
                    return;
                }
                if (!Number.isSafeInteger(inputValue) || inputValue <= 0) {
                    set({ message: "Please bet a positive whole number." });
                    return;
                }
                if (inputValue > wallet) {
                    set({
                        message:
                            "Insufficient offline points to bet that amount.",
                    });
                    return;
                }

                const deck = shuffledDeck();
                const playerCard = deck.pop();
                const dealerCard = deck.pop();
                const playerSecondCard = deck.pop();
                const dealerHoleCard = deck.pop();
                set({
                    wallet: wallet - inputValue,
                    currentBet: inputValue,
                    inputValue: "",
                    deck,
                    player: hand([playerCard, playerSecondCard]),
                    dealer: hand([dealerCard, {}]),
                    dealerHoleCard,
                    gameOver: false,
                    message: null,
                    lastPlay: new Date().toISOString(),
                });
            },

            hit: () => {
                const {
                    currentBet,
                    gameOver,
                    deck,
                    player,
                    losses,
                    gamesPlayed,
                } = get();
                if (!currentBet || gameOver) return;
                useAudioStore.getState().playCardSound();
                const updatedDeck = [...deck];
                const card = updatedDeck.pop();
                if (!card) return;
                const updatedPlayer = hand([...player.cards, card]);
                const busted = updatedPlayer.count > 21;
                set({
                    deck: updatedDeck,
                    player: updatedPlayer,
                    gameOver: busted,
                    message: busted ? "BUST!" : null,
                    losses: losses + (busted ? 1 : 0),
                    gamesPlayed: gamesPlayed + (busted ? 1 : 0),
                    lastPlay: new Date().toISOString(),
                });
            },

            stand: () => {
                const {
                    currentBet,
                    gameOver,
                    deck,
                    dealer,
                    dealerHoleCard,
                    player,
                    wallet,
                    gamesPlayed,
                    wins,
                    losses,
                    pushes,
                } = get();
                if (!currentBet || gameOver || !dealerHoleCard) return;
                useAudioStore.getState().playCardSound();
                const updatedDeck = [...deck];
                let updatedDealer = hand([dealer.cards[0], dealerHoleCard]);
                while (updatedDealer.count < 17 && updatedDeck.length) {
                    updatedDealer = hand([
                        ...updatedDealer.cards,
                        updatedDeck.pop(),
                    ]);
                }

                const won =
                    updatedDealer.count > 21 ||
                    player.count > updatedDealer.count;
                const pushed = !won && player.count === updatedDealer.count;
                const payout = won ? currentBet * 2 : pushed ? currentBet : 0;
                set({
                    deck: updatedDeck,
                    dealer: updatedDealer,
                    dealerHoleCard: null,
                    wallet: wallet + payout,
                    gameOver: true,
                    message: won
                        ? updatedDealer.count > 21
                            ? "Dealer bust! You win!"
                            : "You win!"
                        : pushed
                          ? "Push."
                          : "Dealer wins...",
                    gamesPlayed: gamesPlayed + 1,
                    wins: wins + (won ? 1 : 0),
                    losses: losses + (!won && !pushed ? 1 : 0),
                    pushes: pushes + (pushed ? 1 : 0),
                    lastPlay: new Date().toISOString(),
                });
            },

            claim: () => {
                const { _hasHydrated, lastClaim, wallet } = get();
                if (!_hasHydrated) return;
                const now = Date.now();
                if (now < new Date(lastClaim).getTime() + CLAIM_INTERVAL) {
                    set({
                        message: "You need to wait 24 hours to claim again.",
                    });
                    return;
                }
                set({
                    wallet: wallet + 100,
                    lastClaim: new Date(now).toISOString(),
                    message: "Added 100 points to your offline wallet.",
                });
            },

            reset: () => {
                set({
                    initialized: true,
                    wallet: 100,
                    lastClaim: new Date().toISOString(),
                    lastPlay: null,
                    inputValue: "",
                    currentBet: null,
                    deck: [],
                    player: emptyHand(),
                    dealer: emptyHand(),
                    dealerHoleCard: null,
                    gameOver: false,
                    message: null,
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    pushes: 0,
                });
            },
        }),
        {
            name: OFFLINE_STORAGE_KEY,
            version: 1,
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: ({ _hasHydrated, ...state }) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([, value]) => typeof value !== "function",
                    ),
                ),
        },
    ),
);
