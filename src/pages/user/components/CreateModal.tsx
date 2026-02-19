import {
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Group,
  Button,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CreateUserPayload } from "../type";

interface OptionType {
  value: string;
  label: string;
}

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload) => Promise<boolean>;
  loading: boolean;
  roleOptions: OptionType[];
}

export const CreateUserModal = ({
  opened,
  onClose,
  onSubmit,
  loading,
  roleOptions,
}: CreateUserModalProps) => {
  const form = useForm({
    initialValues: {
      name: "",
      user_id: "",
      email: "",
      password: "",
      confirmPassword: "",
      role_id: "",
    },

    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      user_id: (value) => (value.trim().length ? null : "User ID is required"),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email format",
      role_id: (value) => (value ? null : "Please select a role"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      name: values.name,
      user_id: values.user_id,
      email: values.email,
      password: values.password,
      role_id: values.role_id,
      department: "Logistics",
      active: true,
    };

    try {
      const success = await onSubmit(payload);

      if (success) {
        notifications.show({
          title: "Success",
          message: "User account created successfully!",
          color: "green",
          position: "top-right",
        });
        form.reset();
        onClose();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  // Determine if the button should be disabled based on validation state
  const isInvalid = !form.isValid();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Create New User
        </Text>
      }
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Full Name"
          placeholder="Enter name"
          required
          {...form.getInputProps("name")}
          mb="sm"
        />

        <TextInput
          label="User ID"
          placeholder="unique_username"
          required
          {...form.getInputProps("user_id")}
          mb="sm"
        />

        <TextInput
          label="Email"
          placeholder="user@company.com"
          required
          {...form.getInputProps("email")}
          mb="sm"
        />

        <Select
          label="Role"
          placeholder="Pick one"
          data={roleOptions}
          required
          {...form.getInputProps("role_id")}
          mb="sm"
        />

        <PasswordInput
          label="Password"
          placeholder="Minimum 6 characters"
          required
          {...form.getInputProps("password")}
          mb="sm"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Repeat password"
          required
          {...form.getInputProps("confirmPassword")}
          mb="xl"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={isInvalid}
            color="blue"
          >
            Create User
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
