"use client";
import { Text } from "@react-three/drei";
import { usePeerStore } from "@/hooks/usePeerStore";
import PlayingCard from "@/components/Game/PlayingCard";
import { DEALER_SEAT, findSeat } from "@/components/Game/playerSeats";

function SeatHand({ seat, cards, cardAppearance, reducedMotion }) {
    const angle = seat.chairRotation;
    const spacing = Math.min(0.5, 1.4 / Math.max(cards.length - 1, 1));
    return (
        <group
            position={[Math.sin(angle) * 2.9, 0.1, Math.cos(angle) * 1.85]}
            rotation={[0, angle, 0]}
            scale={0.62}
        >
            {cards.map((card, index) => (
                <PlayingCard
                    key={index}
                    number={card.number}
                    suit={card.suit}
                    position={[
                        (index - (cards.length - 1) / 2) * spacing,
                        index * 0.015,
                        0,
                    ]}
                    appearance={cardAppearance}
                    reducedMotion={reducedMotion}
                    delay={index * 0.12}
                />
            ))}
        </group>
    );
}

export function ChairName({ seat, nickname }) {
    return (
        <group
            position={seat.position}
            rotation={[0, seat.chairRotation, 0]}
        >
            <Text
                position={[0, 2.59, 0.71]}
                fontSize={0.19}
                maxWidth={1.08}
                textAlign="center"
                color="#fff2ca"
                outlineColor="#231910"
                outlineWidth={0.015}
            >
                {nickname}
            </Text>
        </group>
    );
}

export default function MultiplayerTable({ cardAppearance, reducedMotion }) {
    const players = usePeerStore((s) => s.players);
    const dealer = usePeerStore((s) => s.dealer);
    return (
        <>
            <SeatHand
                seat={DEALER_SEAT}
                cards={dealer.cards}
                cardAppearance={cardAppearance}
                reducedMotion={reducedMotion}
            />
            {Object.values(players).map((player) => {
                const seat = findSeat(player.seat);
                return (
                    <group key={player.id}>
                        <ChairName
                            seat={seat}
                            nickname={player.nickname}
                        />
                        <SeatHand
                            seat={seat}
                            cards={player.hand.cards}
                            cardAppearance={cardAppearance}
                            reducedMotion={reducedMotion}
                        />
                    </group>
                );
            })}
        </>
    );
}
