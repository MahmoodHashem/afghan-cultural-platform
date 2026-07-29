import { create } from "zustand";

type UiState = {
  isMobileNavOpen: boolean;
  isDashboardSidebarOpen: boolean;
  setMobileNavOpen: (isOpen: boolean) => void;
  toggleMobileNav: () => void;
  setDashboardSidebarOpen: (isOpen: boolean) => void;
  toggleDashboardSidebar: () => void;
};

const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  isDashboardSidebarOpen: true,
  setMobileNavOpen: (isOpen) => set({ isMobileNavOpen: isOpen }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setDashboardSidebarOpen: (isOpen) => set({ isDashboardSidebarOpen: isOpen }),
  toggleDashboardSidebar: () =>
    set((state) => ({ isDashboardSidebarOpen: !state.isDashboardSidebarOpen })),
}));

export { useUiStore };
