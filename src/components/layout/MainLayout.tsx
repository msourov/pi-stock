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
    { icon: IconBuilding, label: "Branches", path: "/branches" },
    {
      icon: IconPackage,
      label: "Products",
      path: "/products",
      children: [
        { icon: IconBox, label: "All Products", path: "/products" },
        {
          icon: IconCategory,
          label: "Categories",
          path: "/products/categories",
        },
      ],
    },
    { icon: IconTrendingUp, label: "Stock", path: "/stock" },
  ];

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 260,
        breakpoint: "xs",
      }}
      header={{
        height: 70,
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs" align="center">
            <Image
              w={24}
              h={24}
              src="/assets/stock-icon.png"
              alt="Pi-Stock logo"
            />
            <Text fw={700} size="xl">
              Pi-Stock
            </Text>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="sm">
                  <Avatar color="blue" radius="xl" />
                  <Box>
                    <Text fw={500}>{user?.name}</Text>
                  </Box>
                  <IconChevronDown size={16} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={logout}
                color="red"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
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
                  variant="filled"
                  mb={4}
                  style={{ borderRadius: 8 }}
                  active={location.pathname.startsWith(item.path)}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <NavLink
                        key={child.path}
                        label={child.label}
                        leftSection={<ChildIcon size={16} />}
                        active={location.pathname === child.path}
                        onClick={() => navigate(child.path)}
                        style={{ borderRadius: 6 }}
                      />
                    );
                  })}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<Icon size={20} />}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                variant="filled"
                mb={4}
                style={{ borderRadius: 8 }}
              />
            );
          })}
        </AppShell.Section>

        <AppShell.Section
          style={{
            borderTop: "1px solid #eee",
            paddingLeft: "1em",
          }}
        >
          <Box pt="sm">
            <Text size="sm" c="dimmed">
              Pi-Stock
            </Text>
            <Text size="xs" c="dimmed">
              Inventory Management System
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
