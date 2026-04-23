import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/ios.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Register Service Worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // We'll use Vite's built-in SW plugin instead
    console.log("PWA ready for offline use");
  });
}

// Prevent pull-to-refresh on iOS
document.body.style.overscrollBehavior = "none";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);