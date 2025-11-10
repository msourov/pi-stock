import { useState, useEffect } from "react";
import {
  Box,
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
  Stack,
  Grid,
} from "@mantine/core";
import {
  IconCategory,
  IconCheck,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../AuthProvider";
import { Category } from "./type";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    uid: string;
    name: string;
  } | null>(null);

  const { logout } = useAuth();

  const companyId = "61651c07-0fe1-4cb7-9d03-b918a613a5c9";

  const form = useForm({
    initialValues: {
      name: "",
      company_id: companyId,
      active: true,
    },
    validate: {
      name: (v) => (!v ? "Category name is required" : null),
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

  const handleUpdateCategory = async (
    categoryId: string,
    values: { name: string }
  ) => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const payload = { ...values, uid: categoryId };
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/category/update/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result?.message || "Category updated successfully!",
          icon: <IconCheck />,
          color: "teal",
        });

        form.reset();
        closeEdit();
        fetchCategories(); // refresh category list
      } else if (res.status === 401) {
        logout();
      } else {
        notifications.show({
          title: "Error",
          message: result?.message || "Failed to update category",
          icon: <IconX />,
          color: "red",
        });
      }
    } catch (err) {
      console.error("Update category error:", err);
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

  const handleDeleteCategory = async (categoryId: string) => {
    const token = localStorage.getItem("token");
    setDeletingId(categoryId);
    setDeleting(true);
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
        closeDeleteModal();
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
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Stack p="xs" gap="sm">
      {/* Header Section */}
      <Card
        withBorder
        shadow="xs"
        radius="md"
        p="sm"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Title order={5} fw={600} c="indigo">
              Product Categories
            </Title>
            <Text c="dimmed" fz="xs" mt={2}>
              Organize your products with categories
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={open}
            size="xs"
            radius="sm"
            color="purple"
          >
            Add Category
          </Button>
        </Group>
      </Card>

      {/* Stats Cards */}
      <Grid gutter="sm">
        {[
          {
            color: "#4299e1",
            label: "Total Categories",
            value: categories.length,
            icon: <IconCategory size={16} color="#4299e1" />,
          },
          {
            color: "#48bb78",
            label: "Active Categories",
            value: categories.filter((c) => c.active).length,
            icon: <IconCheck size={16} color="#48bb78" />,
          },
          {
            color: "#9f7aea",
            label: "With Additional Info",
            value: categories.filter((c) => c.info1).length,
            icon: <IconInfoCircle size={16} color="#9f7aea" />,
          },
        ].map(({ color, label, value, icon }, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card
              withBorder
              p="sm"
              radius="sm"
              style={{
                borderLeft: `3px solid ${color}`,
                background: "white",
              }}
            >
              <Group gap={6} align="flex-start">
                <Box
                  p={6}
                  style={{
                    background: `${color}1A`,
                    borderRadius: 6,
                  }}
                >
                  {icon}
                </Box>
                <div style={{ flex: 1 }}>
                  <Text fz="xs" c="dimmed" fw={500}>
                    {label}
                  </Text>
                  <Text fz="lg" fw={700} c="dark.4">
                    {value}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Table Section */}
      <Card withBorder radius="md" style={{ background: "white" }}>
        <Group justify="space-between" mb="xs" px="xs" pb={4}>
          <Title order={5} c="dark.4">
            Category List
          </Title>
          <Button
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={fetchCategories}
            disabled={loading}
            size="xs"
          >
            Refresh
          </Button>
        </Group>

        {loading ? (
          <Box py="md" ta="center">
            <Loader size="sm" />
            <Text mt="xs" c="dimmed" fz="sm">
              Loading categories...
            </Text>
          </Box>
        ) : (
          <Box px="xs" pb="xs">
            <Table
              striped
              highlightOnHover
              withTableBorder
              verticalSpacing="xs"
              horizontalSpacing="sm"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Additional Info</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5} py="lg" ta="center">
                      <Box>
                        <IconCategory size={36} color="gray" />
                        <Text mt={4} c="dimmed" fz="sm">
                          No categories available
                        </Text>
                        <Text c="dimmed" fz="xs" mt={2}>
                          Get started by creating your first category
                        </Text>
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  categories.map((category) => (
                    <Table.Tr key={category.id}>
                      <Table.Td>
                        <Text fw={600} fz="sm">
                          {category.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          ID: {category.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{category.info1 || "-"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="center">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            radius="sm"
                            onClick={() => {
                              setSelectedCategory({
                                uid: category.uid,
                                name: category.name,
                              });
                              form.setValues({ name: category.name });
                              openEdit();
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            radius="sm"
                            loading={deletingId === category.uid}
                            onClick={() => {
                              setSelectedCategory({
                                uid: category.uid,
                                name: category.name,
                              });
                              openDeleteModal();
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Box>
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
        {/* Category Update Modal */}
        <Modal
          opened={editOpened}
          onClose={closeEdit}
          centered
          size="sm"
          title={
            <Title order={4} c="gray">
              Edit Category
            </Title>
          }
          overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
          <form
            onSubmit={form.onSubmit((values) => {
              if (selectedCategory)
                handleUpdateCategory(selectedCategory.uid, values);
            })}
          >
            <Stack gap="md">
              <TextInput
                label="Category Name"
                placeholder="Enter new category name"
                withAsterisk
                {...form.getInputProps("name")}
              />
              <Group justify="flex-end" mt="xl">
                <Button
                  variant="outline"
                  onClick={closeEdit}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  leftSection={<IconCheck size={18} />}
                >
                  Update Category
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
        {/* Delete Category Modal */}
        <Modal
          opened={deleteOpened}
          onClose={closeDeleteModal}
          centered
          size="sm"
          transitionProps={{
            transition: "fade",
            duration: 200,
            timingFunction: "linear",
          }}
          withCloseButton={false}
        >
          <Box ta="center" p="md">
            <Text fw={600} size="lg" c="dark">
              Delete Category?
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </Text>

            <Group justify="center" mt="lg">
              <Button
                variant="default"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                color="red"
                loading={deleting}
                onClick={() => {
                  if (!selectedCategory?.uid) return;
                  handleDeleteCategory(selectedCategory.uid);
                }}
              >
                Delete
              </Button>
            </Group>
          </Box>
        </Modal>
      </Card>
    </Stack>
  );
}
