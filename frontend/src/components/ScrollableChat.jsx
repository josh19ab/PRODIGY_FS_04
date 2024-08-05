import { Avatar, Box, Flex, Image,  Text, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import animationData from "../animations/loading.json";
import Lottie from "react-lottie";


// import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/ChatLogics";

// eslint-disable-next-line react/prop-types
const ScrollableChat = ({ messages }) => {
  const user = ChatState();
  const isSender = (message) => {
    return message.sender._id === user.user._id;
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <ScrollableFeed>
      {messages &&
        // eslint-disable-next-line react/prop-types
        messages.map((m, i) => (
          <Flex
            key={m._id}
            direction="column"
            alignItems={isSender(m) ? "flex-end" : "flex-start"}
            mb={2}
          >
            <Flex>
              {!isSender(m) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={2}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <Box>
                {m.content && (
                  <Text
                    backgroundColor={isSender(m) ? "#BEE3F8" : "#B9F5D0"}
                    borderRadius="20px"
                    padding="5px 15px"
                    marginLeft={isSender(m) ? "auto" : 0} // Align text to the right for sender
                  >
                    {m.content}
                  </Text>
                )}
                {/* Display image if available */}
                {m.fileUrl ? (
                  <Image
                    src={m.fileUrl}
                    alt="Uploaded"
                    borderRadius="md"
                    objectFit="cover"
                    maxHeight="200px"
                    marginTop="5px"
                  />
                ) : (
                  m.isLoading && ( // Show spinner if the message is loading
                    <Flex justify="center" align="center" height="200px">
                      <Lottie
                        options={defaultOptions}
                        width={120}
                        height={120}
                      />
                    </Flex>
                  )
                )}
              </Box>
              {isSender(m) && (
                <Tooltip label={m.sender.name} placement="bottom-end" hasArrow>
                  <Avatar
                    mt="7px"
                    ml={2}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
            </Flex>
          </Flex>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
