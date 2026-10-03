"use client"
import { Suspense, useEffect, lazy } from 'react'

import { differenceInHours } from 'date-fns';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
import { useAudioStore } from '@/hooks/useAudioStore';

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
        <Box sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.mode === 'dark' ? '#000' : '#fff',
                '@media (min-width: 992px)': {
                    minHeight: '100vh',
                    pb: 0,
                    flexDirection: 'row',
                },
                '& .ad-wrap': {
                    mx: 'auto',
                    '@media (min-width: 992px)': {
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        right: '1rem',
                    },
                },
            })} id='fullscreen-root'>

            <AudioHandler />

            <Box
                component="img"
                src={`${process.env.NEXT_PUBLIC_CDN}games/Blackjack/background-small.jpg`}
                alt=""
                sx={(theme) => ({
                    position: 'fixed',
                    top: 0,
                    opacity: theme.palette.mode === 'dark' ? 0.2 : 0.5,
                    height: '100vh',
                    width: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                })}
            />

            <Sidebar />

            <Box sx={{
                p: '3rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minWidth: 0,
                zIndex: 1,
                '@media (min-width: 992px)': {
                    mx: 'calc(250px + 1rem)',
                },
            }}>

                <Box component="img" src="/img/icon.png" height={100} alt="" sx={{ mb: '0.25rem' }} />

                {!userDetails?.user_id ?
                    <Box>
                        <Typography variant="h4" sx={{ mb: '1rem', mt: '0.5rem', fontSize: '1.5rem' }}>Please login to play</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: '1.5rem' }}>

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

                        </Box>
                    </Box>
                    :
                    <>
                        <Box sx={{ mb: '0.5rem' }}>
                            {currentBet &&
                                <>
                                    <ArticlesButton small disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24} sx={{ mr: '1.5rem' }} onClick={() => { startNewGame() }}>New Game</ArticlesButton>
                                    <ArticlesButton small onClick={() => { hit() }}>Hit</ArticlesButton>
                                    <ArticlesButton small onClick={() => { stand(userDetails) }}>Stand</ArticlesButton>
                                </>
                            }
                        </Box>

                        <Typography sx={{ mb: '0.5rem' }}>Points: <b>{wallet}</b></Typography>

                        {
                            !currentBet ?
                                <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', mb: '1rem' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: '0.5rem' }}>
                                        <Box sx={{ mr: '0.5rem' }}>
                                            <ArticlesButton onClick={() => { setInputValue(1) }}>1</ArticlesButton>
                                            <ArticlesButton onClick={() => { setInputValue(5) }}>5</ArticlesButton>
                                            <ArticlesButton onClick={() => { setInputValue(20) }}>20</ArticlesButton>
                                            <ArticlesButton onClick={() => { setInputValue(50) }}>50</ArticlesButton>
                                            <ArticlesButton onClick={() => { setInputValue(100) }}>100</ArticlesButton>
                                        </Box>

                                        <Box component="form" onSubmit={event => event.preventDefault()}>
                                            <TextField
                                                size="small"
                                                type="text"
                                                name="bet"
                                                value={Number.isNaN(inputValue) ? '' : inputValue}
                                                onChange={e => setInputValue(parseInt(e.target.value))}
                                                slotProps={{ htmlInput: { 'aria-label': 'Bet amount', inputMode: 'numeric' } }}
                                                sx={{ width: '100px' }}
                                            />
                                        </Box>
                                    </Box>

                                    <ArticlesButton
                                        
                                        small
                                        onClick={() => { 
                                            useAudioStore.getState().playCardSound()
                                            placeBet(userDetails) 
                                        }}
                                    >
                                        Place Bet
                                    </ArticlesButton>

                                </Box>
                                : null
                        }

                        {
                            gameOver ?
                                <Box>
                                    <ArticlesButton
                                        small
                                        
                                        onClick={() => { startNewGame('continue') }}
                                    >
                                        Continue
                                    </ArticlesButton>
                                </Box>
                                : null
                        }

                        {currentBet &&
                            <Box sx={{ width: '100%', px: '0.75rem', mx: 'auto', overflowX: 'auto' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography sx={{ mb: 0, mt: '1rem' }}>Your Hand ({player.count})</Typography>

                                        <Box component="table" sx={{ borderCollapse: 'collapse' }}>
                                            <tbody>
                                                <tr>
                                                    {player.cards.map((card, i) => {
                                                        return <Card key={i} number={card.number} suit={card.suit} />
                                                    })}
                                                </tr>
                                            </tbody>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography sx={{ mb: 0, mt: '1rem' }}>{`Dealer's Hand`} ({dealer.count})</Typography>
                                        <Box component="table" sx={{ borderCollapse: 'collapse' }}>
                                            <tbody>
                                                <tr>
                                                    {dealer.cards.map((card, i) => {
                                                        return <Card key={i} number={card.number} suit={card.suit} />;
                                                    })}
                                                </tr>
                                            </tbody>
                                        </Box>
                                    </Box>

                                </Box>
                            </Box>
                        }

                        <Typography sx={{ mb: '1rem' }}>{message}</Typography>

                    </>}

            </Box>

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

        </Box>
    );

};

const Card = ({ number, suit }) => {
    const combo = (number) ? `${number}${suit}` : null;

    return (
        <td>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                width: '66px',
                fontSize: '1.5rem',
                bgcolor: 'game.card',
                color: suit === '♦' || suit === '♥' ? 'red' : 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '0.375rem',
                '@media (min-width: 992px)': {
                    height: '150px',
                    width: '100px',
                },
            }}>
                {combo}
            </Box>
        </td>
    );
};
