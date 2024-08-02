import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import ChatLoading from "./ChatLoading";
import getSender  from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

// eslint-disable-next-line react/prop-types
const MyChats = ({ fetchAgain }) => {
  const Toast = useToast();

  const [loggedUser, setLoggedUser] = useState();

  const user = ChatState();
  const { selectedChat, setChats, chats, setSelectedChat } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      };

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        config
      );
      setChats(data);
    } catch (error) {
      Toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="rgba(178, 245, 234, 0.5)"
      backdropFilter="blur(10px)"
      boxShadow="lg"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<FaPlus />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="transparent"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={
                  selectedChat === chat ? "#E8E8E8" : "rgba(178, 245, 234, 0.5)"
                }
                color="black"
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Flex alignItems="center">
                  <Text fontWeight="bold" mr={2}>
                    {!chat || !chat.users || !loggedUser
                      ? "Loading..." // or any fallback UI
                      : !chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                </Flex>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
