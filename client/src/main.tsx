import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add session configuration for Express sessions
(window as any).__SESSION_CONFIG__ = {
  withCredentials: true,
  credentials: 'include'
};

createRoot(document.getElementById("root")!).render(<App />);
