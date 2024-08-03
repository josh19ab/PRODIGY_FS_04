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
  Skeleton,
  Image,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
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
    notification,
    setNotification,
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

    // Create a temporary message object for media
    const tempMessage = {
      _id: Date.now(), // Use a temporary ID
      sender: { _id: user.user._id, name: user.user.name, pic: user.user.pic },
      content: newMessage,
      chat: selectedChat._id,
      fileUrl: null, // No URL yet
      isLoading: selectedFile ? true : false, // Set loading state only for media
    };

    // Update the messages state with the temporary message
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      let mediaUrl = null;

      // If a file is selected, upload it first
      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.user.token}`,
        },
      };

      // Prepare the message data
      const messageData = {
        content: newMessage,
        chatId: selectedChat._id,
        fileUrl: mediaUrl,
        isLoading: false, // Set loading state to false after sending
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/message`,
        messageData,
        config
      );

      // Replace the temporary loading message with the actual message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessage._id ? { ...data, isLoading: false } : msg
        )
      );

      socket.emit("new message", data);
      setNewMessage("");
      setSelectedFile(null); // Clear the selected file after sending
      setImagePreview(null); // Clear the image preview after sending
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
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
    return () => {
      socket.off("message received");
    };
  });

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
                <Box display="flex" alignItems="center">
                  <Text fontWeight="bold" mr={2}>
                    {getSender(user.user, selectedChat.users)}
                  </Text>
                  {onlineUsers[
                    getSenderFull(user.user, selectedChat.users)._id
                  ] === "online" ? (
                    <Badge colorScheme="green" ml={2}>
                      Online
                    </Badge>
                  ) : (
                    <Badge colorScheme="red" ml={2}>
                      Offline
                    </Badge>
                  )}
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
                <Box display='flex' justifyContent='center' alignItems='center'>
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
                <InputRightElement mr={3} gap={3} w="55px">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <IoMdAttach onClick={handleAttachClick} cursor="pointer" />

                  <MdSend
                    onClick={handleSendMessage}
                    aria-label="Send message"
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" fontWeight="md">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
