import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isMobileSidebarOpen: boolean;
  isSidebarHidden: boolean;
  isTopbarHidden: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  toggleSidebarHidden: () => void;
  setSidebarHidden: (hidden: boolean) => void;
  toggleTopbarHidden: () => void;
  setTopbarHidden: (hidden: boolean) => void;
  resetLayout: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      isSidebarHidden: false,
      isTopbarHidden: false,
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      toggleSidebarHidden: () => set((state) => ({ isSidebarHidden: !state.isSidebarHidden })),
      setSidebarHidden: (hidden) => set({ isSidebarHidden: hidden }),
      toggleTopbarHidden: () => set((state) => ({ isTopbarHidden: !state.isTopbarHidden })),
      setTopbarHidden: (hidden) => set({ isTopbarHidden: hidden }),
      resetLayout: () => set({ isSidebarHidden: false, isTopbarHidden: false, isMobileSidebarOpen: false }),
    }),
    {
      name: 'campusflow-layout-preferences',
      partialize: (state) => ({
        isSidebarHidden: state.isSidebarHidden,
        isTopbarHidden: state.isTopbarHidden,
      }),
    }
  )
);
