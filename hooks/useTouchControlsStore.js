// import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createWithEqualityFn as create } from 'zustand/traditional'

const useTouchControlsStore = create()(
    persist(
        (set, get) => ({

            enabled: false,
            toggleEnabled: () => {
                set(() => ({
                    enabled: !get().enabled
                }))
            },
            setEnabled: (newValue) => {
                set((prev) => ({
                    enabled: newValue
                }))
            },

            touchControls: {
                jump: false,
                left: false,
                right: false,
                up: false,
                down: false,
            },
            setTouchControls: (newValue) => {
                set((prev) => ({
                    touchControls: newValue
                }))
            }

        }),
        {
            name: 'touch-controls-store',
            version: 1,
            partialize: (state) => ({
                enabled: state.enabled,
                // touchControls: state.touchControls
            }),
            // onRehydrateStorage: () => (state) => {
            //     state.setHasHydrated(true)
            // },
        },
    ),
)

export default useTouchControlsStore