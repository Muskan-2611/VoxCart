import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Safely clear stale Service Workers and caches in background without blocking
try {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
} catch (e) {}

try {
  if (typeof window !== "undefined" && window.caches) {
    window.caches.keys().then((keys) => {
      keys.forEach((key) => {
        window.caches.delete(key).catch(() => {});
      });
    }).catch(() => {});
  }
} catch (e) {}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[VoxCart App Crash Caught by ErrorBoundary]:", error, errorInfo);
  }

  handleReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem("voxcart_display_language");
      localStorage.removeItem("voxcart_display_currency");
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
              🛒
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              VoxCart Voice Shopping
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              We encountered a display issue while initializing the storefront. Click below to refresh and load the latest layout.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-2 w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm tracking-wide transition cursor-pointer shadow-lg shadow-purple-600/30"
            >
              Refresh & Restore Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

