import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";

// eslint-disable-next-line react/prop-types
const NotificationButton = ({ notificationCount }) => {
  return (
    <IconButton aria-label="show new notifications">
      <Badge
        badgeContent={notificationCount}
        color="secondary"
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationButton
