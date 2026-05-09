import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import typicalZustandStoreExcludes from '@articles-media/articles-dev-box/typicalZustandStoreExcludes';
import typicalZustandStoreStateSlice from '@articles-media/articles-dev-box/typicalZustandStoreStateSlice';

import randomNicknameConfig from '@/util/randomNicknameConfig';

export const useStore = create()(
  persist(
    (set, get) => ({
      ...typicalZustandStoreStateSlice(
        set,
        get,
        randomNicknameConfig,
      ),
    }),
    {
      name: `${process.env.NEXT_PUBLIC_GAME_KEY}-site-storage`,
      version: 1,
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true)
      },
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ![
            ...typicalZustandStoreExcludes,
          ].includes(key))
        ),
    },
  ),
)