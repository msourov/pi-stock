import {
  AppShell,
  Group,
  Text,
  Box,
  Menu,
  UnstyledButton,
  Image,
  ActionIcon,
} from "@mantine/core";
import {
  IconBuilding,
  IconPackage,
  IconTrendingUp,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconBox,
  IconCategory,
  IconBell,
  IconReceipt,
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";
import Footer from "../ui/Footer";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: IconBuilding, label: "Dashboard", path: "/dashboard" },
    {
      icon: IconPackage,
      label: "Products",
      path: "/products",
      children: [
        {
          icon: IconCategory,
          label: "Categories",
          path: "/products/categories",
        },
        { icon: IconBox, label: "All Products", path: "/products" },
      ],
    },
    { icon: IconTrendingUp, label: "Stocks", path: "/stocks" },
    { icon: IconReceipt, label: "Orders", path: "/orders" },
  ];

  return (
    <AppShell
      padding="md"
      header={{
        height: 100, // Reduced from previous
      }}
    >
      {/* Top Bar - Clean and minimal */}
      <AppShell.Header
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top Row - Logo and User Controls */}
        <Group h="50px" px="lg" justify="space-between">
          <Group gap="sm" align="center">
            <Image
              w={28}
              h={28}
              src="/assets/stock-icon.png"
              alt="Pi-Stock logo"
            />
            <Text
              fw={700}
              size="lg"
              style={{
                color: "#1e293b",
              }}
            >
              Pi-Stock
            </Text>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              className="hover:rounded-full"
            >
              <IconBell size={22} />
            </ActionIcon>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group
                    gap="xs"
                    className="bg-gray-100 border-purple-300 border-[0.5px] px-2 py-0.5 rounded-lg"
                  >
                    <Image src="/assets/profile.png" w={26} />
                    <Box className="flex flex-col gap-0 p-o">
                      <Text size="xs">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0].toUpperCase())
                          .join("")}
                      </Text>
                      <Text size="xs" style={{ color: "#64748b" }}>
                        Admin
                      </Text>
                    </Box>
                    <IconChevronDown size={14} color="#64748b" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  style={{ borderRadius: 6 }}
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={logout}
                  color="red"
                  style={{ borderRadius: 6 }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Navigation Menu Bar */}
        <div
          className="mx-auto mt-2 flex justify-center items-center"
          style={{ borderTop: "1px solid #f1f5f9" }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));

            if (hasChildren) {
              return (
                <Menu
                  key={item.path}
                  shadow="md"
                  width={220}
                  position="bottom-start"
                >
                  <Menu.Target>
                    <UnstyledButton>
                      <Group
                        gap="xs"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Icon
                          size={18}
                          color={isActive ? "purple" : "#64748b"}
                        />
                        <Text
                          style={{
                            color: isActive ? "purple" : "#64748b",
                            fontWeight: isActive ? 600 : 400,
                            fontSize: "14px",
                          }}
                        >
                          {item.label}
                        </Text>
                        <IconChevronDown
                          size={14}
                          color={isActive ? "purple" : "#64748b"}
                        />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>{item.label}</Menu.Label>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Menu.Item
                          key={child.path}
                          leftSection={<ChildIcon size={16} />}
                          onClick={() => navigate(child.path)}
                          style={{
                            backgroundColor: isChildActive
                              ? "rgba(99, 102, 241, 0.1)"
                              : "transparent",
                            fontWeight: isChildActive ? 600 : 400,
                            color: isChildActive ? "#6366f1" : "#334155",
                          }}
                        >
                          {child.label}
                        </Menu.Item>
                      );
                    })}
                  </Menu.Dropdown>
                </Menu>
              );
            }

            return (
              <UnstyledButton
                key={item.path}
                onClick={() => navigate(item.path)}
              >
                <Group
                  gap="xs"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={18} color={isActive ? "purple" : "#64748b"} />
                  <Text
                    style={{
                      color: isActive ? "purple" : "#64748b",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "14px",
                    }}
                  >
                    {item.label}
                  </Text>
                </Group>
              </UnstyledButton>
            );
          })}
        </div>
      </AppShell.Header>

      {/* Main content area */}
      <AppShell.Main
        style={{
          background: "#f8fafc",
          paddingInline: 0,
          paddingTop: "100px",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        <Box
          style={{
            padding: "0.5em 1em",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            minHeight: "calc(100vh - 120px)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
