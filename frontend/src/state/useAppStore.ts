import { create } from 'zustand';

export type TabKey = 'home' | 'lessons' | 'downloads' | 'progress' | 'settings';

type AppState = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
}));
