import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
      main: '#2196F3',
      dark: '#1976D2',
      light: '#64B5F6',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    success: {
      main: '#4CAF50',
      light: '#C8E6C9',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFECB3',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336',
      light: '#FFCDD2',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3',
      light: '#BBDEFB',
      dark: '#1976D2',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#616161',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: "'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#212121',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#212121',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#424242',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#424242',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#424242',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#424242',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#616161',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: '#616161',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920,
    },
  },
  spacing: 4,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #EEEEEE',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196F3',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196F3',
              boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)',
            },
          },
        },
      },
    },
  },
});