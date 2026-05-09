"use client"
import { lazy } from 'react'
import Link from 'next/link'
import Countdown from 'react-countdown';
import { format, add, differenceInHours } from 'date-fns';

import ViewUserModal from '@articles-media/articles-dev-box/ViewUserModal';
import ArticlesButton from '@/components/UI/Button'
import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { useStore } from '@/hooks/useStore';
import { useGameState } from '@/hooks/useGameState';

const SessionButton = lazy(() => import('@articles-media/articles-dev-box/SessionButton'));
const ReturnToLauncherButton = lazy(() => import('@articles-media/articles-dev-box/ReturnToLauncherButton'));

export default function Sidebar() {

    const darkMode = useStore((state) => state.darkMode);

    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);
    const { data: userDetails } = useUserDetails({ token: userToken });

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const {
        leaderboard,
        lastClaim,
        publicScore,
        wallet,
        claim,
        getWalletBalance,
        makePointsPublic,
        makePointsPrivate,
        getLeaderboard,
    } = useGameState();

    function Buttons() {
        return (
            <div>

                <div className='d-flex flex-wrap mb-3'>

                    {/* {false && <>
                        <div className='w-50 flex-shrink-0'>
    
                        </div>
    
                        <ArticlesButton
                            className={`w-50 flex-shrink-0`}
                            small
                            onClick={() => {
                                useStore.getState().setDarkMode(!darkMode);
                            }}
                        >
                            <i className="fas fa-sun"></i>
                            Dark Mode
                        </ArticlesButton>
    
                        <Link href={'https://github.com/Articles-Joey/blackjack'} target='_blank' rel='noopener noreferrer' className='w-50'>
                            <ArticlesButton
                                className={`w-100`}
                                small
                                onClick={() => { }}
                            >
                                <i className="fab fa-github"></i>
                                Github
                            </ArticlesButton>
                        </Link>
    
                        <ArticlesButton
                            className={`w-50`}
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
                        </ArticlesButton>
                    </>} */}

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

                </div>

                <div className="extras">

                    <div className='SessionButton-wrapper'>
                        <SessionButton
                            port={process.env.NEXT_PUBLIC_GAME_PORT}
                            friendsButton={true}
                            enableTextfit={true}
                        />
                    </div>

                    <ReturnToLauncherButton />

                </div>

            </div>
        )
    }

    return (
        <div className="side-bar">

            {userDetails &&
                <div className="card card-articles card-sm mb-2">

                    <div className="card-header py-2 d-flex justify-content-between align-items-center">

                        <h6 className='mb-0'>Next Claim</h6>

                        <div>
                            <div className="badge bg-black shadow-articles me-1">
                                {lastClaim &&
                                    <Countdown
                                        daysInHours={true}
                                        date={add(new Date(lastClaim), { hours: 24 })}
                                    />
                                }
                            </div>

                            <div
                                className="badge bg-dark badge-hover shadow-articles"
                                onClick={() => getWalletBalance()}
                            >
                                <i className="fad fa-redo me-0"></i>
                            </div>
                        </div>

                    </div>

                    <div className="card-body p-2">

                        <div><small>One claim per 24 hours</small></div>

                        <ArticlesButton
                            disabled={differenceInHours(new Date(), new Date(lastClaim)) < 24 || !userDetails}
                            className="mb-1 w-100"
                            onClick={() => claim(userDetails)}
                        >
                            Claim 100 Points
                        </ArticlesButton>

                        <div className='lh-sm'>
                            {lastClaim && <div className='l'><small>Next claim {format(add(new Date(lastClaim), { hours: 24 }), 'MM/dd/yy hh:mmaa')}</small></div>}
                        </div>

                    </div>

                </div>
            }

            <div className="card card- mb-2">

                <div className="card-header py-2 d-flex justify-content-between align-items-center">

                    <h6 className='mb-0'>Leaderboard</h6>

                    <div>
                        <span className="badge bg-black shadow-articles me-1">
                            Top 100
                        </span>

                        <span onClick={() => getLeaderboard()} className="badge bg-black badge-hover shadow-articles">
                            <i className='fad fa-redo me-0'></i>
                        </span>
                    </div>

                </div>

                <div className="card-body p-0">

                    <div className='p-2'>
                        {publicScore == true && <div>

                            <ArticlesButton onClick={() => makePointsPrivate()} className="w-100 mb-2">Leave Leaderboard</ArticlesButton>

                        </div>}

                        {!publicScore &&
                            <div>
                                <ArticlesButton
                                    disabled={!userDetails}
                                    onClick={() => makePointsPublic()}
                                    className="w-100 mb-2"
                                >
                                    Join Leaderboard
                                </ArticlesButton>
                                <div className='mb-2 lh-sm'><small>Display name and wallet balance will be added to Leaderboard.</small></div>
                            </div>}
                    </div>

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
                                            />

                                        </div>

                                    </div>

                                    <div><b>{doc.total}</b></div>

                                </div>

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

            <Buttons />

        </div>
    )
}