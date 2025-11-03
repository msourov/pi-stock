import {
  Button,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

type Branch = {
  value: string;
  label: string;
};

type ProductOption = {
  uid: string;
  name: string;
};

type CreateStockModalProps = {
  opened: boolean;
  close: () => void;
  handleSubmit: (
    values: import("../type").CreateStockPayload
  ) => void | Promise<void>;
  form: UseFormReturnType<import("../type").CreateStockPayload>;
  branches: Branch[];
  productOptions: ProductOption[];
};

const CreateStockModal = ({
  opened,
  close,
  handleSubmit,
  form,
  branches,
  productOptions,
}: CreateStockModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="xl"
      padding="xl"
      title={
        <Title order={4} c="gray">
          Add New Stock
        </Title>
      }
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={12}>
            <Select
              label="Branch"
              placeholder="Select branch"
              data={branches}
              {...form.getInputProps("branch_id")}
              withAsterisk
            />
          </Grid.Col>

          {/* Product ID */}
          <Grid.Col span={12}>
            <Select
              label="Product"
              placeholder="Select a product"
              data={
                productOptions?.map((p: { uid: string; name: string }) => ({
                  value: p.uid,
                  label: p.name,
                })) || []
              }
              {...form.getInputProps("product_id")}
              withAsterisk
              searchable
              clearable
              nothingFoundMessage="No products found"
            />
          </Grid.Col>

          {/* Movement Type */}
          <Grid.Col span={12}>
            <Select
              label="Movement Type"
              data={[
                { value: "opening", label: "Opening Stock" },
                { value: "purchase", label: "Purchase" },
                { value: "sale", label: "Sale" },
              ]}
              {...form.getInputProps("movement_type")}
              withAsterisk
            />
          </Grid.Col>

          {/* Quantity */}
          <Grid.Col span={12}>
            <NumberInput
              label="Quantity"
              min={0}
              {...form.getInputProps("quantity")}
              withAsterisk
            />
          </Grid.Col>

          {/* Reference - optional */}
          <Grid.Col span={12}>
            <TextInput
              label="Reference"
              placeholder="Enter reference"
              {...form.getInputProps("reference")}
            />
          </Grid.Col>

          {/* Description - optional */}
          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Enter description"
              rows={3}
              {...form.getInputProps("description")}
            />
          </Grid.Col>
        </Grid>

        <Group ta="right" mt="md">
          <Button type="submit" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Create Stock</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateStockModal;
