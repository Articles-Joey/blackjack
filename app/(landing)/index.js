"use client"
import { useState, useEffect } from 'react'

import axios from 'axios'

import Link from 'next/link'
// import dynamic from 'next/dynamic'

import Countdown from 'react-countdown';

// import { useSession } from 'lib/hooks'

// import { useSelector, useDispatch } from 'react-redux'

import { format, add, differenceInHours } from 'date-fns';

import ViewUserModal from '@/components/UI/ViewUserModal'

// import ROUTES from 'components/constants/routes';

// import generateRandomInteger from 'util/generateRandomInteger'
import ArticlesButton from '@/components/UI/Button'
import useUserDetails from '@/hooks/user/useUserDetails';
import useUserToken from '@/hooks/user/useUserToken';
import useFullscreen from '@/hooks/useFullScreen';

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

export default function BlackjackPage() {

    // const { session, status } = useSession()
    const session = {

    }

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken();

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    const {
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
    } = useFullscreen();

    // const userReduxState = useSelector((state) => state.auth.user_details);
    const userReduxState = false

    const [leaderboard, setLeaderboard] = useState([])
    const [fetchTime, setFetchTime] = useState(null)

    const [lastClaim, setLastClaim] = useState(null)
    const [publicScore, setPublicScore] = useState(null)

    const [publicLastPlay, setPublicLastPlay] = useState(null)

    const [deck, setDeck] = useState([])
    const [dealer, setDealer] = useState(null)
    const [player, setPlayer] = useState(null)
    const [wallet, setWallet] = useState(0)
    const [inputValue, setInputValue] = useState('')
    const [currentBet, setCurrentBet] = useState(null)
    const [gameOver, setGameOver] = useState(false)
    const [message, setMessage] = useState(null)

    // const reduxAds = useSelector((state) => state.ads.ads)

    function claim() {

        axios.post('/api/user/claim')
            .then(response => {
                console.log(response.data)
                setWallet(wallet + 100)

                const tempBoard = leaderboard.map(obj => obj.user_id == userDetails?.user_id ? { ...obj, total: wallet, last_play: new Date() } : obj)
                setLeaderboard(tempBoard)

                setLastClaim(new Date())
                // setLeaderboard(response.data)
            })
            .catch(response => {
                console.log(response.data)
            })

    }

    function generateDeck() {
        const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
        const suits = ['♦', '♣', '♥', '♠'];
        const deck = [];
        for (let i = 0; i < cards.length; i++) {
            for (let j = 0; j < suits.length; j++) {
                deck.push({ number: cards[i], suit: suits[j] });
            }
        }
        return deck;
    }

    function dealCards(deck) {
        const playerCard1 = getRandomCard(deck);
        const dealerCard1 = getRandomCard(playerCard1.updatedDeck);
        const playerCard2 = getRandomCard(dealerCard1.updatedDeck);
        const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
        const dealerStartingHand = [dealerCard1.randomCard, {}];

        const player = {
            cards: playerStartingHand,
            count: getCount(playerStartingHand)
        };
        const dealer = {
            cards: dealerStartingHand,
            count: getCount(dealerStartingHand)
        };

        return { updatedDeck: playerCard2.updatedDeck, player, dealer };
    }

    function startNewGame(type) {
        if (type === 'continue') {
            if (wallet > 0) {
                const new_deck = (deck.length < 10) ? generateDeck() : deck;
                const { updatedDeck, player, dealer } = dealCards(new_deck);

                // this.setState({
                //     deck: updatedDeck,
                //     dealer,
                //     player,
                //     currentBet: null,
                //     gameOver: false,
                //     message: null
                // });

                setDeck(updatedDeck)
                setDealer(dealer)
                setPlayer(player)
                setCurrentBet(null)
                setGameOver(false)
                setMessage(null)

            } else {
                setMessage('Game over! You are broke! Please start a new game.')
            }
        } else {

            const deck = generateDeck();
            const { updatedDeck, player, dealer } = dealCards(deck);

            setDeck(updatedDeck)
            setDealer(dealer)
            setPlayer(player)
            // setWallet(100)
            setInputValue('')
            setCurrentBet(null)
            setGameOver(false)
            setMessage(null)

        }
    }

    function getRandomCard(deck_obj) {
        console.log("getRandomCard called")
        console.log("deck_obj", deck_obj)
        const updatedDeck = [...deck_obj];
        console.log("updatedDeck", updatedDeck)
        const randomIndex = Math.floor(Math.random() * updatedDeck.length);
        const randomCard = updatedDeck[randomIndex];
        updatedDeck.splice(randomIndex, 1);

        return { randomCard, updatedDeck };
    }

    function placeBet() {
        const currentBet = inputValue;

        if (currentBet > wallet) {
            setMessage('Insufficient funds to bet that amount.')
            // this.setState({ message: 'Insufficient funds to bet that amount.' });
        } else if (currentBet % 1 !== 0) {
            setMessage('Please bet whole numbers only.')
            // this.setState({ message: 'Please bet whole numbers only.' });
        } else {
            // Deduct current bet from wallet
            const new_wallet = wallet - currentBet;

            axios.post('/api/user/lose', {
                amount: currentBet
            })
                .then(response => {
                    console.log(response.data)
                    setWallet(new_wallet)

                    const tempBoard = leaderboard.map(obj => obj.user_id == userDetails?.user_id ? { ...obj, total: wallet, last_play: new Date() } : obj)
                    setLeaderboard(tempBoard)

                    setInputValue('')
                    setCurrentBet(currentBet)
                })
                .catch(response => {
                    console.log(response.data)
                })

        }
    }

    function hit() {
        if (!gameOver) {
            if (currentBet) {

                const { randomCard, updatedDeck } = getRandomCard(deck);

                const new_player = player;

                new_player.cards.push(randomCard);
                new_player.count = getCount(new_player.cards);

                if (new_player.count > 21) {
                    // this.setState({ player, gameOver: true, message: 'BUST!' });
                    setPlayer(new_player)
                    setGameOver(true)
                    setMessage('BUST!')
                } else {
                    // this.setState({ deck: updatedDeck, player });
                    setDeck(updatedDeck)
                    setPlayer(new_player)
                }
            } else {
                // this.setState({ message: 'Please place bet.' });
                setMessage('Please place bet.')
            }
        } else {
            // this.setState({ message: 'Game over! Please start a new game.' });
            setMessage('Game over! Please start a new game.')
        }
    }

    function dealerDraw(dealer, deck) {
        const { randomCard, updatedDeck } = getRandomCard(deck);
        dealer.cards.push(randomCard);
        dealer.count = getCount(dealer.cards);
        return { dealer, updatedDeck };
    }

    function getCount(cards) {
        const rearranged = [];
        cards.forEach(card => {
            if (card.number === 'A') {
                rearranged.push(card);
            } else if (card.number) {
                rearranged.unshift(card);
            }


            // (card.number === 'A') ? rearranged.push(card) : rearranged.unshift(card);
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
    }

    function stand() {
        if (!gameOver) {

            // Show dealer's 2nd card
            const randomCard = getRandomCard(deck);
            let updated_deck = randomCard.updatedDeck;
            let updated_dealer = dealer;

            updated_dealer.cards.pop();
            updated_dealer.cards.push(randomCard.randomCard);
            updated_dealer.count = getCount(updated_dealer.cards);

            // Keep drawing cards until count is 17 or more
            while (dealer.count < 17) {
                const draw = dealerDraw(updated_dealer, deck);
                updated_dealer = draw.dealer;
                updated_deck = draw.updatedDeck;
            }

            if (updated_dealer.count > 21) {

                setDeck(updated_deck)
                setDealer(updated_dealer)
                // setPlayer(player)
                // setWallet(wallet + currentBet * 2)
                // setInputValue('')
                // setCurrentBet(null)
                setGameOver(true)
                setMessage('Dealer bust! You win!')

                axios.post('/api/user/win', {
                    amount: currentBet * 2
                })
                    .then(response => {
                        console.log(response.data)
                        setWallet(wallet + (currentBet * 2))

                        const tempBoard = leaderboard.map(obj => obj.user_id == userDetails?.user_id ? { ...obj, total: wallet + (currentBet * 2) } : obj)
                        setLeaderboard(tempBoard)
                        // setLeaderboard(response.data)

                        // setLastClaim(new Date())
                        // setLeaderboard(response.data)
                    })
                    .catch(response => {
                        console.log(response.data)
                    })

            } else {
                const winner = getWinner(updated_dealer, player);
                let temp_wallet = wallet;
                let message;

                if (winner === 'dealer') {
                    message = 'Dealer wins...';
                } else if (winner === 'player') {
                    temp_wallet += currentBet * 2;
                    message = 'You win!';

                    axios.post('/api/user/win', {
                        amount: currentBet * 2
                    })
                        .then(response => {
                            console.log(response.data)
                            // temp_wallet + 100
                            // setLastClaim(new Date())

                        })
                        .catch(response => {
                            console.log(response.data)
                        })

                } else {
                    temp_wallet += currentBet;
                    message = 'Push.';

                    axios.post('/api/user/win', {
                        amount: currentBet
                    })
                        .then(response => {
                            console.log(response.data)
                            // setLastClaim(new Date())

                        })
                        .catch(response => {
                            console.log(response.data)
                        })
                }

                setDeck(updated_deck)
                setDealer(updated_dealer)
                setWallet(temp_wallet)

                const tempBoard = leaderboard.map(obj => obj.user_id == userDetails?.user_id ? { ...obj, total: temp_wallet } : obj)
                setLeaderboard(tempBoard)
                // setLeaderboard(response.data)

                setGameOver(true)
                setMessage(message)

            }

        } else {
            // this.setState({ message: 'Game over! Please start a new game.' });
            setMessage('Game over! Please start a new game.')
        }
    }

    function getWinner(dealer, player) {
        if (dealer.count > player.count) {
            return 'dealer';
        } else if (dealer.count < player.count) {
            return 'player';
        } else {
            return 'push';
        }
    }

    function inputChange(e) {
        const inputValue = +e.target.value;
        // this.setState({ inputValue });
        setInputValue(inputValue)
    }

    function handleKeyDown(e) {
        const enter = 13;
        console.log(e.keyCode);

        if (e.keyCode === enter) {
            placeBet();
        }
    }

    function makePointsPublic() {
        axios.post('/api/user/public', {
            public: true
        })
            .then(response => {
                setPublicScore(true)
                getLeaderboard()
            })
            .catch(response => {
                console.log(response.data)
            })
    }

    function makePointsPrivate() {
        axios.post('/api/user/private', {
            public: false
        })
            .then(response => {
                setPublicScore(false)
                getLeaderboard()
            })
            .catch(response => {
                console.log(response.data)
            })
    }

    function editPublicLastPlay(state) {
        axios.post('/api/user/setPublicLastPlay', {
            state: state
        })
            .then(response => {
                // setPublicScore(false)
                // getLeaderboard()
                if (response.data === true) {
                    setPublicLastPlay(true)
                    getLeaderboard()
                }

                if (response.data === false) {
                    setPublicLastPlay(false)
                    getLeaderboard()
                }
            })
            .catch(response => {
                console.log(response.data)
            })
    }

    function getLeaderboard() {
        axios.get('/api/leaderboard')
            .then(response => {
                console.log(response.data)
                setLeaderboard(response.data)
            })
            .catch(response => {
                console.log(response.data)
            })
    }

    useEffect(() => {

        getLeaderboard()

        axios.get('/api/user/wallet-balance')
            .then(response => {
                // console.log("This ran wallet bal")
                console.log(response.data)

                if (response.data.total == 0 || response.data.total) {
                    console.log("This")
                    setWallet(response.data.total)
                    setLastClaim(response.data.last_claim)
                    setPublicScore(response.data.public)
                    setPublicLastPlay(response.data.public_last_play)

                    startNewGame();
                } else {
                    console.log("This this")
                    setWallet(100)
                    setLastClaim(new Date())
                    // setPublicScore(response.data.public)

                    startNewGame();
                }

            })
            .catch(response => {
                console.log(response.data)
            })

        // const body = document.querySelector('body');
        // body.addEventListener('keydown', handleKeyDown.bind(this));

        // let dealerCount;
        // const card1 = dealer.cards[0].number;
        // const card2 = dealer.cards[1].number;
        // if (card2) {
        //     dealerCount = dealer.count;
        // } else {
        //     if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        //         dealerCount = 10;
        //     } else if (card1 === 'A') {
        //         dealerCount = 11;
        //     } else {
        //         dealerCount = card1;
        //     }
        // }

    }, []);

    function handleSignInRedirect() {
        console.log("TODO")

        let newLink = ''

        if (false) {
            newLink = `https://accounts.articles.media`;
        } else {
            newLink = process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS_ADDRESS;
        }

        newLink = newLink + `/login?redirect=` + encodeURIComponent(window.location.href) + `&type=subdomain`

        window.location.href = newLink
    }

    return (
        <div className='blackjack-page' id='fullscreen-root'>

            <img
                className="background"
                src={`${process.env.NEXT_PUBLIC_CDN}games/Blackjack/background-small.jpg`}
            ></img>

            <div className="side-bar">

                {userDetails ?
                    <ArticlesButton
                        className={`w-100`}
                        style={{ marginBottom: '0.5rem' }}
                        small
                        onClick={() => {
                            axios.post('/api/user/signout').then(response => {
                                
                                // console.log(response.data)
                            })
                            // userTokenMutate()
                            // userDetailsMutate()
                        }}
                    >
                        <i className="fad fa-sign-out fa-rotate-180"></i>
                        Sign Out
                    </ArticlesButton>
                    :
                    <ArticlesButton
                        className={`w-100`}
                        style={{ marginBottom: '0.5rem' }}
                        small
                        onClick={() => {
                            handleSignInRedirect()
                        }}
                    >
                        <i className="fad fa-sign-in fa-rotate-180"></i>
                        Sign In
                    </ArticlesButton>
                }

                <div className='d-flex mb-2'>

                    <Link href={'https://github.com/Articles-Joey/blackjack'} target='_blank' rel='noopener noreferrer' className='w-100'>
                        <ArticlesButton
                            className={`w-100`}
                            small
                            onClick={() => {
    
                            }}
                        >
                            <i className="fab fa-github"></i>
                            Github
                        </ArticlesButton>
                    </Link>
    
                    <ArticlesButton
                        className={`w-100`}
                        small
                        active={isFullscreen}
                        onClick={() => {
                            if (!isFullscreen) {
                                requestFullscreen('fullscreen-root')
                            } else {
                                exitFullscreen()
                            }
                        }}
                    >
                        <i className="fad fa-expand"></i>
                        {isFullscreen ? 'Exit Full' : 'Fullscreen'}
                        {/* Fullscreen */}
                    </ArticlesButton>

                </div>

                {userDetails &&
                    <div className="card card-articles card-sm mb-2">

                        <div className="card-header py-2 d-flex justify-content-between">

                            <h6 className='mb-0'>Next Claim</h6>

                            <div className="badge bg-black shadow-articles">
                                {/* <div><small>{format(new Date(), 'MM/dd/yy hh:mmaa')}</small></div> */}
                                {lastClaim &&
                                    <Countdown
                                        daysInHours={true}
                                        date={add(new Date(lastClaim), { hours: 24 })}
                                    />
                                }
                            </div>

                        </div>

                        <div className="card-body p-2">

                            <div><small>One claim per 24 hours</small></div>

                            {/* <div>+100 points</div> */}
                            <ArticlesButton
                                disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24 || !userDetails}
                                className="mb-1 w-100"
                                onClick={() => {
                                    claim()
                                }}
                            >
                                Claim 100 Points
                            </ArticlesButton>

                            <div className='lh-sm'>
                                {lastClaim && <div className='l'><small>Next claim {format(add(new Date(lastClaim), { hours: 24 }), 'MM/dd/yy hh:mmaa')}</small></div>}
                            </div>

                        </div>

                    </div>
                }

                <div className="card card-articles">

                    <div className="card-header py-2 d-flex justify-content-between align-items-center">

                        <h6 className='mb-0'>Leaderboard</h6>

                        <div>
                            <span className="badge bg-black shadow-articles">
                                Top 100
                            </span>

                            <span onClick={() => getLeaderboard()} className="badge bg-black badge-hover shadow-articles" style={{ cursor: 'pointer', marginLeft: '0.25rem' }}>
                                <i className='fad fa-redo me-0'></i>
                            </span>
                        </div>

                    </div>

                    <div className="card-body p-0">

                        <div className='p-2'>
                            {publicScore == true && <div>

                                <ArticlesButton onClick={() => makePointsPrivate()} className="w-100 mb-2">Leave Leaderboard</ArticlesButton>

                                {/* <div className='d-flex justify-content-between align-items-center'>

                                    <b className='mb-0'>Show last play?</b>
                                    
                                    <div>
                                        <ArticlesButton small onClick={() => editPublicLastPlay(false)} className={` ${!publicLastPlay && 'active'}`}>No</ArticlesButton>
                                        <ArticlesButton small onClick={() => editPublicLastPlay(true)} className={` ${publicLastPlay && 'active'}`}>Yes</ArticlesButton>
                                    </div>
                                </div> */}

                            </div>}

                            {!publicScore &&
                                <div>
                                    <ArticlesButton disabled={!userDetails} onClick={() => makePointsPublic()} className="w-100 mb-2">Join Leaderboard</ArticlesButton>
                                    <div className='mb-2 lh-sm'><small>Display name and wallet balance will be added to Leaderboard.</small></div>
                                </div>}
                        </div>

                        {/* <hr /> */}

                        {/* <div className="d-flex justify-content-between border-bottom">
                            <div>Display Name</div>
                            <div>Points</div>
                        </div> */}

                        <div className='leaderboard-results'>
                            {leaderboard.map((doc, i) =>
                                <div key={doc._id} className="result d-flex flex-column justify-content-between border-bottom py-1">

                                    <div className='d-flex justify-content-between lh-sm'>

                                        <div className='d-flex'>

                                            <h6 className='mb-0 me-1'>{i + 1}</h6>

                                            <div className='lh-sm'>

                                                <ViewUserModal
                                                    populated_user={doc.populated_user}
                                                    user_id={doc.user_id}
                                                // name={`${doc.populated_user?.display_name}`}
                                                // buttonType={'badge'}
                                                />

                                                {/* <div>{doc.populated_user.display_name}</div> */}

                                            </div>

                                        </div>

                                        <div><b>{doc.total}</b></div>

                                    </div>

                                    {/* (doc.last_play && doc.public_last_play) */}
                                    {(doc.last_play) && <small className='mt-1' style={{ fontSize: '0.75rem' }}>Played: {format(new Date(doc.last_play), 'MM/d/yy hh:mmaa')}</small>}

                                </div>
                            )}
                        </div>

                    </div>

                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <span className='small'>Page: <b>1 of 1</b></span>
                        <span>
                            <ArticlesButton disabled small className="">
                                <i className="fad fa-caret-left fa-lg me-0"></i>
                            </ArticlesButton>
                            <ArticlesButton disabled small className="ms-1">
                                <i className="fad fa-caret-right fa-lg me-0"></i>
                            </ArticlesButton>
                        </span>
                    </div>

                </div>

            </div>

            <div className='game'>

                <img className='mb-1' src="/img/icon.png" height={100} alt="" />

                {!userDetails?.user_id ?
                    <div>
                        <h4 className='mb-3 mt-2'>Please login to play</h4>
                        <div className='d-flex justify-content-center mb-4'>
                            {/* <Link
                            href={'/'}
                            className=""
                        > */}
                            <ArticlesButton
                                onClick={() => {
                                    // userTokenMutate()
                                    // userDetailsMutate()
                                    handleSignInRedirect()
                                }}
                            >
                                Login
                            </ArticlesButton>
                            {/* </Link> */}
                        </div>
                    </div>
                    :
                    <>
                        <div className="buttons mb-2">
                            {currentBet &&
                                <>
                                    <ArticlesButton small disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24} className='me-4' onClick={() => { startNewGame() }}>New Game</ArticlesButton>
                                    <ArticlesButton small className='' onClick={() => { hit() }}>Hit</ArticlesButton>
                                    <ArticlesButton small className='' onClick={() => { stand() }}>Stand</ArticlesButton>
                                </>
                            }
                        </div>

                        <p className='mb-2'>Points: <b>{wallet}</b></p>

                        {
                            !currentBet ?
                                <div className="input-bet d-flex justify-content-center flex-column mb-3">

                                    <div className='d-flex align-items-center  mb-2'>
                                        <div className='me-2'>
                                            <ArticlesButton className='' onClick={() => { setInputValue(1) }}>1</ArticlesButton>
                                            <ArticlesButton className='' onClick={() => { setInputValue(5) }}>5</ArticlesButton>
                                            <ArticlesButton className='' onClick={() => { setInputValue(20) }}>20</ArticlesButton>
                                            <ArticlesButton className='' onClick={() => { setInputValue(50) }}>50</ArticlesButton>
                                            <ArticlesButton className='' onClick={() => { setInputValue(100) }}>100</ArticlesButton>
                                        </div>

                                        <form>
                                            <input style={{ width: '100px' }} className='form-control' type="text" name="bet" placeholder="" value={inputValue} onChange={e => setInputValue(parseInt(e.target.value))} />
                                        </form>
                                    </div>

                                    <ArticlesButton
                                        className=''
                                        small
                                        onClick={() => { placeBet() }}
                                    >
                                        Place Bet
                                    </ArticlesButton>

                                </div>
                                : null
                        }

                        {
                            gameOver ?
                                <div className="buttons">
                                    <ArticlesButton
                                        small
                                        className=''
                                        onClick={() => { startNewGame('continue') }}
                                    >
                                        Continue
                                    </ArticlesButton>
                                </div>
                                : null
                        }

                        {currentBet &&
                            <div className='container'>
                                <div className='d-flex flex-column align-items-center w-100'>

                                    <div className='d-flex flex-column align-items-center'>
                                        <p className='mb-0 mt-3'>Your Hand ({player.count})</p>

                                        <table className="cards">
                                            <tbody>
                                                <tr>
                                                    {player.cards.map((card, i) => {
                                                        return <Card key={i} number={card.number} suit={card.suit} />
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='d-flex flex-column align-items-center'>
                                        <p className='mb-0 mt-3'>{`Dealer's Hand`} ({dealer.count})</p>
                                        <table className="cards">
                                            <tbody>
                                                <tr>
                                                    {dealer.cards.map((card, i) => {
                                                        return <Card key={i} number={card.number} suit={card.suit} />;
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>
                        }

                        <p>{message}</p>

                    </>}

            </div>

            {/* <Ad
                section={"Games"}
                section_id={'Blackjack'}
            /> */}

        </div>
    );

};

const Card = ({ number, suit }) => {
    const combo = (number) ? `${number}${suit}` : null;
    const color = (suit === '♦' || suit === '♥') ? 'card-red' : '';

    return (
        <td>
            <div className={`blackjack-card card ${color}`}>
                {combo}
            </div>
        </td>
    );
};