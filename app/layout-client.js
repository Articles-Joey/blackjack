"use client"
import { Suspense } from 'react';

import packageInfo from '@/package.json';

import { useStore } from '@/hooks/useStore';
import { useAudioStore } from '@/hooks/useAudioStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';
import { useSocketStore } from '@/hooks/useSocketStore';

import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';
// import ToontownModeHandler from '@articles-media/articles-dev-box/ToontownModeHandler';
import GlobalClientModals from '@articles-media/articles-dev-box/GlobalClientModals';

export default function LayoutClient({ children }) {

    // const audioSettings = useAudioStore((state) => state?.audioSettings);

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
            {/* <ToontownModeHandler
                useStore={useStore}
            /> */}
            <Suspense>
                <GlobalClientModals
                    useStore={useStore}
                    useAudioStore={useAudioStore}
                    useTouchControlsStore={useTouchControlsStore}
                    useSocketStore={useSocketStore}

                    packageInfo={packageInfo}
                    settingsModalConfig={{
                        tabs: {
                            'Graphics': {
                                darkMode: true,
                                landingAnimation: true
                            },
                            'Audio': {
                                sliders: [
                                    ...useAudioStore.getState().audioSettings ? Object.keys(useAudioStore.getState().audioSettings).filter(key => key !== "enabled").map(key => ({
                                        key,
                                        label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    })) 
                                    : 
                                    [],
                                    // {
                                    //     key: "gameVolume",
                                    //     label: "Game Volume"
                                    // },
                                    // {
                                    //     key: "musicVolume",
                                    //     label: "Music Volume"
                                    // }
                                ]
                            },
                            'Controls': {
                                touchControls: true
                                // defaultKeyBindings: {
                                //     // moveUp: "W",
                                //     // moveDown: "S",
                                //     // moveLeft: "A",
                                //     // moveRight: "D",
                                // }
                            },
                            'Multiplayer': {
                                serverUrl: true,
                            },
                            'Other': {
                                // toontownMode: true,
                            },
                            'Debug': {
                                showStats: false,
                                children: <>

                                </>,
                            }
                        }
                    }}
                    infoModalConfig={{
                        previewImage: "img/game-preview.webp",
                    }}
                />
            </Suspense>
        </>
    );
}
