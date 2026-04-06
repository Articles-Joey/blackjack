"use client"

// import { useStore } from '@/hooks/useStore'
import { useGameStore } from '@/hooks/useGameStore'
// import { Suspense } from 'react';
import dynamic from 'next/dynamic'
// import { useStore } from '../hooks/useStore'
// import CreditsModal from './CreditsModal'

// const KickedModal = dynamic(
//     () => import('@/components/UI/KickedModal'),
//     { ssr: false }
// )

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const CreditsModal = dynamic(
    () => import('@/components/UI/CreditsModal'),
    { ssr: false }
)

export default function GlobalClientModals() {

    const infoModal = useGameStore((state) => state.infoModal)
    const setInfoModal = useGameStore((state) => state.setInfoModal)

    const settingsModal = useGameStore((state) => state.settingsModal)
    const setSettingsModal = useGameStore((state) => state.setSettingsModal)

    const creditsModal = useGameStore((state) => state.creditsModal)
    const setCreditsModal = useGameStore((state) => state.setCreditsModal)
    // const { gameOver, setGameOver } = useGameStore()
    // const gameOver = useGameStore((state) => state.gameOver)
    // const setGameOver = useGameStore((state) => state.setGameOver)

    return (
        <>

            {/* {kickedStore &&
                <KickedModal
                    show={kickedStore}
                    setShow={setKickedStore}
                />
            } */}

            {creditsModal &&
                <CreditsModal
                    show={creditsModal}
                    setShow={setCreditsModal}
                />
            }

            {infoModal &&
                <InfoModal
                    show={infoModal}
                    setShow={setInfoModal}
                />
            }

            {settingsModal &&
                <SettingsModal
                    show={settingsModal}
                    setShow={setSettingsModal}
                />
            }

            {/* <GameControllerKeyboard onFinish={(text) => console.log("Keyboard finished:", text)} /> */}

        </>
    )
}