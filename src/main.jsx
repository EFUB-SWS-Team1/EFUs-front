import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { AuthProvider } from "./context/AuthContext";
import { GroupProvider } from "./context/GroupContext";
import "./styles/tokens.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <GroupProvider>
        <RouterProvider router={router} />
      </GroupProvider>
    </AuthProvider>
  </StrictMode>,
);
