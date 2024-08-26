import "./styles.css";
import { useEffect, useRef, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
  Badge,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Image,
  Button,
} from "@chakra-ui/react";
import { FaArrowLeft, FaTrashAlt } from "react-icons/fa";
import getSender, { getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModel";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { MdCancel, MdEmojiEmotions, MdSend } from "react-icons/md";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IoMdAttach } from "react-icons/io";
import DefaultPage from "./DefaultPage";

var socket;

// eslint-disable-next-line react/prop-types
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const user = ChatState();
  const {
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
    setOnlineUsers,
    onlineUsers,
  } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const uploadMedia = async (file) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.user.token}`,
        },
      };

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/message/upload`,
        formData,
        config
      );

      return data.url;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw new Error("Failed to upload media");
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && (newMessage || selectedFile)) {
      event.preventDefault();
      await handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    socket.emit("stop typing", selectedChat._id);

    const tempMessage = {
      _id: Date.now(), // Use a temporary ID
      sender: { _id: user.user._id, name: user.user.name, pic: user.user.pic },
      content: newMessage,
      chat: selectedChat._id,
      fileUrl: null, // No URL yet
      isLoading: selectedFile ? true : false, // Set loading state only for media
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      let mediaUrl = null;

      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.user.token}`,
        },
      };
      const messageData = {
        content: newMessage,
        chatId: selectedChat._id,
        fileUrl: mediaUrl,
        isLoading: false,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/message`,
        messageData,
        config
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessage._id ? { ...data, isLoading: false } : msg
        )
      );

      socket.emit("new message", data);
      setNewMessage("");
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to send the message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  useEffect(() => {
    socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      socket.emit("setup", user.user);
      socket.emit("user online", user.user._id);
    });

    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("online users", (onlineUsers) => {
      setOnlineUsers((prev) => {
        const updatedUsers = { ...prev };
        onlineUsers.forEach((userId) => {
          updatedUsers[userId] = "online";
        });
        return updatedUsers;
      });
    });

    socket.on("user status", (userStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userStatus.userId]: userStatus.status,
      }));
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err);
    });

    return () => {
      socket.emit("user offline", user.user._id);
      socket.disconnect();
    };
  }, [setOnlineUsers, user.user._id]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    const handleMessageReceived = async (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (
          !notifications.some((notif) => notif._id === newMessageReceived._id)
        ) {
          setNotifications((prevNotifications) => [
            newMessageReceived,
            ...prevNotifications,
          ]);
          setFetchAgain((prev) => !prev); 

          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.user.token}`,
              },
            };
            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/notifications`,
              {
                userId: user.user._id,
                chatId: newMessageReceived.chat._id,
                message: `New message from ${newMessageReceived.sender.name}`,
              },
              config
            );
          } catch (error) {
            console.error("Error creating notification:", error);
          }
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };
    socket.on("message received", handleMessageReceived);
    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [selectedChat, user.user.token]); 

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleClearChat = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear the chat? This action cannot be undone."
      )
    ) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.user.token}`,
          },
        };

        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/message/${
            selectedChat._id
          }/messages`,
          config
        );

        setMessages([]); // Clear messages from state
      } catch (error) {
        console.error("Failed to clear chat:", error);
        toast({
          title: "Error Occurred!",
          description: "Failed to clear the chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<FaArrowLeft />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  w="full"
                >
                  <Text fontWeight="bold" mr={2} ml={2}>
                    {getSender(user.user, selectedChat.users)}
                  </Text>

                  <Badge
                    colorScheme={
                      onlineUsers[
                        getSenderFull(user.user, selectedChat.users)._id
                      ] === "online"
                        ? "green"
                        : "red"
                    }
                    ml={2}
                  >
                    {onlineUsers[
                      getSenderFull(user.user, selectedChat.users)._id
                    ] === "online"
                      ? "Online"
                      : "Offline"}
                  </Badge>

                  <Button
                    rightIcon={<FaTrashAlt />}
                    onClick={handleClearChat}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    mr={2}
                  >
                    Clear
                  </Button>
                </Box>
                <ProfileModal
                  user={getSenderFull(user.user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="transparent"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            {imagePreview && (
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                position="relative"
                _hover={{
                  ".image-preview": {
                    filter: "brightness(0.5)",
                  },
                }}
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Image
                    src={imagePreview}
                    alt="Selected Image Preview"
                    borderRadius="md"
                    objectFit="cover"
                    maxHeight="100px"
                    className="image-preview"
                  />
                  <IconButton
                    icon={<MdCancel />}
                    aria-label="Cancel Image"
                    size="lg"
                    position="absolute"
                    colorScheme="transparent"
                    _hover={{
                      color: "red.500",
                    }}
                    onClick={cancelImagePreview}
                  />
                </Box>
              </Box>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    height={40}
                    style={{ marginLeft: "25px" }}
                  />
                </div>
              ) : null}
              <InputGroup>
                <InputLeftElement>
                  <MdEmojiEmotions
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  />
                </InputLeftElement>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                />
                <InputRightElement mr={2} gap={3} w="55px">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <IoMdAttach
                    onClick={handleAttachClick}
                    cursor="pointer"
                    size="sm"
                  />

                  <MdSend
                    onClick={handleSendMessage}
                    aria-label="Send message"
                    size="md"
                  />
                </InputRightElement>
              </InputGroup>
              {showEmojiPicker && (
                <Box position="absolute" zIndex="1" mt="2" bottom={12}>
                  <Picker
                    data={data}
                    onEmojiSelect={addEmoji}
                    previewPosition="none"
                  />
                </Box>
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        <DefaultPage />
      )}
    </>
  );
};

export default SingleChat;
