import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, NumberInput, Button, Stack, Group } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

interface ActualPayload {
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: Date | null;
}

interface Props {
  opened: boolean;
  onSubmit: (data: ActualPayload) => Promise<void>;
  onClose: () => void;
}

const OpenStockModal: React.FC<Props> = ({ opened, onSubmit, onClose }) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ActualPayload>({
    defaultValues: {
      fb4_stock: 0,
      plastic_stock: 0,
      wood_stock: 0,
      stock_date: new Date(),
    },
  });

  const submitHandler = handleSubmit(async (data) => {
    const finalPayload = {
      fb4_stock: Number(data.fb4_stock),
      plastic_stock: Number(data.plastic_stock),
      wood_stock: Number(data.wood_stock),
      stock_date: data.stock_date || new Date(),
    };

    await onSubmit(finalPayload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Opening Stock"
      centered
    >
      <form onSubmit={submitHandler}>
        <Stack>
          <Controller
            name="stock_date"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Stock Date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Group grow>
            <Controller
              name="fb4_stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="FB4 Stock"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  min={0}
                />
              )}
            />

            <Controller
              name="plastic_stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Plastic Stock"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  min={0}
                />
              )}
            />

            <Controller
              name="wood_stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Wood Stock"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  min={0}
                />
              )}
            />
          </Group>

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="green" loading={isSubmitting}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default OpenStockModal;
