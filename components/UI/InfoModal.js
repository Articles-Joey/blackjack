import { useEffect, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import ViewUserModal from "@/components/UI/ViewUserModal"

// import BasicLoading from "@/components/loading/BasicLoading";

// import powerups from "app/(site)/community/games/four-frogs/components/powerups";

// import games from "../constants/games";
const games = []

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";

const registeredGames = [
    'Four Frogs',
    'Race Game',
    'Eager Eagle',
    'Plinko',
    'Battle Trap',
    'Blackjack',
    'Ping Pong',
    'Tower Blocks',
    'Assets Gallery',
    'Tic Tac Toe',
    'Ocean Rings',
    'Maze',
    'School Run'
]

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    // const userReduxState = useSelector((state) => state.auth.user_details);
    const userReduxState = false

    const [showVideo, setShowVideo] = useState()

    useEffect(() => {

        if (!show.item) {
            setShow({
                ...show,
                item: games.find(game_obj => game_obj.name == show.game)
            })
        }

    }, [])

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    {!registeredGames.includes(show.game) &&
                        <IsDev>
                            <div className="p-3">

                                {userReduxState?.roles?.isDev &&
                                    <div className="bg-light border p-1">
                                        Global game info modal does not have this game registered.
                                    </div>
                                }

                            </div>
                        </IsDev>
                    }

                    <div className="p-3">

                        <div className="fw-bold mb-2">
                            {show.game || 'No game property provided'}
                        </div>

                        <div className="">
                            {show?.item?.short_description}
                        </div>

                    </div>

                    <hr />

                    {show?.item?.welcome &&
                        <div className="p-3 py-2 border-bottom">

                            <b>Welcome to {show?.item?.name}</b>
                            <p className='small mb-2'>
                                {show?.item?.welcome?.preview_text}
                            </p>

                            <div className="ratio ratio-16x9">
                                <img src={show?.item?.welcome?.preview_gif} alt="" />
                            </div>

                        </div>
                    }

                    <hr />

                    {show.game == 'Battle Trap' &&
                        <div className="p-3 py-1">

                            <div className="mb-3">
                                <b>Credits</b>
                            </div>

                            <div className="d-flex align-items-center mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <ViewUserModal
                                        user_id={"5e90cc96579a17440c5d7d52"}
                                        dangerousPopulate
                                    />
                                    <div className="">Developer</div>
                                </div>

                            </div>

                            <div className="d-flex align-items-center mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div className="">
                                    <div className="fw-bold">Articles Media</div>
                                    <div className="">Publisher</div>
                                </div>

                            </div>

                            <div className="d-flex mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <a href="https://sketchfab.com/3d-models/low-poly-chopper-aec69c979166446eb2c8e1503f570d26" target='_blank' rel="noreferrer" className="fw-bold">sketchfab.com/ArtyomOganesyan</a>
                                    <div className="small text-muted">Used for</div>
                                    <ul>
                                        <li>Low Poly Chopper</li>
                                    </ul>
                                </div>

                            </div>

                            <div className="d-flex mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <a href="https://sketchfab.com/supakorn.pim" target='_blank' rel="noreferrer" className="fw-bold">sketchfab.com/supakorn.pim</a>
                                    <div className="small text-muted">Used for</div>
                                    <ul>
                                        <li>Low Poly Scooter</li>
                                    </ul>
                                </div>

                            </div>

                            <div className="d-flex mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <a href="https://sketchfab.com/1-3D.com" target='_blank' rel="noreferrer" className="fw-bold">sketchfab.com/1-3D.com</a>
                                    <div className="small text-muted">Used for</div>
                                    <ul>
                                        <li>Low Poly Tricycle</li>
                                    </ul>
                                </div>

                            </div>

                            <div className="d-flex mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <a href="https://sketchfab.com/BeastSri" target='_blank' rel="noreferrer" className="fw-bold">sketchfab.com/BeastSri</a>
                                    <div className="small text-muted">Used for</div>
                                    <ul>
                                        <li>Low Poly Unicycle</li>
                                    </ul>
                                </div>

                            </div>

                            <div className="d-flex mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <a href="https://sketchfab.com/SebastianScaini" target='_blank' rel="noreferrer" className="fw-bold">sketchfab.com/SebastianScaini</a>
                                    <div className="small text-muted">Used for</div>
                                    <ul>
                                        <li>Toilet Tricycle</li>
                                    </ul>
                                </div>

                            </div>

                        </div>
                    }

                    {show?.item?.inspiration &&
                        <div className="p-3 border-bottom">
                            <div className="mb-2 fw-bold">Inspiration</div>
                            <div>{show?.item?.inspiration?.text}</div>
                            {show?.item?.inspiration?.video &&
                                <div className="inspiration-video-wrapper">

                                    {!showVideo &&
                                        <div
                                            className="play-button"
                                            onClick={() => {
                                                setShowVideo(true)
                                            }}
                                        >
                                            <div><i style={{ color: 'red' }} className="fab fa-youtube fa-4x me-0"></i></div>
                                            <div className="label">Play Video</div>
                                        </div>
                                    }

                                    <div style={{ position: 'relative' }} className="ratio ratio-16x9 bg-dark">

                                        {showVideo ?
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${show?.item?.inspiration?.video}?autoplay=1&mute=1`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            ></iframe>
                                            :
                                            <>
                                                {/* <img
                                                    onClick={() => {
                                                        setShowVideo(true)
                                                    }}
                                                    src={`${process.env.NEXT_PUBLIC_CDN}games/Race Game/inspo-animation.webp`}
                                                    fill
                                                    alt=""
                                                    style={{ objectFit: 'contain', maxWidth: '100%' }}
                                                    loading="lazy"
                                                /> */}
                                            </>
                                        }

                                    </div>

                                </div>
                            }
                        </div>
                    }

                    {show?.item?.attributions &&
                        <div className="p-3">
                            <div className="mb-2 fw-bold">Attributions</div>
                            <div>{show?.item?.attributions}</div>
                        </div>
                    }

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}