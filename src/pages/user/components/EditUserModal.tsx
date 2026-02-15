import { Modal, TextInput, Select, Switch, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { UpdateUserPayload, User } from "../type";
import { useCompanyBranchOptions } from "../../../hooks/useCompanyBranch";

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
      mobile_number: "",
      role: "",
      company_id: "",
      branch_id: "",
      company_admin: false,
      active: true,
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      mobile_number: (value) =>
        value.trim().length < 10 ? "Invalid phone number" : null,
      role: (value) => (value ? null : "Please select a role"),
      company_id: (value) => (value ? null : "Please select a company"),
      branch_id: (value) => (value ? null : "Please select a branch"),
    },
  });

  const { companyOptions, getBranchesByCompany } = useCompanyBranchOptions();

  useEffect(() => {
    if (user) {
      form.setValues({
        uid: user.uid,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        role: user.role_id,
        company_id: user.company_id,
        branch_id: "1234",
        company_admin: true,
        active: user.active,
      });
    }
  }, [user]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) return;

    const payload: UpdateUserPayload = {
      uid: user.uid,
      name: values.name,
      email: values.email,
      mobile_number: values.mobile_number,
      role: values.role,
      company_id: values.company_id,
      branch_id: values.branch_id,
      company_admin: values.company_admin,
      active: values.active,
    };

    const success = await onSubmit(user.uid, payload);
    if (success) form.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<p className="font-semibold">Edit User</p>}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
          // data={branchOptions}
          required
          {...form.getInputProps("branch_id")}
          mb="md"
        />

        <Select
          label="Role"
          placeholder="Select role"
          required
          data={roleOptions}
          {...form.getInputProps("role")}
          mb="md"
        />

        <Switch
          label="Company Admin"
          {...form.getInputProps("company_admin", { type: "checkbox" })}
          mb="sm"
        />

        <Switch
          label="Active User"
          {...form.getInputProps("active", { type: "checkbox" })}
          mb="xl"
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update User
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
