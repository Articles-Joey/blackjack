"use client"
import { useEffect, lazy } from 'react'

import { differenceInHours } from 'date-fns';

const Ad = lazy(() => import('@articles-media/articles-dev-box/Ad'));
// import Ad from '@articles-media/articles-dev-box/Ad';

import ArticlesButton from '@/components/UI/Button'

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';

import { useStore } from '@/hooks/useStore';
import { useGameState } from '@/hooks/useGameState';
import Sidebar from '@/components/UI/Sidebar';
import SessionButton from '@articles-media/articles-dev-box/SessionButton';
import AudioHandler from '@/components/AudioHandler';

const game_name = "Blackjack";

export default function BlackjackPage() {

    const darkMode = useStore((state) => state.darkMode);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        process.env.NEXT_PUBLIC_GAME_PORT
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    // const userReduxState = useSelector((state) => state.auth.user_details);
    const userReduxState = false

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
        getLeaderboard,
        getWalletBalance,
    } = useGameState();

    // const reduxAds = useSelector((state) => state.ads.ads)

    useEffect(() => {
        getLeaderboard()
        getWalletBalance()
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

            <AudioHandler />

            <img
                className="background"
                src={`${process.env.NEXT_PUBLIC_CDN}games/Blackjack/background-small.jpg`}
            ></img>

            <Sidebar />

            <div className='game'>

                <img className='mb-1' src="/img/icon.png" height={100} alt="" />

                {!userDetails?.user_id ?
                    <div>
                        <h4 className='mb-3 mt-2'>Please login to play</h4>
                        <div className='d-flex justify-content-center mb-4'>

                            {/* <ArticlesButton
                                onClick={() => {
                                    handleSignInRedirect()
                                }}
                            >
                                Login
                            </ArticlesButton> */}

                            <SessionButton
                                port={process.env.NEXT_PUBLIC_GAME_PORT}
                                size="lg"
                            />

                        </div>
                    </div>
                    :
                    <>
                        <div className="buttons mb-2">
                            {currentBet &&
                                <>
                                    <ArticlesButton small disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24} className='me-4' onClick={() => { startNewGame() }}>New Game</ArticlesButton>
                                    <ArticlesButton small className='' onClick={() => { hit() }}>Hit</ArticlesButton>
                                    <ArticlesButton small className='' onClick={() => { stand(userDetails) }}>Stand</ArticlesButton>
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
                                        onClick={() => { placeBet(userDetails) }}
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

            <Ad
                style="Default"
                section={"Games"}
                section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                darkMode={darkMode ? true : false}
                user_ad_token={userToken}
                userDetails={userDetails}
                userDetailsLoading={userDetailsLoading}
            />

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