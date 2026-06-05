import { create } from 'zustand';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'ui-theme';

// ─── Apply theme to DOM ────────────────────────────────────────────────────────
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// ─── Initial theme ─────────────────────────────────────────────────────────────
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

// Apply theme synchronously on import — prevents flash of wrong theme
const _initialTheme = getInitialTheme();
applyTheme(_initialTheme);

// ─── Store interface ───────────────────────────────────────────────────────────
interface UiState {
  theme: Theme;
  sidebarOpen: boolean;

  setTheme(theme: Theme): void;
  toggleTheme(): void;
  setSidebarOpen(open: boolean): void;
  toggleSidebar(): void;
}

export const useUiStore = create<UiState>((set) => ({
  theme:       _initialTheme,
  sidebarOpen: false,

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return { theme: next };
    });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
