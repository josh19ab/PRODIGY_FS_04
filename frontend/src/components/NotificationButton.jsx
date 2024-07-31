import { Badge, IconButton } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion"; 

// eslint-disable-next-line react/prop-types
const NotificationButton = ({ notificationCount }) => {
  const MotionBadge = motion(Badge);
  return (
    <IconButton
      aria-label="show new notifications"
      variant="unstyled"
      colorScheme="teal"
      position="relative"
      size="lg"
      icon={
        <>
          <BellIcon boxSize={6} />
          {notificationCount > 0 && (
            <MotionBadge
              colorScheme="red"
              borderRadius="full"
              variant="solid"
              position="absolute"
              top="0"
              right="0"
              initial={{ scale: 0 }} // Start from scale 0
              animate={{ scale: 1 }} // Animate to scale 1
              transition={{ duration: 0.2 }}
            >
              {notificationCount}
            </MotionBadge>
          )}
        </>
      }
    />
  );
};

export default NotificationButton;
