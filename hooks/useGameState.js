import { create } from 'zustand'

export const useGameState = create((set, get) => ({

    // ─── State ────────────────────────────────────────────────────────────────
    leaderboard: [],
    fetchTime: null,
    lastClaim: null,
    publicScore: null,
    publicLastPlay: null,
    deck: [],
    dealer: null,
    player: null,
    wallet: 0,
    inputValue: '',
    currentBet: null,
    gameOver: false,
    message: null,

    setInputValue: (inputValue) => set({ inputValue }),

    // ─── Pure helpers ─────────────────────────────────────────────────────────
    generateDeck: () => {
        const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
        const suits = ['♦', '♣', '♥', '♠'];
        const deck = [];
        for (let i = 0; i < cards.length; i++) {
            for (let j = 0; j < suits.length; j++) {
                deck.push({ number: cards[i], suit: suits[j] });
            }
        }
        return deck;
    },

    getRandomCard: (deck_obj) => {
        const updatedDeck = [...deck_obj];
        const randomIndex = Math.floor(Math.random() * updatedDeck.length);
        const randomCard = updatedDeck[randomIndex];
        updatedDeck.splice(randomIndex, 1);
        return { randomCard, updatedDeck };
    },

    getCount: (cards) => {
        const rearranged = [];
        cards.forEach(card => {
            if (card.number === 'A') {
                rearranged.push(card);
            } else if (card.number) {
                rearranged.unshift(card);
            }
        });
        return rearranged.reduce((total, card) => {
            if (card.number === 'J' || card.number === 'Q' || card.number === 'K') {
                return total + 10;
            } else if (card.number === 'A') {
                return (total + 11 <= 21) ? total + 11 : total + 1;
            } else {
                return total + card.number;
            }
        }, 0);
    },

    dealCards: (deck) => {
        const { getRandomCard, getCount } = get();
        const playerCard1 = getRandomCard(deck);
        const dealerCard1 = getRandomCard(playerCard1.updatedDeck);
        const playerCard2 = getRandomCard(dealerCard1.updatedDeck);
        const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
        const dealerStartingHand = [dealerCard1.randomCard, {}];
        const player = { cards: playerStartingHand, count: getCount(playerStartingHand) };
        const dealer = { cards: dealerStartingHand, count: getCount(dealerStartingHand) };
        return { updatedDeck: playerCard2.updatedDeck, player, dealer };
    },

    dealerDraw: (dealerArg, deckArg) => {
        const { getRandomCard, getCount } = get();
        const { randomCard, updatedDeck } = getRandomCard(deckArg);
        const updatedDealer = { ...dealerArg, cards: [...dealerArg.cards, randomCard] };
        updatedDealer.count = getCount(updatedDealer.cards);
        return { dealer: updatedDealer, updatedDeck };
    },

    getWinner: (dealerArg, playerArg) => {
        if (dealerArg.count > playerArg.count) return 'dealer';
        if (dealerArg.count < playerArg.count) return 'player';
        return 'push';
    },

    // ─── Game actions ─────────────────────────────────────────────────────────
    startNewGame: (type) => {
        const { deck, wallet, generateDeck, dealCards } = get();
        if (type === 'continue') {
            if (wallet > 0) {
                const new_deck = (deck.length < 10) ? generateDeck() : deck;
                const { updatedDeck, player, dealer } = dealCards(new_deck);
                set({ deck: updatedDeck, dealer, player, currentBet: null, gameOver: false, message: null });
            } else {
                set({ message: 'Game over! You are broke! Please start a new game.' });
            }
        } else {
            const newDeck = generateDeck();
            const { updatedDeck, player, dealer } = dealCards(newDeck);
            set({ deck: updatedDeck, dealer, player, inputValue: '', currentBet: null, gameOver: false, message: null });
        }
    },

    placeBet: (userDetails) => {
        const { inputValue, wallet, leaderboard } = get();
        const currentBet = inputValue;
        if (currentBet > wallet) {
            set({ message: 'Insufficient funds to bet that amount.' });
        } else if (currentBet % 1 !== 0) {
            set({ message: 'Please bet whole numbers only.' });
        } else {
            const new_wallet = wallet - currentBet;
            fetch('/api/user/lose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: currentBet }),
            })
                .then(async response => {
                    const data = await response.json();
                    console.log(data);
                    const tempBoard = leaderboard.map(obj =>
                        obj.user_id == userDetails?.user_id
                            ? { ...obj, total: new_wallet, last_play: new Date() }
                            : obj
                    );
                    set({ wallet: new_wallet, leaderboard: tempBoard, inputValue: '', currentBet });
                })
                .catch(error => { console.log(error); });
        }
    },

    hit: () => {
        const { gameOver, currentBet, deck, player, getRandomCard, getCount } = get();
        if (!gameOver) {
            if (currentBet) {
                const { randomCard, updatedDeck } = getRandomCard(deck);
                const new_player = { ...player, cards: [...player.cards, randomCard] };
                new_player.count = getCount(new_player.cards);
                if (new_player.count > 21) {
                    set({ player: new_player, gameOver: true, message: 'BUST!' });
                } else {
                    set({ deck: updatedDeck, player: new_player });
                }
            } else {
                set({ message: 'Please place bet.' });
            }
        } else {
            set({ message: 'Game over! Please start a new game.' });
        }
    },

    stand: (userDetails) => {
        const { gameOver, deck, dealer, player, wallet, currentBet, leaderboard, getRandomCard, getCount, dealerDraw, getWinner } = get();
        if (!gameOver) {
            const randomCard = getRandomCard(deck);
            let updated_deck = randomCard.updatedDeck;
            // Replace placeholder {} second card with the revealed card
            let updated_dealer = { ...dealer, cards: [...dealer.cards.slice(0, -1), randomCard.randomCard] };
            updated_dealer.count = getCount(updated_dealer.cards);

            while (updated_dealer.count < 17) {
                const draw = dealerDraw(updated_dealer, updated_deck);
                updated_dealer = draw.dealer;
                updated_deck = draw.updatedDeck;
            }

            if (updated_dealer.count > 21) {
                set({ deck: updated_deck, dealer: updated_dealer, gameOver: true, message: 'Dealer bust! You win!' });
                fetch('/api/user/win', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: currentBet * 2 }),
                })
                    .then(async response => {
                        const data = await response.json();
                        console.log(data);
                        const newWallet = wallet + (currentBet * 2);
                        const tempBoard = leaderboard.map(obj =>
                            obj.user_id == userDetails?.user_id ? { ...obj, total: newWallet } : obj
                        );
                        set({ wallet: newWallet, leaderboard: tempBoard });
                    })
                    .catch(error => { console.log(error); });
            } else {
                const winner = getWinner(updated_dealer, player);
                let temp_wallet = wallet;
                let message;

                if (winner === 'dealer') {
                    message = 'Dealer wins...';
                } else if (winner === 'player') {
                    temp_wallet += currentBet * 2;
                    message = 'You win!';
                    fetch('/api/user/win', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: currentBet * 2 }),
                    })
                        .then(async response => {
                            const data = await response.json();
                            console.log(data);
                        })
                        .catch(error => { console.log(error); });
                } else {
                    temp_wallet += currentBet;
                    message = 'Push.';
                    fetch('/api/user/win', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: currentBet }),
                    })
                        .then(async response => {
                            const data = await response.json();
                            console.log(data);
                        })
                        .catch(error => { console.log(error); });
                }

                const tempBoard = leaderboard.map(obj =>
                    obj.user_id == userDetails?.user_id ? { ...obj, total: temp_wallet } : obj
                );
                set({ deck: updated_deck, dealer: updated_dealer, wallet: temp_wallet, leaderboard: tempBoard, gameOver: true, message });
            }
        } else {
            set({ message: 'Game over! Please start a new game.' });
        }
    },

    // ─── Leaderboard / wallet actions ─────────────────────────────────────────
    claim: (userDetails) => {
        const { wallet, leaderboard } = get();
        fetch('/api/user/claim', { method: 'POST' })
            .then(async response => {
                const data = await response.json();
                console.log(data);
                const newWallet = wallet + 100;
                const tempBoard = leaderboard.map(obj =>
                    obj.user_id == userDetails?.user_id
                        ? { ...obj, total: newWallet, last_play: new Date() }
                        : obj
                );
                set({ wallet: newWallet, leaderboard: tempBoard, lastClaim: new Date() });
            })
            .catch(error => { console.log(error); });
    },

    makePointsPublic: () => {
        fetch('/api/user/public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public: true }),
        })
            .then(() => {
                set({ publicScore: true });
                get().getLeaderboard();
            })
            .catch(error => { console.log(error); });
    },

    makePointsPrivate: () => {
        fetch('/api/user/private', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public: false }),
        })
            .then(() => {
                set({ publicScore: false });
                get().getLeaderboard();
            })
            .catch(error => { console.log(error); });
    },

    editPublicLastPlay: (state) => {
        fetch('/api/user/setPublicLastPlay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state }),
        })
            .then(async response => {
                const data = await response.json();
                if (data === true) {
                    set({ publicLastPlay: true });
                    get().getLeaderboard();
                }
                if (data === false) {
                    set({ publicLastPlay: false });
                    get().getLeaderboard();
                }
            })
            .catch(error => { console.log(error); });
    },

    getLeaderboard: () => {
        fetch('/api/leaderboard')
            .then(async response => {
                const data = await response.json();
                console.log(data);
                set({ leaderboard: data });
            })
            .catch(error => { console.log(error); });
    },

    getWalletBalance: () => {
        fetch('/api/user/wallet-balance')
            .then(async response => {
                const data = await response.json();
                console.log(data);
                if (data.total == 0 || data.total) {
                    set({
                        wallet: data.total,
                        lastClaim: data.last_claim,
                        publicScore: data.public,
                        publicLastPlay: data.public_last_play,
                    });
                    get().startNewGame();
                } else {
                    set({ wallet: 100, lastClaim: new Date() });
                    get().startNewGame();
                }
            })
            .catch(error => { console.log(error); });
    },
}))
