"use client";
import { usePeerStore } from "@/hooks/usePeerStore";
import Player from "./Player";

export default function Players() {
    const players = usePeerStore((state) => state.players);
    const selfId = usePeerStore((state) => state.selfId);
    return Object.values(players)
        .filter((player) => player.id !== selfId)
        .map((player) => (
            <Player
                key={player.id}
                pose={player.pose}
                nickname={player.nickname}
            />
        ));
}
