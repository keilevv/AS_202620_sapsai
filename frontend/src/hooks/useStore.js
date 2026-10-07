import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

const initialState = {
  // User
  user: null,

  // UI State
  uiState: {
    selectedPage: "home",
    showLoginAnimation: false,
  },
  preferences: {
    pageSize: 12,
    darkMode: false,
    language: "en",
  },
  accessToken: null,
};

const useStore = create(
  devtools(
    persist((set) => ({
      ...initialState,

      // Reset function
      resetStore: () => set({ ...initialState }),

      // User
      setUser: (userState) => {
        if (userState === null) {
          set({ user: null, accessToken: null });
        } else {
          set({ user: userState.user, accessToken: userState.accessToken });
        }
      },
      // UI State
      setUiState: (newUiState) =>
        set((state) => ({
          uiState: { ...state.uiState, ...newUiState },
        })),
      setSelectedPage: (newPage) =>
        set((state) => ({
          uiState: { ...state.uiState, selectedPage: newPage },
        })),
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      logout: () => set({ user: null, accessToken: null }),
    })),

    {
      name: "leaf-classifier-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useStore;
