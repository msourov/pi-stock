import { useForm } from "react-hook-form";
import { CreatePayload, StockFormProps } from "../types";
import { useEffect } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

export const StockFormModal: React.FC<StockFormProps> = ({
  opened,
  onClose,
  onSubmit,
  initial,
}) => {
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<CreatePayload>({
    defaultValues: { fb4_stock: 0, plastic_stock: 0, wood_stock: 0 },
  });

  useEffect(() => {
    if (opened) {
      reset(
        initial
          ? {
              description: initial.description,
              fb4_stock: initial.fb4_stock,
              plastic_stock: initial.plastic_stock,
              wood_stock: initial.wood_stock,
              stock_date: initial.stock_date,
            }
          : {
              description: "",
              fb4_stock: 0,
              plastic_stock: 0,
              wood_stock: 0,
              stock_date: new Date().toISOString(),
            },
      );
    }
  }, [opened, initial, reset]);

  const getDateValue = () => {
    const v = watch("stock_date");
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const submitHandler = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      stock_date: new Date(data.stock_date).toISOString(),
      fb4_stock: Number(data.fb4_stock) || 0,
      plastic_stock: Number(data.plastic_stock) || 0,
      wood_stock: Number(data.wood_stock) || 0,
    });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600}>{isEdit ? "Edit Stock Check" : "New Stock Check"}</Text>
      }
      centered
      size="md"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form onSubmit={submitHandler}>
        <Stack gap="md">
          <Textarea
            label="Description"
            placeholder="Describe the purpose of this stock check..."
            autosize
            minRows={2}
            maxRows={4}
            withAsterisk
            {...register("description", { required: true })}
          />

          <DateTimePicker
            label="Stock Date"
            placeholder="Select date and time"
            value={getDateValue()}
            onChange={(date) =>
              setValue("stock_date", date ? date.toString() : "", {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            clearable
          />

          <div>
            <Text size="sm" fw={500} mb={8}>
              Stock Values
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

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} color="blue">
              {isEdit ? "Save Changes" : "Create Check"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
