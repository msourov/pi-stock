import {
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Checkbox,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCompanyBranchOptions } from "../../../hooks/useCompanyBranch";
import { useEffect } from "react";
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
      user_id: "",
      name: "",
      email: "",
      mobile_number: "",
      password: "",
      confirmPassword: "",
      company_id: "",
      branch_id: "",
      role_id: "",
      company_admin: false,
      active: true,
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      mobile_number: (value) =>
        value.trim().length < 10 ? "Invalid phone number" : null,
      user_id: (value) => (value.trim().length ? null : "User ID is required"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
      company_id: (value) => (value ? null : "Please select a company"),
      branch_id: (value) => (value ? null : "Please select a branch"),
      role_id: (value) => (value ? null : "Please select a role"),
    },
  });

  const { companyOptions, branchOptions, getBranchesByCompany } =
    useCompanyBranchOptions();

  const handleSubmit = async (values: typeof form.values) => {
    if (values.password !== values.confirmPassword) {
      notifications.show({
        title: "Password mismatch",
        message: "Passwords do not match. Please recheck.",
        color: "red",
      });
      return;
    }

    const { confirmPassword, ...payload } = values;
    console.log(confirmPassword);
    const success = await onSubmit(payload);
    if (success) form.reset();
  };

  useEffect(() => {
    getBranchesByCompany(form.values.company_id);
  }, [form.values.company_id]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<p className="font-semibold">Create New User</p>}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* --- Basic Info --- */}
        <TextInput
          label="Full Name"
          placeholder="Enter full name"
          required
          {...form.getInputProps("name")}
          mb="md"
        />

        <TextInput
          label="Email"
          placeholder="Enter email address"
          required
          {...form.getInputProps("email")}
          mb="md"
        />

        <TextInput
          label="Mobile Number"
          placeholder="Enter mobile number"
          required
          {...form.getInputProps("mobile_number")}
          mb="md"
        />

        <TextInput
          label="User ID"
          placeholder="Enter user ID"
          required
          {...form.getInputProps("user_id")}
          mb="md"
        />

        {/* --- Organization Info --- */}
        <Select
          label="Company"
          placeholder="Select company"
          data={companyOptions}
          required
          {...form.getInputProps("company_id")}
          mb="md"
        />

        <Select
          label="Branch"
          placeholder="Select branch"
          data={branchOptions}
          required
          disabled={!form.values.company_id}
          {...form.getInputProps("branch_id")}
          mb="md"
        />

        <Select
          label="Role"
          placeholder="Select role"
          data={roleOptions}
          required
          {...form.getInputProps("role_id")}
          mb="md"
        />

        {/* --- Account Settings --- */}
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          required
          {...form.getInputProps("password")}
          mb="md"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm password"
          required
          {...form.getInputProps("confirmPassword")}
          mb="md"
        />

        <Group grow mb="xl">
          <Checkbox
            label="Company Admin"
            {...form.getInputProps("company_admin", { type: "checkbox" })}
          />
          <Checkbox
            label="Active User"
            {...form.getInputProps("active", { type: "checkbox" })}
          />
        </Group>

        {/* --- Actions --- */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create User
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
