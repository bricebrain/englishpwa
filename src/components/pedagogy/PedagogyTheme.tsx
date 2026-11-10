import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

const themes = {
  light: createTheme({ palette: { primary: { main: '#03915A' }, background: { default: '#EEEEEE' } }, shape: { borderRadius: 12 } }),
  dark: createTheme({ palette: { mode: 'dark', primary: { main: '#50C995' } }, shape: { borderRadius: 12 } }),
};

export function PedagogyTheme({ children }: { children: ReactNode }) {
  const { resolved } = useTheme();
  return <ThemeProvider theme={themes[resolved]}>{children}</ThemeProvider>;
}
