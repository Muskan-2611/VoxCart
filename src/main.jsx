import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Clear existing Service Workers and cached assets to ensure the latest Node API routes load
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log("[ServiceWorker] Successfully unregistered stale worker");
    }
  });
}

if (window.caches) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      caches.delete(key);
      console.log("[Cache] Deleted stale cache store:", key);
    });
  });
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
