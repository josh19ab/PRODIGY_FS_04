import { ThemeProvider } from "@mui/material/styles";
import NotificationButton from "./NotificationButton";
import { createTheme } from "@mui/material/styles";


const notificationTheme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#b2d8d8",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// eslint-disable-next-line react/prop-types
const NotificationComponent = ({ notificationCount }) => {
  return (
    <ThemeProvider theme={notificationTheme}>
      <NotificationButton notificationCount={notificationCount} />
    </ThemeProvider>
  );
};

export default NotificationComponent;
