import { Button, Grid, Group, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import { Branch, CreateBranchPayload, UpdateBranchPayload } from "../type";

interface BranchFormProps<T> {
  branch?: Branch;
  onSubmit: (values: T) => void | Promise<void>;
  submitting: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}

function BranchForm <T extends CreateBranchPayload | UpdateBranchPayload> ({
  branch,
  onSubmit,
  submitting,
  onCancel,
  isEdit = false,
}: BranchFormProps<T>) {
  const [formData, setFormData] = useState({
    company_id: branch?.company_id || "1122334455667788",
    name: branch?.name || "",
    code: branch?.code || "",
    team: branch?.team || "",
    zone_code: branch?.zone_code || "",
    zone_name: branch?.zone_name || "",
    sub_zone_code: branch?.sub_zone_code || "",
    sub_zone_name: branch?.sub_zone_name || "",
    location: branch?.location || "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = isEdit ? { ...formData, uid: branch?.uid } : formData;
    onSubmit(payload as T);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Grid gutter="md">
        <Grid.Col span={6}>
          <TextInput
            label="Branch Name"
            placeholder="Enter branch name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Branch Code"
            placeholder="Enter branch code"
            value={formData.code}
            onChange={(e) => handleChange("code", e.currentTarget.value)}
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Team"
            placeholder="Enter team"
            value={formData.team}
            onChange={(e) => handleChange("team", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Zone Code"
            placeholder="Enter zone code"
            value={formData.zone_code}
            onChange={(e) => handleChange("zone_code", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Zone Name"
            placeholder="Enter zone name"
            value={formData.zone_name}
            onChange={(e) => handleChange("zone_name", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Sub-zone Code"
            placeholder="Enter sub-zone code"
            value={formData.sub_zone_code}
            onChange={(e) => handleChange("sub_zone_code", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Sub-zone Name"
            placeholder="Enter sub-zone name"
            value={formData.sub_zone_name}
            onChange={(e) => handleChange("sub_zone_name", e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Location"
            placeholder="Enter location details"
            value={formData.location}
            onChange={(e) => handleChange("location", e.currentTarget.value)}
            minRows={2}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? "Update Branch" : "Create Branch"}
        </Button>
      </Group>
    </form>
  );
};

export default BranchForm;
