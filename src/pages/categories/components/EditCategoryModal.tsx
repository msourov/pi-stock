import {
  Modal,
  TextInput,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

const CATEGORY_TYPE_OPTIONS = [
  { value: "from_where", label: "Source" },
  { value: "to_where", label: "Destination" },
];

interface EditCategoryModalProps {
  opened: boolean;
  onClose: () => void;
  onUpdate: (uid: string, name: string) => Promise<{ message: string }>;
  onSuccess: () => void;
  category: {
    uid: string;
    name: string;
    category_type?: string;
    active?: boolean;
  } | null;
}

export const EditCategoryModal = ({
  opened,
  onClose,
  onUpdate,
  onSuccess,
  category,
}: EditCategoryModalProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      category_type: "",
      active: true,
    },
    validate: {
      name: (v) => (!v.trim() ? "Name is required" : null),
      category_type: (v) => (!v ? "Please select a type" : null),
    },
  });

  useEffect(() => {
    if (category && opened) {
      form.setFieldValue("name", category.name);
      form.setFieldValue("category_type", category.category_type ?? "");
      form.setFieldValue("active", category.active ?? true);

      form.resetDirty();
    }
  }, [category, opened]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!category) return;
    setLoading(true);
    try {
      const result = await onUpdate(category.uid, values.name);
      notifications.show({
        title: "Success",
        message: result?.message || "Category updated successfully",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "An error occurred",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      title={<Text fw={600}>Edit Category</Text>}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <Select
            label="Category Type"
            placeholder="Select type"
            withAsterisk
            data={CATEGORY_TYPE_OPTIONS}
            {...form.getInputProps("category_type")}
          />

          <Switch
            label="Active Status"
            description="Enable or disable this category"
            {...form.getInputProps("active", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!form.isDirty() || !form.isValid()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
