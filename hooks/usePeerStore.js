"use client";

import { create } from "zustand";
import {
    emptyHand,
    hand,
    shuffledDeck,
} from "@/components/Multiplayer/blackjack";
import {
    PLAYER_SEATS,
    BAR_SEATS,
    findSeat,
    seatPose,
    seatExit,
    FLOOR_Y,
} from "@/components/Game/playerSeats";
import { isAirborne, PLAYER_ANIMATIONS } from "@/components/Game/playerJump";

const PREFIX = "articles-blackjack-v1-";
const cleanName = (value) =>
    typeof value === "string"
        ? value
              .replace(/[\u0000-\u001f]/g, "")
              .trim()
              .slice(0, 24)
        : "";
const defaultNickname = () => `Player${Math.floor(100 + Math.random() * 900)}`;
// Transport handles and hidden cards never enter broadcasts or persistent storage.
let peer = null;
let hostConnection = null;
const connections = new Map();
let generation = 0;
let timeout = null;
let deck = [];
let hole = null;

const initialState = () => ({
    status: "idle",
    roomId: "",
    selfId: "",
    isHost: false,
    players: {},
    phase: "betting",
    dealer: emptyHand(),
    round: 0,
    inputValue: "",
    error: "",
    nickname: defaultNickname(),
});
function send(connection, data) {
    if (connection?.open) {
        try {
            connection.send(data);
        } catch {
            /* Close/error events handle teardown. */
        }
    }
}
function dispose() {
    generation++;
    clearTimeout(timeout);
    const oldPeer = peer;
    peer = null;
    hostConnection?.close();
    hostConnection = null;
    for (const connection of connections.values()) connection.close();
    connections.clear();
    oldPeer?.destroy();
    deck = [];
    hole = null;
}
function broadcast() {
    const { players, phase, dealer, round, roomId } = usePeerStore.getState();
    for (const connection of connections.values())
        send(connection, {
            type: "snapshot",
            players,
            phase,
            dealer,
            round,
            roomId,
        });
}
function addPlayer(id, nickname, seat) {
    return {
        id,
        nickname: cleanName(nickname) || defaultNickname(),
        seat: seat.id,
        wallet: 100,
        bet: 0,
        hand: emptyHand(),
        status: "waiting",
        message: "",
        wins: 0,
        losses: 0,
        pushes: 0,
        pose: seatPose(seat),
    };
}
function patchPlayer(id, patch) {
    const state = usePeerStore.getState();
    if (state.players[id])
        usePeerStore.setState({
            players: {
                ...state.players,
                [id]: { ...state.players[id], ...patch },
            },
        });
}
function finishRoundIfReady() {
    const state = usePeerStore.getState();
    if (
        state.phase !== "playing" ||
        Object.values(state.players).some((p) => p.status === "playing")
    )
        return;
    let dealer = hand([state.dealer.cards[0], hole].filter(Boolean));
    while (dealer.count < 17 && deck.length)
        dealer = hand([...dealer.cards, deck.pop()]);
    hole = null;
    const players = Object.fromEntries(
        Object.entries(state.players).map(([id, p]) => {
            if (!p.bet) return [id, p];
            const won =
                p.hand.count <= 21 &&
                (dealer.count > 21 || p.hand.count > dealer.count);
            const push = p.hand.count <= 21 && p.hand.count === dealer.count;
            return [
                id,
                {
                    ...p,
                    status: "done",
                    wallet: p.wallet + (won ? p.bet * 2 : push ? p.bet : 0),
                    wins: p.wins + Number(won),
                    losses: p.losses + Number(!won && !push),
                    pushes: p.pushes + Number(push),
                    message:
                        p.hand.count > 21
                            ? "Bust!"
                            : won
                              ? "You win!"
                              : push
                                ? "Push."
                                : "Dealer wins.",
                },
            ];
        }),
    );
    usePeerStore.setState({ players, dealer, phase: "finished" });
}
function reject(id, message) {
    patchPlayer(id, { message });
}
function handleAction(id, data) {
    const state = usePeerStore.getState();
    const player = state.players[id];
    if (!state.isHost || !player || !data || typeof data !== "object") return;
    switch (data.action) {
        case "nickname": {
            const nickname = cleanName(data.nickname);
            if (nickname) patchPlayer(id, { nickname });
            break;
        }
        case "bet": {
            if (state.phase !== "betting" || player.bet) return;
            if (
                !Number.isSafeInteger(data.amount) ||
                data.amount < 1 ||
                data.amount > player.wallet
            ) {
                reject(
                    id,
                    "Bet a positive whole number within your session balance.",
                );
                break;
            }
            patchPlayer(id, {
                wallet: player.wallet - data.amount,
                bet: data.amount,
                status: "ready",
                message: "Waiting for the host to deal.",
            });
            break;
        }
        case "hit": {
            if (state.phase !== "playing" || player.status !== "playing")
                return;
            const card = deck.pop();
            if (!card) {
                patchPlayer(id, { status: "standing" });
                break;
            }
            const nextHand = hand([...player.hand.cards, card]);
            patchPlayer(id, {
                hand: nextHand,
                status:
                    nextHand.count > 21
                        ? "bust"
                        : nextHand.count === 21
                          ? "standing"
                          : "playing",
                message:
                    nextHand.count > 21
                        ? "Bust! Waiting for the other players."
                        : "",
            });
            break;
        }
        case "stand":
            if (state.phase !== "playing" || player.status !== "playing")
                return;
            patchPlayer(id, {
                status: "standing",
                message: "Waiting for the other players.",
            });
            break;
        case "seat": {
            if (player.pose.seated) {
                const seat = findSeat(player.pose.seated);
                patchPlayer(id, {
                    pose: {
                        ...player.pose,
                        position: seatExit(seat),
                        seated: null,
                        animation: "idle",
                    },
                });
            } else {
                const seat = findSeat(data.seat);
                if (
                    !seat ||
                    (seat.id !== player.seat && !BAR_SEATS.includes(seat))
                ) {
                    reject(id, "That table chair belongs to another player.");
                    break;
                }
                if (
                    Object.values(state.players).some(
                        (p) => p.pose.seated === seat.id,
                    )
                ) {
                    reject(id, "That seat is occupied.");
                    break;
                }
                if (
                    Math.hypot(
                        player.pose.position[0] - seat.position[0],
                        player.pose.position[2] - seat.position[2],
                    ) > 2.4
                ) {
                    reject(id, "Move closer to your chair or a free barstool.");
                    break;
                }
                if (isAirborne(player.pose)) {
                    reject(id, "Land before sitting down.");
                    break;
                }
                patchPlayer(id, { pose: seatPose(seat), message: "" });
            }
            break;
        }
        default:
            return;
    }
    finishRoundIfReady();
    broadcast();
}
function handlePose(id, pose) {
    const state = usePeerStore.getState();
    const player = state.players[id];
    if (
        !state.isHost ||
        !player ||
        player.pose.seated ||
        !pose ||
        !Array.isArray(pose.position) ||
        pose.position.length !== 3 ||
        !pose.position.every(Number.isFinite) ||
        !Number.isFinite(pose.rotation)
    )
        return;
    const [x, y, z] = pose.position;
    // Clients simulate Rapier contacts. Validate the room envelope here rather
    // than old floor-only footprints, which reject jumping onto furniture.
    if (
        Math.abs(x) > 14 ||
        Math.abs(z) > 14 ||
        y < FLOOR_Y - 0.2 ||
        y > FLOOR_Y + 12
    )
        return;
    const grounded = pose.grounded === true;
    const airborne = !grounded;
    let animation = Object.hasOwn(PLAYER_ANIMATIONS, pose.animation)
        ? pose.animation
        : "idle";
    if (airborne && animation !== "jumpStart" && animation !== "jumpLoop")
        animation = "jumpLoop";
    const safePose = {
        position: [x, Math.max(FLOOR_Y, y), z],
        rotation: pose.rotation % (Math.PI * 2),
        seated: null,
        animation,
        locomotion: pose.locomotion === "walk" ? "walk" : "idle",
        grounded,
    };
    if (
        player.pose.position[0] === x &&
        player.pose.position[1] === safePose.position[1] &&
        player.pose.position[2] === z &&
        player.pose.rotation === safePose.rotation &&
        player.pose.animation === safePose.animation &&
        player.pose.locomotion === safePose.locomotion &&
        player.pose.grounded === safePose.grounded
    )
        return;
    patchPlayer(id, { pose: safePose });
    for (const connection of connections.values())
        send(connection, { type: "pose", id, pose: safePose });
}
function removePlayer(id) {
    const players = { ...usePeerStore.getState().players };
    delete players[id];
    usePeerStore.setState({ players });
    finishRoundIfReady();
    broadcast();
}

