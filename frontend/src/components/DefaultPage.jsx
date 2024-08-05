import { Box, Text } from "@chakra-ui/react";
import Lottie from "react-lottie";
import animationData from "../animations/welcome.json";

const DefaultPage = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      h="100%"
    >
      <Box  w={300} h={300}>
        <Lottie options={defaultOptions} />
      </Box>

      <Text fontSize="3xl" pb={3} fontFamily="Work sans" fontWeight="md">
        Click on a user to start chatting
      </Text>
    </Box>
  );
};

export default DefaultPage;
