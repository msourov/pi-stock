import {
  Modal,
  TextInput,
  Select,
  Switch,
  Button,
  Group,
  Text,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { UpdateUserPayload, User } from "../type";

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (userId: string, data: UpdateUserPayload) => Promise<boolean>;
  loading: boolean;
  user: User | null;
  roleOptions: { value: string; label: string }[];
}

export const EditUserModal = ({
  opened,
  onClose,
  onSubmit,
  loading,
  user,
  roleOptions,
}: EditUserModalProps) => {
  const form = useForm({
    initialValues: {
      uid: "",
      name: "",
      email: "",
      role_id: "",
      active: true,
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      role_id: (value) => (value ? null : "Please select a role"),
    },
  });

  useEffect(() => {
    if (user && opened) {
      form.setValues({
        uid: user.uid,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        active: user.active,
      });
      form.resetDirty();
    }
  }, [user, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) return;

    const payload = {
      uid: values.uid,
      name: values.name,
      email: values.email,
      role_id: values.role_id,
      department: "Logistics",
      active: values.active,
    };

    try {
      const success = await onSubmit(user.uid, payload);
      if (success) {
        notifications.show({
          title: "User Updated",
          message: "The user details have been saved successfully.",
          color: "green",
          position: "top-right",
        });
        onClose();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  // Button is disabled if validation fails OR if no changes were made
  const isInvalid = !form.isValid();
  const isNotDirty = !form.isDirty();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Edit User Profile
        </Text>
      }
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Email"
            placeholder="example@company.com"
            required
            {...form.getInputProps("email")}
          />

          <Select
            label="Role"
            placeholder="Select user role"
            data={roleOptions}
            required
            {...form.getInputProps("role_id")}
          />

          <Switch
            label="Active"
            // description="Toggle to enable or disable user access"
            {...form.getInputProps("active", { type: "checkbox" })}
            mt="md"
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={isInvalid || isNotDirty}
              color="blue"
            >
              Update User
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
