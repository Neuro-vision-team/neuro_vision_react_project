import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes/router';
import { ApiError } from '../types/api';
import { LanguageProvider } from './language-context';
import { ThemeProvider } from './theme-context';

// ─── QueryClient — retry only on transient errors ─────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        // Never retry auth / permission errors
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403 || error.status === 422) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

export function AppProviders() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors theme="dark" />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
