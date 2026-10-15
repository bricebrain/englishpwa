import { alpha, createTheme } from '@mui/material/styles';

/** Palette claire « Daylight Aurora » — partagée par MUI et les composants animés. */
export const tokens = {
  bg: '#F4F3F8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceHigh: '#EFEDF5',
  border: 'rgba(49,39,78,0.10)',
  borderStrong: 'rgba(49,39,78,0.20)',
  text: '#211B32',
  textMuted: '#6C657D',
  textFaint: '#918A9F',
  violet: '#7055E8',
  violetSoft: '#8068DE',
  pink: '#D83E88',
  coral: '#E85F43',
  amber: '#B96D00',
  lime: '#76A81D',
  mint: '#16875D',
  cyan: '#168CA8',
  red: '#D63F5A',
} as const;

export const gradients = {
  primary: `linear-gradient(135deg, ${tokens.violet} 0%, ${tokens.pink} 100%)`,
  sunrise: `linear-gradient(135deg, ${tokens.amber} 0%, ${tokens.coral} 55%, ${tokens.pink} 100%)`,
  ocean: `linear-gradient(135deg, ${tokens.cyan} 0%, ${tokens.violet} 100%)`,
  mint: `linear-gradient(135deg, ${tokens.lime} 0%, ${tokens.mint} 100%)`,
  card: 'linear-gradient(160deg, rgba(112,85,232,0.035) 0%, rgba(216,62,136,0.015) 100%)',
} as const;

