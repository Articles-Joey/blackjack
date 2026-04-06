// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useGameStore = create()(
    persist(
        (set, get) => ({

            nickname: '',
            setNickname: (newValue) => {
                set((prev) => ({
                    nickname: newValue
                }))
            },

            darkMode: false,
            toggleDarkMode: () => {
                set((prev) => ({
                    darkMode: !prev.darkMode
                }))
            },
            setDarkMode: (newValue) => {
                set((prev) => ({
                    darkMode: newValue
                }))
            },

            infoModal: false,
            setInfoModal: (newValue) => {
                set((prev) => ({
                    infoModal: newValue
                }))
            },

            settingsModal: false,
            setSettingsModal: (newValue) => {
                set((prev) => ({
                    settingsModal: newValue
                }))
            },

            creditsModal: false,
            setCreditsModal: (newValue) => {
                set((prev) => ({
                    creditsModal: newValue
                }))
            },

            showMenu: false,
            setShowMenu: (newValue) => {
                set((prev) => ({
                    showMenu: newValue
                }))
            },

        }),
        {
            name: 'catching-game-store', // name of the item in the storage (must be unique)
            // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(([key]) => ![
                        // Exclude list of keys to not persist
                        'infoModal',
                        'settingsModal',
                        'creditsModal',
                        'showMenu'
                    ].includes(key))
                ),
        },
    ),
)