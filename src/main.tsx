import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Products from "./pages/products/index.tsx";
import { MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { Login } from "./pages/auth/Login.tsx";
import MainLayout from "./components/layout/MainLayout.tsx"; // Adjust path as needed
import { AuthProvider } from "./AuthContext.tsx";
import Stock from "./pages/stock/index.tsx";
import Categories from "./pages/categories/index.tsx";
import "./index.css";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";

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
        element: <Navigate to="/products" replace />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/categories",
        element: <Categories />,
      },
      {
        path: "stock",
        element: <Stock />,
      },
      {
        path: "branches",
        element: <div>Branches Page - Implement this component</div>,
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
