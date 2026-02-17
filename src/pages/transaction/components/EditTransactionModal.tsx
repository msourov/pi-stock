import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Transaction } from "../types";

interface UpdateTransactionPayload {
  uid: string;
  chep_id: string;
  from_where: string;
  to_where: string;
  stock_date: string;
  comment?: string;
  fb4_close_stock?: number;
  plastic_close_stock?: number;
  wood_close_stock?: number;
}

interface Props {
  transaction: Transaction;
  opened: boolean;
  onSubmit: (data: UpdateTransactionPayload) => Promise<void>;
  onClose: () => void;
}

const EditTransactionModal: React.FC<Props> = ({
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
  } = useForm<UpdateTransactionPayload>();

  // Update form values when modal opens or transaction changes
  useEffect(() => {
    if (transaction && opened) {
      const formData = {
        uid: transaction.uid,
        chep_id: transaction.chep_id,
        from_where: transaction.from_where,
        to_where: transaction.to_where,
        stock_date: transaction.stock_date,
        comment: transaction.comment || "",
        fb4_close_stock: transaction.fb4_close_stock ?? undefined,
        plastic_close_stock: transaction.plastic_close_stock ?? undefined,
        wood_close_stock: transaction.wood_close_stock ?? undefined,
      };

      reset(formData as UpdateTransactionPayload);
    }
  }, [transaction, opened, reset]);

  const submitHandler = handleSubmit(async (data) => {
    try {
      const payload: UpdateTransactionPayload = {
        uid: transaction.uid,
        chep_id: data.chep_id,
        from_where: data.from_where,
        to_where: data.to_where,
        stock_date: data.stock_date
          ? new Date(data.stock_date).toISOString()
          : new Date().toISOString(),
        comment: data.comment || undefined,
        fb4_close_stock: data.fb4_close_stock
          ? Number(data.fb4_close_stock)
          : undefined,
        plastic_close_stock: data.plastic_close_stock
          ? Number(data.plastic_close_stock)
          : undefined,
        wood_close_stock: data.wood_close_stock
          ? Number(data.wood_close_stock)
          : undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  });

  // Helper to parse date for the DateTimePicker
  const getDateValue = () => {
    const dateValue = watch("stock_date");
    if (!dateValue) return null;
    const date = new Date(dateValue as string);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Transaction"
      centered
      size="lg"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
    >
      <form onSubmit={submitHandler}>
        <Stack gap="md">
          {/* Hidden UID field */}
          <input type="hidden" {...register("uid")} />

          {/* Basic Information */}
          <TextInput
            label="Chep ID"
            placeholder="Enter Chep ID"
            {...register("chep_id", { required: "Chep ID is required" })}
          />

          <Group grow>
            <TextInput
              label="From"
              placeholder="Origin location"
              {...register("from_where", { required: "Origin is required" })}
            />
            <TextInput
              label="To"
              placeholder="Destination location"
              {...register("to_where", { required: "Destination is required" })}
            />
          </Group>

          {/* Stock Date - FIXED */}
          <DateTimePicker
            label="Stock Date"
            placeholder="Select date and time"
            value={getDateValue()}
            onChange={(date) => {
              // Store the date value properly
              setValue("stock_date", date ? date.toString() : "", {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            clearable
          />

          {/* Comment */}
          <Textarea
            label="Comment"
            placeholder="Add any notes or comments..."
            autosize
            minRows={2}
            maxRows={4}
            {...register("comment")}
          />

          {/* Close Stock Values */}
          <div>
            <p className="text-sm font-medium mb-2">Close Stock Values</p>
            <Group grow>
              <NumberInput
                label="FB4 Close"
                placeholder="0"
                min={0}
                value={watch("fb4_close_stock") ?? undefined}
                onChange={(val) =>
                  setValue(
                    "fb4_close_stock",
                    typeof val === "number" ? val : undefined,
                    { shouldValidate: true, shouldDirty: true },
                  )
                }
                allowNegative={false}
              />
              <NumberInput
                label="Plastic Close"
                placeholder="0"
                min={0}
                value={watch("plastic_close_stock") ?? undefined}
                onChange={(val) =>
                  setValue(
                    "plastic_close_stock",
                    typeof val === "number" ? val : undefined,
                    { shouldValidate: true, shouldDirty: true },
                  )
                }
                allowNegative={false}
              />
              <NumberInput
                label="Wood Close"
                placeholder="0"
                min={0}
                value={watch("wood_close_stock") ?? undefined}
                onChange={(val) =>
                  setValue(
                    "wood_close_stock",
                    typeof val === "number" ? val : undefined,
                    { shouldValidate: true, shouldDirty: true },
                  )
                }
                allowNegative={false}
              />
            </Group>
          </div>

          {/* Transaction Info (Read-only) */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <p className="text-sm font-medium mb-2 text-gray-600">
              Transaction Information (Read-only)
            </p>
            <Group grow>
              <div>
                <p style={{ fontSize: "12px", color: "#6c757d" }}>Type</p>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                  {transaction.t_type}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#6c757d" }}>Creator</p>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                  {transaction.creator_id}
                </p>
              </div>
            </Group>
            <Group grow style={{ marginTop: "8px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#6c757d" }}>FB4 Total</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#3b82f6",
                  }}
                >
                  {transaction.total_fb4_stock.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#6c757d" }}>
                  Plastic Total
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#10b981",
                  }}
                >
                  {transaction.total_plastic_stock.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#6c757d" }}>Wood Total</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#f59e0b",
                  }}
                >
                  {transaction.total_wood_stock.toLocaleString()}
                </p>
              </div>
            </Group>
          </div>

          {/* Action Buttons */}
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
