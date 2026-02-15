"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0284c7", // sky-600 - Professional Blue
      light: "#38bdf8", // sky-400
      dark: "#0369a1", // sky-700
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#f1f5f9", // slate-100
      light: "#f8fafc", // slate-50
      dark: "#e2e8f0", // slate-200
      contrastText: "#334155", // slate-700
    },
    error: {
      main: "#ef4444", // red-500
    },
    success: {
      main: "#10b981", // emerald-500
    },
    background: {
      default: "#f8fafc", // slate-50
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0f172a", // slate-900
      secondary: "#475569", // slate-600
    },
  },
  typography: {
    fontFamily: '"Inter", "Geist", system-ui, -apple-system, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#0f172a", // slate-900
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#1e293b", // slate-800
    },
    h6: {
      fontWeight: 600,
      color: "#1e293b",
    },
    body1: {
      lineHeight: 1.6,
      color: "#334155", // slate-700
    },
    body2: {
      lineHeight: 1.5,
      color: "#475569", // slate-600
    },
  },
  shape: {
    borderRadius: 8, // Slightly sharper corners for professional look
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            transition: "all 0.2s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#0284c7",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
              borderColor: "#0284c7",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-completed": {
            color: "#10b981",
          },
          "&.Mui-active": {
            color: "#0284c7",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
