import { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { Divider, Icon, MenuItem, useToast } from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";

// eslint-disable-next-line react/prop-types
const NotificationMenu = ({ fetchAgain }) => {
  const { notifications, setNotifications, setSelectedChat } = ChatState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const user = ChatState();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      };
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/${user.user._id}`,
        config
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.user.token}`,
          },
        };

        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          config
        );

        setNotifications([]);

        toast({
          title: "Notifications Cleared",
          description: response.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error clearing notifications:", error);
        toast({
          title: "Error",
          description: "Failed to clear notifications",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchAgain]);

  const handleNotificationClick = async (notification) => {
    setSelectedChat(notification.chat);

    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.user.token}`, 
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
        <>
          {notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
            >
              {!loading && notification.chat && notification.message
                ? notification.chat.isGroupChat
                  ? `New Message in ${notification.chat.chatName}`
                  : `${notification.message}`
                : "Loading"}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            onClick={handleClearAllNotifications}
            display="flex"
            justifyContent="center"
            mt={2}
          >
            <Icon as={FaTrashAlt} mr={2} />
            Clear
          </MenuItem>
        </>
      )}
    </>
  );
};

export default NotificationMenu;
