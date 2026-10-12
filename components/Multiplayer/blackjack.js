export const emptyHand = () => ({ cards: [], count: 0 });
export function countCards(cards) {
    let aces = 0;
    let count = cards.reduce((total, { number }) => {
        if (number === "A") {
            aces++;
            return total + 11;
        }
        return total + (typeof number === "number" ? number : number ? 10 : 0);
    }, 0);
    while (count > 21 && aces-- > 0) count -= 10;
    return count;
}
export const hand = (cards) => ({ cards, count: countCards(cards) });
export function shuffledDeck() {
    const deck = ["♦", "♣", "♥", "♠"].flatMap((suit) =>
        [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"].map((number) => ({
            number,
            suit,
        })),
    );
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
