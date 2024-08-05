import { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { MenuItem } from "@chakra-ui/react";

const NotificationMenu = () => {
  const { notifications, setNotifications, setSelectedChat } = ChatState();
  const [loading, setLoading] = useState(false);

  const user = ChatState();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.user.token}`, // Access token directly from user
        },
      };
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/${user.user._id}`,
        config
      );
      console.log("Fetched notifications:", response.data);
      setNotifications(response.data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user.user]); // Include setNotifications in the dependency array

  const handleNotificationClick = async (notification) => {
    setSelectedChat(notification.chat);

    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.user.token}`, // Access token directly from user
      },
    };

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notification._id}`,
        config
      );
      setNotifications(notifications.filter((n) => n._id !== notification._id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  return (
    <>
      {notifications.length === 0 ? (
        <MenuItem>No new messages</MenuItem>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
          >
            {!loading ? notification.chat.isGroupChat
                ? `New Message in ${notification.chat.chatName}`
                : `${notification.message}` // Assuming message contains sender info
              : "Loading"}               
          </MenuItem>
        ))
      )}
    </>
  );
};

export default NotificationMenu;
