import { Badge } from "@chakra-ui/layout";
import { IoClose } from "react-icons/io5";


// eslint-disable-next-line react/prop-types
const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="purple"
      display="flex"
      gap={1}
      alignItems="center"
    >
      {user.name}
      {/* {admin === user._id && <span> (Admin)</span>} */}
      <IoClose onClick={handleFunction} cursor="pointer" pl={1} size="18px" />
    </Badge>
  );
};

export default UserBadgeItem;