export const displayFont = '"Bricolage Grotesque Variable", "Inter Variable", system-ui, sans-serif';
export const bodyFont = '"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.violet, light: tokens.violetSoft, dark: '#6A4DE0', contrastText: '#FFFFFF' },
    secondary: { main: tokens.pink, light: '#FF9CC6', dark: '#D93F82', contrastText: '#FFFFFF' },
    success: { main: tokens.mint, light: '#55B990', dark: '#0D6845', contrastText: '#FFFFFF' },
    warning: { main: tokens.amber, light: '#DFA448', dark: '#8A5000', contrastText: '#FFFFFF' },
    error: { main: tokens.red, light: '#FF8FA2', dark: '#D93653', contrastText: '#FFFFFF' },
    info: { main: tokens.cyan, light: '#54B7CA', dark: '#0B687D', contrastText: '#FFFFFF' },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.text, secondary: tokens.textMuted, disabled: tokens.textFaint },
    divider: tokens.border,
    action: { hover: 'rgba(49,39,78,0.06)', selected: alpha(tokens.violet, 0.12) },
  },
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: displayFont, fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontFamily: displayFont, fontSize: '1.35rem', fontWeight: 750, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h3: { fontFamily: displayFont, fontSize: '1.08rem', fontWeight: 700, letterSpacing: '-0.01em' },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '-0.005em' },
    overline: { fontWeight: 800, letterSpacing: '0.12em', fontSize: '0.68rem', lineHeight: 1.6 },
  },
  shape: { borderRadius: 4 }, // les valeurs numériques `borderRadius` des sx sont ×4 px
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': { colorScheme: 'light' },
        body: { overscrollBehavior: 'none', backgroundColor: tokens.bg },
        '*:focus-visible': { outline: `2px solid ${tokens.violetSoft}`, outlineOffset: 2 },
        '::selection': { background: alpha(tokens.violet, 0.45) },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          position: 'relative',
          borderRadius: 24,
          background: `${gradients.card}, ${tokens.surface}`,
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px -28px rgba(49,39,78,0.28)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
    },
    MuiCardActionArea: {
      styleOverrides: { root: { borderRadius: 'inherit' }, focusHighlight: { borderRadius: 'inherit' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 16,
          paddingInline: 18,
          transition: 'transform .15s ease, box-shadow .2s ease, background .2s ease',
          '&:active': { transform: 'scale(0.97)' },
        },
        sizeSmall: { minHeight: 36, borderRadius: 12, paddingInline: 12 },
        contained: {
          '&.Mui-disabled': { color: alpha(tokens.text, 0.55), opacity: 0.55, boxShadow: 'none' },
        },
        containedPrimary: {
          background: gradients.primary,
          boxShadow: `0 10px 28px -10px ${alpha(tokens.violet, 0.8)}`,
          '&:hover': { background: gradients.primary, filter: 'brightness(1.08)' },
        },
        containedSuccess: {
          background: gradients.mint,
          color: '#05140D',
          boxShadow: `0 10px 28px -12px ${alpha(tokens.mint, 0.8)}`,
          '&:hover': { background: gradients.mint, filter: 'brightness(1.05)' },
        },
        containedSecondary: {
          background: gradients.sunrise,
          boxShadow: `0 10px 28px -12px ${alpha(tokens.coral, 0.8)}`,
          '&:hover': { background: gradients.sunrise, filter: 'brightness(1.05)' },
        },
        outlined: {
          borderColor: tokens.borderStrong,
          color: tokens.text,
          background: 'rgba(49,39,78,0.025)',
          '&:hover': { borderColor: tokens.violetSoft, background: alpha(tokens.violet, 0.08) },
        },
        text: { '&:hover': { background: 'rgba(49,39,78,0.06)' } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          transition: 'transform .15s ease, background .2s ease',
          '&:active': { transform: 'scale(0.9)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 700, height: 28 },
        sizeSmall: { height: 24, fontSize: 11.5, borderRadius: 8 },
        filled: { background: 'rgba(49,39,78,0.07)' },
        outlined: { borderColor: tokens.borderStrong },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background: 'rgba(49,39,78,0.035)',
          transition: 'box-shadow .2s ease, background .2s ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border, borderWidth: 1.5 },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderStrong },
          '&.Mui-focused': { background: alpha(tokens.violet, 0.07), boxShadow: `0 0 0 4px ${alpha(tokens.violet, 0.18)}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.violet, borderWidth: 1.5 },
        },
        input: { paddingBlock: 16 },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 4,
          padding: 4,
          borderRadius: 16,
          background: 'rgba(49,39,78,0.035)',
          border: `1px solid ${tokens.border}`,
          flexWrap: 'wrap',
        },
        grouped: {
          border: '0 !important',
          borderRadius: '12px !important',
          margin: '0 !important',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          color: tokens.textMuted,
          paddingInline: 14,
          minHeight: 38,
          '&.Mui-selected': {
            color: '#fff',
            background: gradients.primary,
            boxShadow: `0 6px 18px -8px ${alpha(tokens.violet, 0.9)}`,
            '&:hover': { background: gradients.primary },
          },
        },
        sizeSmall: { minHeight: 34, paddingInline: 12, fontSize: 13 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 10, borderRadius: 99, backgroundColor: 'rgba(49,39,78,0.09)' },
        bar: { borderRadius: 99, background: gradients.primary },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 16, alignItems: 'flex-start', border: '1px solid transparent' },
        standardInfo: { background: alpha(tokens.cyan, 0.1), color: '#07566A', borderColor: alpha(tokens.cyan, 0.24) },
        standardSuccess: { background: alpha(tokens.mint, 0.1), color: '#0B6040', borderColor: alpha(tokens.mint, 0.24) },
        standardWarning: { background: alpha(tokens.amber, 0.1), color: '#754500', borderColor: alpha(tokens.amber, 0.24) },
        standardError: { background: alpha(tokens.red, 0.1), color: '#92253A', borderColor: alpha(tokens.red, 0.24) },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 28, background: tokens.surfaceRaised, border: `1px solid ${tokens.border}` },
      },
    },
    MuiBackdrop: {
      styleOverrides: { root: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(4,3,10,0.6)' } },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: tokens.surfaceHigh,
          color: tokens.text,
          fontWeight: 600,
          border: `1px solid ${tokens.borderStrong}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        rail: { opacity: 1, backgroundColor: 'rgba(49,39,78,0.12)' },
        track: { border: 0, background: gradients.primary },
        thumb: { boxShadow: `0 0 0 6px ${alpha(tokens.violet, 0.2)}` },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 3, borderRadius: 3, background: gradients.primary },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 700, minHeight: 44 } },
    },
    MuiAccordion: {
      styleOverrides: { root: { borderRadius: '18px !important', background: 'rgba(49,39,78,0.025)' } },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 16, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}` } },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: { '&.Mui-checked + .MuiSwitch-track': { opacity: 1, background: gradients.primary } },
        track: { borderRadius: 99, backgroundColor: 'rgba(49,39,78,0.28)' },
      },
    },
  },
});
