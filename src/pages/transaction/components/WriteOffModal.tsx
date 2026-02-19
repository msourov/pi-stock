import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Transaction, WriteOffPayload } from "../types";

interface WriteOffFormValues {
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: Date | null; // This remains a Date object for the UI component
  comment: string;
}

interface Props {
  transaction: Transaction;
  opened: boolean;
  onSubmit: (data: WriteOffPayload) => Promise<void>;
  onClose: () => void;
}

const WriteOffModal: React.FC<Props> = ({
  transaction,
  opened,
  onSubmit,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<WriteOffFormValues>({
    defaultValues: {
      fb4_stock: 0,
      plastic_stock: 0,
      wood_stock: 0,
      stock_date: new Date(),
      comment: "",
    },
  });

  useEffect(() => {
    if (transaction && opened) {
      // Ensure we convert the string from API to a Date object here
      const initialDate = transaction.stock_date
        ? new Date(transaction.stock_date)
        : new Date();

      reset({
        fb4_stock: transaction.total_fb4_stock ?? 0,
        plastic_stock: transaction.total_plastic_stock ?? 0,
        wood_stock: transaction.total_wood_stock ?? 0,
        stock_date: isNaN(initialDate.getTime()) ? new Date() : initialDate,
        comment: "",
      });
    }
  }, [transaction, opened, reset]);

  const submitHandler = handleSubmit(async (data) => {
    const payload: WriteOffPayload = {
      chep_id: transaction.chep_id,
      from_where: transaction.from_where,
      to_where: transaction.to_where,
      t_type: "write_off",
      fb4_stock: Number(data.fb4_stock),
      plastic_stock: Number(data.plastic_stock),
      wood_stock: Number(data.wood_stock),
      // Convert Date object back to ISO string for the backend
      stock_date: data.stock_date
        ? data.stock_date.toISOString()
        : new Date().toISOString(),
      comment: data.comment,
    };

    await onSubmit(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Write Off</Text>}
      centered
      size="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={submitHandler}>
        <Stack gap="md">
          <DateTimePicker
            label="Stock Date"
            placeholder="Select date and time"
            value={watch("stock_date")}
            onChange={(date) =>
              setValue("stock_date", new Date(date), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            clearable
          />

          <Group grow>
            <NumberInput
              label="FB4"
              min={0}
              value={watch("fb4_stock")}
              onChange={(val) =>
                setValue("fb4_stock", Number(val), { shouldDirty: true })
              }
              allowNegative={false}
            />
            <NumberInput
              label="Plastic"
              min={0}
              value={watch("plastic_stock")}
              onChange={(val) =>
                setValue("plastic_stock", Number(val), { shouldDirty: true })
              }
              allowNegative={false}
            />
            <NumberInput
              label="Wood"
              min={0}
              value={watch("wood_stock")}
              onChange={(val) =>
                setValue("wood_stock", Number(val), { shouldDirty: true })
              }
              allowNegative={false}
            />
          </Group>

          <Textarea
            label="Comment"
            placeholder="Add a comment..."
            autosize
            minRows={2}
            maxRows={4}
            {...register("comment")}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} color="red">
              Write Off
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default WriteOffModal;
