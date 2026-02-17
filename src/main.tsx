import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { Login } from "./pages/auth/Login.tsx";
import MainLayout from "./components/layout/MainLayout.tsx"; // Adjust path as needed
import { AuthProvider } from "./AuthContext.tsx";
import Stock from "./pages/transaction/index.tsx";
import Categories from "./pages/categories/index.tsx";
import { Notifications } from "@mantine/notifications";
import User from "./pages/user/index.tsx";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // This makes it the default route when path is "/"
        element: <Navigate to="/users" replace />,
      },
      {
        path: "users",
        element: <User />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "stocks",
        element: <Stock />,
      },
      {
        path: "dashboard",
        element: <div>Dashboard</div>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider
      theme={{
        fontFamily:
          'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <AuthProvider>
        <Notifications />
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </StrictMode>
);
