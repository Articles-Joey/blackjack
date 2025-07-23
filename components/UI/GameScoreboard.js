import { useEffect, useState } from 'react'

// import axios from 'axios'

import Modal from 'react-bootstrap/Modal';

// import { useHotkeys } from 'react-hotkeys-hook';

import ViewUserModal from '@/components/UI/ViewUserModal';
import ArticlesSwitch from '@/components/UI/ArticlesSwitch';
import ArticlesButton from '@/components/UI/Button';
import useGameScoreboard from '@/hooks/useGameScoreboard';

function Page({ game, reloadScoreboard, setReloadScoreboard }) {

    const [showSettings, setShowSettings] = useState(false)

    // const [scoreboard, setScoreboard] = useState([])

    const [visible, setVisible] = useState(false)

    const {
        data: scoreboard,
        isLoading: scoreboardIsLoading,
        mutate: scoreboardMutate
    } = useGameScoreboard({
        game: game
    })

    // function loadScoreboard() {

    //     axios.get('/api/community/games/scoreboard', {
    //         params: {
    //             game: game
    //         }
    //     })
    //         .then(response => {
    //             console.log(response.data)
    //             setScoreboard(response.data)
    //         })
    //         .catch(response => {
    //             console.log(response.data)
    //         })

    // }

    useEffect(() => {

        // loadScoreboard()

    }, [])

    useEffect(() => {

        if (reloadScoreboard) {
            setReloadScoreboard(false)
            // loadScoreboard()
            scoreboardMutate()
        }

    }, [reloadScoreboard])

    return (
        <div className="scoreboard">

            <Modal show={showSettings} size={'md'} className="articles-modal" centered onHide={() => setShowSettings(false)}>

                <Modal.Header>
                    <Modal.Title>
                        Scoreboard Settings
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    <div
                        className="d-flex justify-content-between align-items-center"
                        onClick={() => setVisible(!visible)}
                    >

                        <div>
                            <i className="fas fa-trophy-alt"></i>
                            <span>Join Scoreboard?</span>
                        </div>

                        <ArticlesSwitch
                            checked={visible}
                        />

                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <ArticlesButton
                        variant="articles"
                        onClick={() => {
                            setShowSettings(false)
                        }}
                    >
                        Close
                    </ArticlesButton>

                    {/* It is async */}
                    {/* <ArticlesButton variant="success" onClick={() => {
                        setShowSettings(false)
                    }}>
                        Save
                    </ArticlesButton> */}

                </Modal.Footer>

            </Modal>

            <div className="card card-articles card-sm mb-3 mb-lg-0">

                <div className="card-header d-flex justify-content-between align-items-center">

                    <span>{game} Scoreboard</span>

                    <ArticlesButton
                        onClick={() => {
                            scoreboardMutate()
                        }}
                        small
                    >
                        <i className="fad fa-redo me-0"></i>
                    </ArticlesButton>

                </div>

                <div className="card-body p-0">

                    {(scoreboard?.length || 0) == 0 &&
                        <div className="small p-2">No scores yet</div>
                    }

                    {scoreboard?.map((doc, i) =>
                        <div key={doc._id} className="result d-flex flex-column justify-content-between border-bottom p-2">

                            <div className='d-flex justify-content-between lh-sm'>

                                <div className='d-flex'>

                                    <h5 className='mb-0 me-3'>{i + 1}</h5>

                                    <div className='lh-sm'>

                                        <ViewUserModal
                                            populated_user={doc.populated_user}
                                            user_id={doc.user_id}
                                        />

                                    </div>

                                </div>

                                <div><h5 className="mb-0">{doc.score || doc.total}</h5></div>

                            </div>

                            {(doc.last_play && doc.public_last_play) && <small className='mt-1' style={{ fontSize: '0.75rem' }}>Played: {format(new Date(doc.last_play), 'MM/d/yy hh:mmaa')}</small>}

                        </div>
                    )}

                </div>

                <div className="card-footer d-flex justify-content-between align-items-center">

                    <div className='small'>Play to get on the board!</div>

                    <ArticlesButton
                        small
                        onClick={() => {
                            setShowSettings(true)
                        }}
                    >
                        <i className="fad fa-cog me-0"></i>
                    </ArticlesButton>

                </div>

            </div>

        </div>
    )
}

export default Page;