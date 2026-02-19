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
import useCategory from "./hooks";
import CreateCategoryModal from "./components/CreateCategoryModal";
import { EditCategoryModal } from "./components/EditCategoryModal";

export default function Categories() {
  const {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategory();

  const [deleting, setDeleting] = useState(false);

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);

  const [selectedCategory, setSelectedCategory] = useState<{
    uid: string;
    name: string;
  } | null>(null);

  const editForm = useForm({
    initialValues: { name: "" },
    validate: { name: (v) => (!v.trim() ? "Category name is required" : null) },
  });

  useEffect(() => {
    fetchCategories().catch(() => {});
  }, []);

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setDeleting(true);
    try {
      const result = await deleteCategory(selectedCategory.uid);
      notifications.show({
        title: "Deleted",
        message: result.message,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      closeDeleteModal();
      await fetchCategories();
    } catch (err: unknown) {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "An error occurred",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack p="xs" gap="sm">
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
            onClick={openCreate}
            size="xs"
            radius="sm"
            color="indigo"
          >
            Add Category
          </Button>
        </Group>
      </Card>

      <Card withBorder radius="md" mt={8} style={{ background: "white" }}>
        <Group justify="space-between" mb="xs" px="xs" pb={4}>
          <Title order={5} c="dark.4">
            Category List
          </Title>
          <Button
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={() => fetchCategories().catch(() => {})}
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
                  <Table.Th>Type</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={3} py="lg" ta="center">
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
                    <Table.Tr key={category.uid}>
                      <Table.Td>
                        <Text fw={600} fz="sm">
                          {category.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" c="dimmed">
                          {category.category_type || "-"}
                        </Text>
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
                              editForm.setValues({ name: category.name });
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
                            loading={
                              deleting && selectedCategory?.uid === category.uid
                            }
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
      </Card>

      <CreateCategoryModal
        opened={createOpened}
        onClose={closeCreate}
        onCreate={createCategory}
        onSuccess={() => fetchCategories().catch(() => {})}
      />

      <EditCategoryModal
        opened={editOpened}
        onClose={closeEdit}
        category={selectedCategory}
        onUpdate={updateCategory}
        onSuccess={() => fetchCategories()}
      />

      <Modal
        opened={deleteOpened}
        onClose={closeDeleteModal}
        centered
        size="sm"
        withCloseButton={false}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <Box ta="center" p="md">
          <Text fw={600} size="lg" c="dark">
            Delete Category?
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Are you sure you want to delete{" "}
            <strong>{selectedCategory?.name}</strong>? This action cannot be
            undone.
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
              onClick={handleDeleteCategory}
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </Stack>
  );
}
