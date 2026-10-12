"use client";
import Player from "./Player";
import { DEALER_SEAT, seatPose } from "./playerSeats";

const pose = seatPose(DEALER_SEAT);
export default function Dealer() {
    return (
        <Player
            pose={pose}
            nickname="Dealer"
        />
    );
}
