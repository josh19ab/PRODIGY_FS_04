import * as ReactDOM from "react-dom/client";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";


ReactDOM.createRoot(document.getElementById("root")).render(
    <ChakraProvider>
        <div className="App">
          <App />
        </div>
    </ChakraProvider>
);
