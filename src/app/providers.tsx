import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { applyTheme, useUiStore } from '../store/uiStore';
import { LanguageProvider } from './language-context';
import { ThemeProvider } from './theme-context';

const queryClient = new QueryClient();

export function AppProviders() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
