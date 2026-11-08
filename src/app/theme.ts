import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#7354b5", dark: "#5c3e98", light: "#f0eafa" },
    background: { default: "#f8f9fc", paper: "#ffffff" },
    text: { primary: "#292638", secondary: "#767383" },
    divider: "#eeedf3",
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 650,
      lineHeight: 1.25,
      letterSpacing: "-0.8px",
    },
    h2: { fontSize: "1.17rem", fontWeight: 650, letterSpacing: "-0.3px" },
    h3: { fontSize: "1.05rem", fontWeight: 600 },
    body1: { fontSize: "0.94rem", lineHeight: 1.65 },
    body2: { fontSize: "0.82rem", lineHeight: 1.65 },
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.87rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 9, padding: "10px 18px" } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 9 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#eeedf3", padding: "17px 22px" },
        head: {
          fontWeight: 500,
          color: "#767383",
          fontSize: "0.76rem",
          backgroundColor: "#fcfcfe",
        },
      },
    },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});
