import {
  AppShell,
  Group,
  Text,
  NavLink,
  Box,
  Avatar,
  Menu,
  UnstyledButton,
  Image,
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
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../AuthProvider";

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
    { icon: IconTrendingUp, label: "Stock", path: "/stock" },
  ];

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 280,
        breakpoint: "xs",
      }}
      header={{
        height: 70,
      }}
    >
      {/* Header with gradient background */}
      <AppShell.Header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm" align="center">
            <Image
              w={32}
              h={32}
              src="/assets/stock-icon.png"
              alt="Pi-Stock logo"
              style={{
                filter: "brightness(0.3) invert(1)",
              }}
            />
            <Text
              fw={800}
              size="xl"
              style={{
                color: "white",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Pi-Stock
            </Text>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="sm">
                  <Avatar
                    color="white"
                    bg="rgba(255,255,255,0.2)"
                    radius="xl"
                  />
                  <Box>
                    <Text fw={600} style={{ color: "white" }}>
                      {user?.name}
                    </Text>
                    {/* <Text size="xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {user?.role}
                    </Text> */}
                  </Box>
                  <IconChevronDown size={16} color="white" />
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
      </AppShell.Header>

      {/* Navbar with subtle gradient */}
      <AppShell.Navbar
        p="md"
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <AppShell.Section grow>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              return (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<Icon size={20} />}
                  variant="light"
                  mb={6}
                  style={{
                    borderRadius: 8,
                    backgroundColor: location.pathname.startsWith(item.path)
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    border: location.pathname.startsWith(item.path)
                      ? "1px solid rgba(99, 102, 241, 0.2)"
                      : "1px solid transparent",
                  }}
                  active={location.pathname.startsWith(item.path)}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isActive = location.pathname === child.path;
                    return (
                      <NavLink
                        key={child.path}
                        label={child.label}
                        leftSection={<ChildIcon size={16} />}
                        active={isActive}
                        onClick={() => navigate(child.path)}
                        style={{
                          borderRadius: 6,
                          backgroundColor: isActive
                            ? "rgba(99, 102, 241, 0.15)"
                            : "transparent",
                          borderLeft: isActive
                            ? "3px solid #6366f1"
                            : "3px solid transparent",
                          marginLeft: "8px",
                          marginBottom: "2px",
                        }}
                      />
                    );
                  })}
                </NavLink>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<Icon size={20} />}
                active={isActive}
                onClick={() => navigate(item.path)}
                variant="light"
                mb={6}
                style={{
                  borderRadius: 8,
                  backgroundColor: isActive
                    ? "rgba(99, 102, 241, 0.1)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(99, 102, 241, 0.2)"
                    : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}
                styles={{
                  label: {
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#6366f1" : "#334155",
                  },
                }}
              />
            );
          })}
        </AppShell.Section>

        {/* Footer section */}
        <AppShell.Section
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "8px 12px",
            background: "rgba(241, 245, 249, 0.5)",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <Box>
            <Text size="sm" fw={600} c="dark.4">
              Pi-Stock v1.0
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Inventory Management System
            </Text>
            <Text size="xs" c="blue.6" mt={4} fw={500}>
              Ready to serve your business
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main content area */}
      <AppShell.Main
        style={{
          background:
            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <Box
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            minHeight: "calc(100vh - 110px)",
            border: "1px solid #e2e8f0",
          }}
          p="md"
        >
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
