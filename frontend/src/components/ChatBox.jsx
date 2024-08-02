import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/layout";
import SingleChat from "./SingleChat";


// eslint-disable-next-line react/prop-types
const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="rgba(178, 245, 234, 0.5)"
      backdropFilter="auto"
      backdropBlur="10px"
      boxShadow="lg"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      zIndex='0'
      position='relative'
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
