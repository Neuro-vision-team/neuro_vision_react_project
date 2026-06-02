import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface UiState {
  emergencyOpen: boolean;
  dir: 'ltr' | 'rtl';
  theme: Theme;
  setEmergencyOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleDir: () => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'ui-theme';
const LEGACY_THEME_KEY = 'app_theme';

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const persistTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(THEME_KEY, theme);
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY) ?? window.localStorage.getItem(LEGACY_THEME_KEY);
  return stored === 'light' ? 'light' : 'dark';
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useUiStore = create<UiState>((set) => ({
  emergencyOpen: false,
  dir: 'ltr',
  theme: initialTheme,
  setEmergencyOpen: (open) => set({ emergencyOpen: open }),
  setTheme: (theme) => {
    persistTheme(theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleDir: () => set((state) => ({ dir: state.dir === 'ltr' ? 'rtl' : 'ltr' })),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      persistTheme(nextTheme);
      applyTheme(nextTheme);
      return { theme: nextTheme };
    }),
}));
