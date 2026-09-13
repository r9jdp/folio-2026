import { create } from 'zustand';
import { applications, type AppId } from '@/content/apps';
export type Mode = 'showroom' | 'entering' | 'desktop';
export type InputOwner = 'none' | 'desktop';
export type ExperienceState = {
  mode: Mode;
  activeApp: AppId | null;
  maximized: boolean;
  inputOwner: InputOwner;
  enter: () => void;
  arrive: () => void;
  openApp: (app: AppId) => void;
  closeApp: () => void;
  toggleMaximized: () => void;
  exit: () => void;
};
export const useExperience = create<ExperienceState>((set) => ({
  mode: 'showroom',
  activeApp: null,
  maximized: false,
  inputOwner: 'none',
  enter: () => set((s) => (s.mode === 'showroom' ? { mode: 'entering', inputOwner: 'none' } : s)),
  arrive: () =>
    set((s) => (s.mode === 'entering' ? { mode: 'desktop', inputOwner: 'desktop' } : s)),
  openApp: (app) =>
    set((s) =>
      s.mode === 'desktop' && applications.some((a) => a.id === app && a.enabled)
        ? { activeApp: app }
        : s,
    ),
  closeApp: () => set({ activeApp: null }),
  toggleMaximized: () => set((s) => ({ maximized: !s.maximized })),
  exit: () => set({ mode: 'showroom', maximized: false, inputOwner: 'none' }),
}));
