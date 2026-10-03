"use client"
import { lazy } from 'react'
import Countdown from 'react-countdown';
import { format, add, differenceInHours } from 'date-fns';

import ViewUserModal from '@articles-media/articles-dev-box/ViewUserModal';
import ArticlesButton from '@/components/UI/Button'
import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useStore } from '@/hooks/useStore';
import { useGameState } from '@/hooks/useGameState';

const SessionButton = lazy(() => import('@articles-media/articles-dev-box/SessionButton'));
const ReturnToLauncherButton = lazy(() => import('@articles-media/articles-dev-box/ReturnToLauncherButton'));

export default function Sidebar() {


    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);
    const { data: userDetails } = useUserDetails({ token: userToken });


    const {
        leaderboard,
        lastClaim,
        publicScore,
        claim,
        getWalletBalance,
        makePointsPublic,
        makePointsPrivate,
        getLeaderboard,
    } = useGameState();

    function Buttons() {
        return (
            <Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: '1rem' }}>

                    

                    <GameMenuPrimaryButtonGroup
                        useStore={useStore}
                        type="GameMenu"
                        SettingsOverride={<></>}
                        SidebarOverride={<></>}
                        LeaveGameOverride={<></>}
                    />
                    <GameMenuPrimaryButtonGroup
                        useStore={useStore}
                        type="Landing"
                    />

                </Box>

                <Box>

                    <Box>
                        <SessionButton
                            port={process.env.NEXT_PUBLIC_GAME_PORT}
                            friendsButton={true}
                            enableTextfit={true}
                        />
                    </Box>

                    <ReturnToLauncherButton />

                </Box>

            </Box>
        )
    }

    return (
        <Box sx={{
            p: '0.5rem',
            zIndex: 2,
            '@media (min-width: 992px)': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '300px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            },
        }}>

            {userDetails &&
                <Box sx={{ bgcolor: 'game.card', border: '1px solid', borderColor: 'divider', borderRadius: '0.375rem', mb: '0.5rem' }}>

                    <Box sx={{ p: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>

                        <Typography variant="subtitle1" sx={{ m: 0, fontSize: '1rem', fontWeight: 500, lineHeight: 1.2 }}>Next Claim</Typography>

                        <Box>
                            <Box sx={{ display: 'inline-block', bgcolor: '#000', color: '#fff', fontSize: '0.75em', fontWeight: 700, px: '0.65em', py: '0.35em', borderRadius: '0.375rem', mr: '0.25rem', boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)' }}>
                                {lastClaim &&
                                    <Countdown
                                        daysInHours={true}
                                        date={add(new Date(lastClaim), { hours: 24 })}
                                    />
                                }
                            </Box>

                            <IconButton aria-label="Refresh wallet balance"
                                sx={{ bgcolor: '#212529', color: '#fff', p: '0.15rem', borderRadius: '0.375rem', boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#000' } }}
                                onClick={() => getWalletBalance()}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Box>

                    </Box>

                    <Box sx={{ p: '0.5rem' }}>

                        <Box><small>One claim per 24 hours</small></Box>

                        <ArticlesButton
                            disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24 || !userDetails}
                            sx={{ mb: '0.25rem', width: '100%' }}
                            onClick={() => claim(userDetails)}
                        >
                            Claim 100 Points
                        </ArticlesButton>

                        <Box sx={{ lineHeight: 1.25 }}>
                            {lastClaim && <Box><small>Next claim {format(add(new Date(lastClaim), { hours: 24 }), 'MM/dd/yy hh:mmaa')}</small></Box>}
                        </Box>

                    </Box>

                </Box>
            }

            <Box sx={{ bgcolor: 'game.card', border: '1px solid', borderColor: 'divider', borderRadius: '0.375rem', mb: '0.5rem' }}>

                <Box sx={{ p: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>

                    <Typography variant="subtitle1" sx={{ m: 0, fontSize: '1rem', fontWeight: 500, lineHeight: 1.2 }}>Leaderboard</Typography>

                    <Box>
                        <Box component="span" sx={{ display: 'inline-block', bgcolor: '#000', color: '#fff', fontSize: '0.75em', fontWeight: 700, px: '0.65em', py: '0.35em', borderRadius: '0.375rem', mr: '0.25rem', boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)' }}>
                            Top 100
                        </Box>

                        <IconButton aria-label="Refresh leaderboard" onClick={() => getLeaderboard()} sx={{ bgcolor: '#212529', color: '#fff', p: '0.15rem', borderRadius: '0.375rem', boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#000' } }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>

                </Box>

                <Box sx={{ p: 0 }}>

                    <Box sx={{ p: '0.5rem' }}>
                        {publicScore == true && <Box>

                            <ArticlesButton onClick={() => makePointsPrivate()} sx={{ width: '100%', mb: '0.5rem' }}>Leave Leaderboard</ArticlesButton>

                        </Box>}

                        {!publicScore &&
                            <Box>
                                <ArticlesButton
                                    disabled={!userDetails}
                                    onClick={() => makePointsPublic()}
                                    sx={{ width: '100%', mb: '0.5rem' }}
                                >
                                    Join Leaderboard
                                </ArticlesButton>
                                <Box sx={{ mb: '0.5rem', lineHeight: 1.25 }}><small>Display name and wallet balance will be added to Leaderboard.</small></Box>
                            </Box>}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', '@media (min-width: 992px)': { gap: 0 } }}>
                        {leaderboard.map((doc, i) =>
                            <Box key={doc._id} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                p: '0.25rem',
                                width: '100%',
                                border: '1px solid rgb(190,190,190)',
                                '@media (min-width: 992px)': {
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                },
                            }}>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', lineHeight: 1.25 }}>

                                    <Box sx={{ display: 'flex' }}>

                                        <Typography variant="subtitle1" sx={{ m: 0, mr: '0.25rem', fontSize: '1rem', fontWeight: 500, lineHeight: 1.2 }}>{i + 1}</Typography>

                                        <Box sx={{ lineHeight: 1.25 }}>

                                            <ViewUserModal
                                                populated_user={doc.populated_user}
                                                user_id={doc.user_id}
                                            />

                                        </Box>

                                    </Box>

                                    <Box><b>{doc.total}</b></Box>

                                </Box>

                                {(doc.last_play) && <Box component="small" sx={{ mt: '0.25rem', fontSize: '0.75rem' }}>Played: {format(new Date(doc.last_play), 'MM/d/yy hh:mmaa')}</Box>}

                            </Box>
                        )}
                    </Box>

                </Box>

                <Box sx={{ p: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box component="span" sx={{ fontSize: '0.875em' }}>Page: <b>1 of 1</b></Box>
                    <Box component="span">
                        <ArticlesButton disabled small aria-label="Previous leaderboard page">
                            <ArrowLeftIcon />
                        </ArticlesButton>
                        <ArticlesButton disabled small aria-label="Next leaderboard page" sx={{ ml: '0.25rem' }}>
                            <ArrowRightIcon />
                        </ArticlesButton>
                    </Box>
                </Box>

            </Box>

            <Buttons />

        </Box>
    )
}
