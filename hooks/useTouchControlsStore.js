// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

export const useTouchControlsStore = create((set) => ({

    touchControls: {
        jump: false,
        left: false,
        right: false
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue
        }))
    }

}))