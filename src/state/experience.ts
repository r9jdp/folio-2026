import { create } from 'zustand';
import { applications, type AppId } from '@/content/apps';

export type Mode = 'showroom' | 'entering' | 'desktop' | 'driving';
export type InputOwner = 'none' | 'desktop' | 'driving';
export type EntryControl = 'auto' | 'scroll';
export type ExperienceState = {
  mode: Mode;
  activeApp: AppId | null;
  maximized: boolean;
  displayFocused: boolean;
  entryProgress: number;
  entryControl: EntryControl;
  inputOwner: InputOwner;
  drivePaused: boolean;
  startDrive: () => void;
  pauseDrive: () => void;
  resumeDrive: () => void;
  returnToPortfolio: () => void;
  enter: (control?: EntryControl) => void;
  seekEntry: (progress: number) => void;
  continueEntry: () => void;
  arrive: () => void;
  openApp: (app: AppId) => void;
  closeApp: () => void;
  focusDisplay: (focused: boolean) => void;
  toggleMaximized: () => void;
  exit: () => void;
};
export const useExperience = create<ExperienceState>((set) => ({
  mode: 'showroom',
  activeApp: null,
  maximized: false,
  displayFocused: false,
  entryProgress: 0,
  entryControl: 'auto',
  inputOwner: 'none',
  drivePaused: false,
  startDrive: () =>
    set((s) =>
      s.mode === 'showroom' || s.mode === 'desktop'
        ? { mode: 'driving', drivePaused: false, inputOwner: 'driving' }
        : s,
    ),
  pauseDrive: () =>
    set((s) => (s.mode === 'driving' ? { drivePaused: true, inputOwner: 'none' } : s)),
  resumeDrive: () =>
    set((s) => (s.mode === 'driving' ? { drivePaused: false, inputOwner: 'driving' } : s)),
  returnToPortfolio: () =>
    set((s) =>
      s.mode === 'driving'
        ? {
            mode: 'desktop',
            drivePaused: false,
            inputOwner: 'desktop',
            entryProgress: 1,
            maximized: false,
            displayFocused: false,
          }
        : s,
    ),
  enter: (entryControl = 'auto') =>
    set((s) =>
      s.mode === 'showroom'
        ? { mode: 'entering', entryProgress: 0, entryControl, inputOwner: 'none' }
        : s,
    ),
  seekEntry: (progress) =>
    set((s) =>
      s.mode === 'entering' && Number.isFinite(progress)
        ? { entryProgress: Math.max(0, Math.min(1, progress)), entryControl: 'scroll' }
        : s,
    ),
  continueEntry: () => set((s) => (s.mode === 'entering' ? { entryControl: 'auto' } : s)),
  arrive: () =>
    set((s) =>
      s.mode === 'entering' ? { mode: 'desktop', entryProgress: 1, inputOwner: 'desktop' } : s,
    ),
  openApp: (app) =>
    set((s) =>
      s.mode === 'desktop' && applications.some((a) => a.id === app && a.enabled)
        ? { activeApp: app, displayFocused: true }
        : s,
    ),
  closeApp: () => set((s) => (s.mode === 'desktop' ? { activeApp: null } : s)),
  focusDisplay: (displayFocused) => set((s) => (s.mode === 'desktop' ? { displayFocused } : s)),
  toggleMaximized: () => set((s) => (s.mode === 'desktop' ? { maximized: !s.maximized } : s)),
  exit: () =>
    set({
      mode: 'showroom',
      drivePaused: false,
      maximized: false,
      displayFocused: false,
      entryProgress: 0,
      entryControl: 'auto',
      inputOwner: 'none',
    }),
}));
