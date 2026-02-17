import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

import { ThemeProvider } from "./components/theme-provider.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error("Google Client ID is missing! Please set VITE_GOOGLE_CLIENT_ID in .env");
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId || ""}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);
