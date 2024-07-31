import { Badge, IconButton } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

// eslint-disable-next-line react/prop-types
const NotificationButton = ({ notificationCount }) => {
  return (
    <IconButton
      aria-label="show new notifications"
      variant="unstyled" 
      colorScheme="teal"
      position="relative"
      size="lg"
      icon={<BellIcon boxSize={6} />} 
    >
      {notificationCount > 0 && ( 
        <Badge
          colorScheme="red"
          borderRadius="full"
          variant="solid"
          position="absolute"
          top="-1"
          right="-1"
        >
          {notificationCount}
        </Badge>
      )}
    </IconButton>
  );
};

export default NotificationButton;
