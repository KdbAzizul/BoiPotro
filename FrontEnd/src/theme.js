import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // Tailwind blue-500
      light: '#7dd3fc', // Tailwind blue-300
      dark: '#0369a1', // Tailwind blue-700
    },
    secondary: {
      main: '#d946ef', // Tailwind purple-500
      light: '#f0abfc', // Tailwind purple-300
      dark: '#a21caf', // Tailwind purple-700
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "system-ui", sans-serif',
    h1: {
      fontFamily: '"Merriweather", "Georgia", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Merriweather", "Georgia", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Inter", "system-ui", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
