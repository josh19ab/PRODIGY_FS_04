import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatProvider from "./Context/ChatProvider";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import ErrorPage from "./Pages/error-page";

function App() {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<HomePage />} errorElement={<ErrorPage />} />
          <Route path="/chats" element={<ChatPage />} />
        </Routes>
      </ChatProvider>
    </Router>
  );
}

export default App;
