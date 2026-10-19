import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';

import { App } from '@/App';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MotionConfig>
        </PreferencesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
