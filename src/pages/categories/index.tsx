import { useState, useEffect } from "react";
import {
  Box,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Table,
  Text,
  Title,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Stack,
} from "@mantine/core";
import {
  IconCategory,
  IconCheck,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../AuthProvider";

interface Category {
  uid: string;
  id: string;
  name: string;
  branch_id: string[];
  active: boolean;
  created_at?: string;
  info1?: string | null;
}

interface BranchOption {
  value: string;
  label: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const { logout } = useAuth();

  const branches: BranchOption[] = [
    { value: "73745874-e70b-498f-afd1-465464934f5b", label: "Main Branch" },
    { value: "branch-2", label: "Branch 2" },
    { value: "branch-3", label: "Branch 3" },
  ];

  const companyId = "61651c07-0fe1-4cb7-9d03-b918a613a5c9";

  const form = useForm({
    initialValues: {
      name: "",
      company_id: companyId,
      branch_id: "",
      active: true,
    },
    validate: {
      name: (v) => (!v ? "Category name is required" : null),
      branch_id: (v) => (!v ? "Branch is required" : null),
    },
  });

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/category/all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      } else {
        setCategories([]);
      }
      if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (values: {
    name: string;
    company_id: string;
    branch_id: string;
    active: boolean;
  }) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/category/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await res.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result?.message || "Category created successfully!",
          icon: <IconCheck />,
          color: "teal",
        });

        form.reset();
        close();
        fetchCategories();
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to create category",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (err) {
      console.error("Create category error:", err);
      notifications.show({
        title: "Something went wrong!",
        message: "Please check your connection",
        icon: <IconX />,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string | number) => {
    const token = localStorage.getItem("token");
    setDeletingId(categoryId);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/category/delete/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const result = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Deleted",
          message: result?.message || "Category deleted successfully!",
          icon: <IconCheck />,
          color: "teal",
        });
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        fetchCategories();
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to delete category",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (err) {
      console.error("Delete category error:", err);
      notifications.show({
        title: "Network Error",
        message: "Failed to connect to server",
        icon: <IconX />,
        color: "red",
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getBranchLabel = (branchId: string) => {
    return branches.find((b) => b.value === branchId)?.label || branchId;
  };

  return (
    <Card withBorder shadow="sm" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>Product Categories</Title>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={open} size="sm">
            Add Category
          </Button>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchCategories}
            disabled={loading}
            size="sm"
          >
            Refresh
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Box py="xl" ta="center">
          <Loader size="lg" />
          <Text mt="md">Loading categories...</Text>
        </Box>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Branch</Table.Th>
              <Table.Th>Additional Info</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {categories.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} py="xl" ta="center">
                  <Box>
                    <IconCategory size={48} color="gray" />
                    <Text mt="sm" c="dimmed">
                      No categories available
                    </Text>
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : (
              categories.map((category) => (
                <Table.Tr key={category.id}>
                  <Table.Td>
                    <Text fw={500}>{category.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="blue">
                      {category.branch_id && category.branch_id.length > 0
                        ? getBranchLabel(category.branch_id[0])
                        : "No branch"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {category.info1 || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={category.active ? "green" : "red"}>
                      {category.active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue" size="sm">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        loading={deletingId === category.uid}
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete category "${category.name}"?`
                            )
                          ) {
                            handleDeleteCategory(category.uid);
                          }
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}

      {/* Create Category Modal */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="sm"
        title={
          <Title order={4} c="gray">
            Add New Category
          </Title>
        }
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleCategorySubmit)}>
          <Stack gap="md">
            <TextInput
              label="Category Name"
              placeholder="Enter category name"
              withAsterisk
              {...form.getInputProps("name")}
            />

            <Select
              label="Branch"
              placeholder="Select branch"
              withAsterisk
              data={branches}
              {...form.getInputProps("branch_id")}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={close} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                leftSection={<IconPlus size={18} />}
              >
                Create Category
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Card>
  );
}
