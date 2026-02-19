// Fixed: aligned with actual API payload
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
  Select,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Transaction } from "../types";

export interface UpdateTransactionPayload {
  uid: string;
  comment?: string;
  from_where: string;
  to_where: string;
  t_type: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
}

interface FormValues {
  from_where: string;
  to_where: string;
  t_type: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  comment?: string;
}

interface Props {
  transaction: Transaction;
  opened: boolean;
  onSubmit: (data: UpdateTransactionPayload) => Promise<void>;
  onClose: () => void;
}

const T_TYPE_OPTIONS = [
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
  { value: "adjustment_inbound", label: "Adjust Positive" },
  { value: "adjustment_outbound", label: "Adjust Negative" },
];

const EditTransactionModal: React.FC<Props> = ({
  transaction,
  opened,
  onSubmit,
  onClose,
}) => {
  const [stockDate, setStockDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (transaction && opened) {
      reset({
        from_where: transaction.from_where,
        to_where: transaction.to_where,
        t_type: transaction.t_type,
        fb4_stock: transaction.total_fb4_stock ?? 0,
        plastic_stock: transaction.total_plastic_stock ?? 0,
        wood_stock: transaction.total_wood_stock ?? 0,
        comment: transaction.comment || "",
      });

      setStockDate(
        transaction.stock_date ? new Date(transaction.stock_date) : new Date(),
      );
    }
  }, [transaction, opened, reset]);

  const submitHandler = handleSubmit(async (data) => {
    const payload: UpdateTransactionPayload = {
      uid: transaction.uid,
      from_where: data.from_where,
      to_where: data.to_where,
      t_type: data.t_type,
      fb4_stock: Number(data.fb4_stock),
      plastic_stock: Number(data.plastic_stock),
      wood_stock: Number(data.wood_stock),
      stock_date: stockDate
        ? stockDate.toISOString()
        : new Date().toISOString(),
      comment: data.comment || undefined,
    };

    await onSubmit(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Edit Transaction</Text>}
      centered
      size="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={submitHandler}>
        <Stack gap="md">
          <Select
            label="Transaction Type"
            placeholder="Select type"
            withAsterisk
            data={T_TYPE_OPTIONS}
            value={watch("t_type")}
            onChange={(val) =>
              setValue("t_type", val ?? "", {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={errors.t_type?.message}
          />

          <Group grow>
            <TextInput
              label="From"
              placeholder="Origin location"
              withAsterisk
              error={errors.from_where?.message}
              {...register("from_where", { required: "Origin is required" })}
            />
            <TextInput
              label="To"
              placeholder="Destination location"
              withAsterisk
              error={errors.to_where?.message}
              {...register("to_where", { required: "Destination is required" })}
            />
          </Group>

          <DateTimePicker
            label="Stock Date"
            placeholder="Select date and time"
            value={stockDate}
            onChange={(date) => setStockDate(new Date(date))}
            clearable
          />

          <div>
            <Text fz="sm" fw={500} mb={8}>
              Stock Quantities
            </Text>
            <Group grow>
              <NumberInput
                label="FB4"
                placeholder="0"
                min={0}
                value={watch("fb4_stock") ?? 0}
                onChange={(val) =>
                  setValue("fb4_stock", typeof val === "number" ? val : 0, {
                    shouldDirty: true,
                  })
                }
                allowNegative={false}
              />
              <NumberInput
                label="Plastic"
                placeholder="0"
                min={0}
                value={watch("plastic_stock") ?? 0}
                onChange={(val) =>
                  setValue("plastic_stock", typeof val === "number" ? val : 0, {
                    shouldDirty: true,
                  })
                }
                allowNegative={false}
              />
              <NumberInput
                label="Wood"
                placeholder="0"
                min={0}
                value={watch("wood_stock") ?? 0}
                onChange={(val) =>
                  setValue("wood_stock", typeof val === "number" ? val : 0, {
                    shouldDirty: true,
                  })
                }
                allowNegative={false}
              />
            </Group>
          </div>

          <Textarea
            label="Comment"
            placeholder="Add any notes or comments..."
            autosize
            minRows={2}
            maxRows={4}
            {...register("comment")}
          />

          {/* Read-only info */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <Text fz="sm" fw={500} c="dimmed" mb={8}>
              Transaction Information (Read-only)
            </Text>
            <Group grow>
              <div>
                <Text fz="xs" c="dimmed">
                  Chep ID
                </Text>
                <Text fz="sm" fw={500}>
                  {transaction.chep_id}
                </Text>
              </div>
              <div>
                <Text fz="xs" c="dimmed">
                  Creator
                </Text>
                <Text fz="sm" fw={500}>
                  {transaction.creator_id}
                </Text>
              </div>
            </Group>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} color="blue">
              Update Transaction
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditTransactionModal;
