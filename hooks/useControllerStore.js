// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

export const useControllerStore = create((set) => ({
    controllerState: {},
    setControllerState: (newValue) => {
        set((prev) => ({
            controllerState: newValue
        }))
    },
}))