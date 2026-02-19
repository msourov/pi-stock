import { useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface CreateCategoryValues {
  name: string;
  category_type: string;
  active: boolean;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  onCreate: (values: CreateCategoryValues) => Promise<{ message: string }>;
  onSuccess: () => void;
}

const CATEGORY_TYPE_OPTIONS = [
  { value: "from_where", label: "From Where" },
  { value: "to_where", label: "To Where" },
];

export default function CreateCategoryModal({
  opened,
  onClose,
  onCreate,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateCategoryValues>({
    initialValues: {
      name: "",
      category_type: "",
      active: true,
    },
    validate: {
      name: (v) => (!v.trim() ? "Category name is required" : null),
      category_type: (v) => (!v ? "Category type is required" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: CreateCategoryValues) => {
    setSubmitting(true);
    try {
      const result = await onCreate(values);
      notifications.show({
        title: "Success",
        message: result.message,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      form.reset();
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
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="sm"
      title={
        <Title order={4} c="gray">
          Add New Category
        </Title>
      }
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

          <Group justify="flex-end" mt="sm">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              leftSection={<IconPlus size={16} />}
            >
              Create Category
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
