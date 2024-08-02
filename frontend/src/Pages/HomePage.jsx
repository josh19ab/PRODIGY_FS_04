import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../components/Auth/Login";
import Signup from "../components/Auth/Signup";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="rgba(178, 245, 234, 0.5)"
        backdropFilter="blur(10px)"
        boxShadow="lg"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
      >
        <Text fontSize="4xl" fontFamily="Work sans" textAlign="center">
          Chat-app
        </Text>
      </Box>
      <Box
        bg="rgba(178, 245, 234, 0.5)"
        backdropFilter="blur(10px)"
        boxShadow="lg"
        w="100%"
        p={4}
        borderRadius="lg"
      >
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