export const usePeerStore = create((set, get) => ({
    ...initialState(),
    setInputValue: (inputValue) => set({ inputValue }),
    setNickname: (nickname) => {
        const nextNickname = cleanName(nickname) || defaultNickname();
        set({ nickname: nextNickname });
        if (get().status === "connected")
            get().act({ action: "nickname", nickname: nextNickname });
    },
    clearError: () => set({ error: "" }),
    disconnect: (message = "") => {
        if (get().isHost)
            for (const connection of connections.values())
                send(connection, { type: "ended" });
        dispose();
        set({ ...initialState(), error: message });
    },
    startSession: async (room) => {
        if (["connecting", "connected"].includes(get().status)) return;
        const isHost = room === undefined;
        if (!isHost && !/^\d{6}$/.test(room)) {
            set({ error: "Enter a six digit room ID." });
            return;
        }
        const nickname = cleanName(get().nickname) || defaultNickname();
        dispose();
        const token = generation;
        const roomId = isHost
            ? String(
                  100000 +
                      (crypto.getRandomValues(new Uint32Array(1))[0] % 900000),
              )
            : room;
        set({
            ...initialState(),
            nickname,
            roomId,
            isHost,
            status: "connecting",
        });
        const fail = (message) => {
            if (token === generation) get().disconnect(message);
        };
        timeout = setTimeout(
            () =>
                fail("Connection timed out. Check the room ID and try again."),
            20000,
        );
        try {
            const { Peer } = await import("peerjs");
            if (token !== generation) return;
            const instance = isHost ? new Peer(PREFIX + roomId) : new Peer();
            peer = instance;
            instance.on("error", (error) =>
                fail(
                    error.type === "unavailable-id"
                        ? "That room ID is in use. Click Start Game again."
                        : error.type === "peer-unavailable"
                          ? "Room not found. Check the ID with the host."
                          : `Connection failed: ${error.type || "network error"}. Please try again.`,
                ),
            );
            instance.on("disconnected", () =>
                fail("Signaling connection lost. Start or join a new session."),
            );
            instance.on("close", () => fail("The session connection closed."));
            instance.on("open", (id) => {
                if (token !== generation) return;
                set({ selfId: id });
                if (isHost) {
                    clearTimeout(timeout);
                    set({
                        status: "connected",
                        players: {
                            [id]: addPlayer(id, nickname, PLAYER_SEATS[0]),
                        },
                    });
                    return;
                }
                const connection = instance.connect(PREFIX + roomId, {
                    reliable: true,
                    metadata: { version: 1, nickname },
                });
                hostConnection = connection;
                connection.on("data", (data) => {
                    if (
                        token !== generation ||
                        !data ||
                        typeof data !== "object"
                    )
                        return;
                    if (
                        data.type === "snapshot" &&
                        data.players?.[id] &&
                        ["betting", "playing", "finished"].includes(data.phase)
                    ) {
                        clearTimeout(timeout);
                        set({
                            status: "connected",
                            players: data.players,
                            phase: data.phase,
                            dealer: data.dealer,
                            round: data.round,
                            error: "",
                        });
                    } else if (data.type === "pose" && get().players[data.id])
                        patchPlayer(data.id, { pose: data.pose });
                    else if (data.type === "ended")
                        fail("The host ended the game.");
                    else if (data.type === "rejected")
                        fail(data.message || "Unable to join this room.");
                });
                connection.on("close", () =>
                    fail(
                        "Disconnected from the host. The session wallet has been cleared.",
                    ),
                );
                connection.on("error", () =>
                    fail("Could not connect to the host."),
                );
            });
            instance.on("connection", (connection) => {
                if (!isHost || token !== generation) {
                    connection.close();
                    return;
                }
                const pendingTimeout = setTimeout(
                    () => connection.close(),
                    15000,
                );
                connection.on("open", () => {
                    clearTimeout(pendingTimeout);
                    if (token !== generation) {
                        connection.close();
                        return;
                    }
                    const seat = PLAYER_SEATS.find(
                        (seat) =>
                            !Object.values(get().players).some(
                                (p) => p.seat === seat.id,
                            ),
                    );
                    if (
                        !seat ||
                        connection.metadata?.version !== 1 ||
                        connections.has(connection.peer)
                    ) {
                        send(connection, {
                            type: "rejected",
                            message: !seat
                                ? "This table is full (seven players)."
                                : "Unable to join this room.",
                        });
                        setTimeout(() => connection.close(), 250);
                        return;
                    }
                    connections.set(connection.peer, connection);
                    set({
                        players: {
                            ...get().players,
                            [connection.peer]: addPlayer(
                                connection.peer,
                                connection.metadata.nickname,
                                seat,
                            ),
                        },
                    });
                    broadcast();
                });
                connection.on("data", (data) => {
                    if (
                        token !== generation ||
                        connections.get(connection.peer) !== connection ||
                        !data ||
                        typeof data !== "object"
                    )
                        return;
                    if (data.type === "action")
                        handleAction(connection.peer, data);
                    if (data.type === "pose")
                        handlePose(connection.peer, data.pose);
                });
                const leave = () => {
                    clearTimeout(pendingTimeout);
                    if (
                        token !== generation ||
                        connections.get(connection.peer) !== connection
                    )
                        return;
                    connections.delete(connection.peer);
                    removePlayer(connection.peer);
                };
                connection.on("close", leave);
                connection.on("error", () => {
                    leave();
                    connection.close();
                });
            });
        } catch {
            fail("Unable to start PeerJS. Please try again.");
        }
    },
    act: (action) => {
        if (get().status !== "connected") return;
        if (get().isHost) handleAction(get().selfId, action);
        else send(hostConnection, { ...action, type: "action" });
    },
    updatePose: (pose) => {
        if (get().status !== "connected") return;
        if (get().isHost) handlePose(get().selfId, pose);
        else send(hostConnection, { type: "pose", pose });
    },
    placeBet: () =>
        get().act({ action: "bet", amount: Number(get().inputValue) }),
    hit: () => get().act({ action: "hit" }),
    stand: () => get().act({ action: "stand" }),
    toggleSeat: (seat) => get().act({ action: "seat", seat }),
    dealRound: () => {
        const state = get();
        if (
            !state.isHost ||
            state.phase !== "betting" ||
            !Object.values(state.players).some((p) => p.bet)
        )
            return;
        deck = shuffledDeck();
        hole = deck.pop();
        const dealer = hand([deck.pop(), {}]);
        const players = Object.fromEntries(
            Object.entries(state.players).map(([id, p]) => {
                if (!p.bet) return [id, p];
                const cards = hand([deck.pop(), deck.pop()]);
                return [
                    id,
                    {
                        ...p,
                        hand: cards,
                        status: cards.count === 21 ? "standing" : "playing",
                        message: "",
                    },
                ];
            }),
        );
        set({ players, dealer, phase: "playing", round: state.round + 1 });
        finishRoundIfReady();
        broadcast();
    },
    nextRound: () => {
        if (!get().isHost || get().phase !== "finished") return;
        set({
            phase: "betting",
            dealer: emptyHand(),
            inputValue: "",
            players: Object.fromEntries(
                Object.entries(get().players).map(([id, p]) => [
                    id,
                    {
                        ...p,
                        bet: 0,
                        hand: emptyHand(),
                        status: "waiting",
                        message: "",
                    },
                ]),
            ),
        });
        broadcast();
    },
    resetBalance: (id) => {
        const state = get();
        const player = state.players[id];
        if (
            !state.isHost ||
            state.phase === "playing" ||
            !player ||
            (state.phase === "betting" && player.bet)
        )
            return;
        patchPlayer(id, { wallet: 100 });
        broadcast();
    },
    resetBalances: () => {
        const state = get();
        if (
            !state.isHost ||
            state.phase === "playing" ||
            (state.phase === "betting" &&
                Object.values(state.players).some((player) => player.bet))
        )
            return;
        set({
            players: Object.fromEntries(
                Object.entries(state.players).map(([id, player]) => [
                    id,
                    { ...player, wallet: 100 },
                ]),
            ),
        });
        broadcast();
    },
    kickPlayer: (id) => {
        if (!get().isHost || id === get().selfId) return;
        const connection = connections.get(id);
        send(connection, {
            type: "rejected",
            message:
                "You were removed by the host. Your session wallet has been cleared.",
        });
        connections.delete(id);
        removePlayer(id);
        setTimeout(() => connection?.close(), 250);
    },
}));
