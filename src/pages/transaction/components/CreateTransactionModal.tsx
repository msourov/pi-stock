import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@mantine/core";

// Corrected payload interface
interface CreateTransactionPayload {
  chep_id: string;
  t_type: "inbound" | "outbound";
  from_where: string;
  to_where: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
  comment?: string;
}

interface Props {
  onSubmit: (data: CreateTransactionPayload) => Promise<void>;
  onClose: () => void;
  opened: boolean;
}

const CreateTransactionModal: React.FC<Props> = ({
  onSubmit,
  onClose,
  opened,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionPayload>({
    defaultValues: {
      t_type: "inbound",
      from_where: "",
      to_where: "EP", // Auto-fill for inbound
      fb4_stock: 0,
      plastic_stock: 0,
      wood_stock: 0,
      stock_date: new Date().toISOString().slice(0, 16),
      comment: "",
    },
  });

  const transactionType = watch("t_type");

  // Auto-fill from/to based on transaction type
  useEffect(() => {
    if (transactionType === "inbound") {
      setValue("to_where", "EP");
      setValue("from_where", "");
    } else if (transactionType === "outbound") {
      setValue("from_where", "EP");
      setValue("to_where", "");
    }
  }, [transactionType, setValue]);

  const submitHandler = handleSubmit(async (data) => {
    // Ensure stock_date is ISO string
    const payload = {
      ...data,
      stock_date: new Date(data.stock_date).toISOString(),
      fb4_stock: Number(data.fb4_stock) || 0,
      plastic_stock: Number(data.plastic_stock) || 0,
      wood_stock: Number(data.wood_stock) || 0,
    };
    await onSubmit(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Transaction"
      centered
      size="lg"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
    >
      <form onSubmit={submitHandler} className="p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("t_type", { required: "Type is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            {errors.t_type && (
              <p className="text-red-600 text-xs mt-1">
                {errors.t_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chep ID <span className="text-red-500">*</span>
            </label>
            <input
              {...register("chep_id", { required: "Chep ID is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Chep ID"
            />
            {errors.chep_id && (
              <p className="text-red-600 text-xs mt-1">
                {errors.chep_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                {...register("from_where", {
                  required: "Origin is required",
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  transactionType === "outbound" ? "EP" : "Enter origin"
                }
                readOnly={transactionType === "outbound"}
              />
              {errors.from_where && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.from_where.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                {...register("to_where", {
                  required: "Destination is required",
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  transactionType === "inbound" ? "EP" : "Enter destination"
                }
                readOnly={transactionType === "inbound"}
              />
              {errors.to_where && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.to_where.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register("stock_date", { required: "Date is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.stock_date && (
              <p className="text-red-600 text-xs mt-1">
                {errors.stock_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantities <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">FB4</label>
                <input
                  type="number"
                  {...register("fb4_stock", {
                    required: "FB4 stock is required",
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.fb4_stock && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.fb4_stock.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Plastic
                </label>
                <input
                  type="number"
                  {...register("plastic_stock", {
                    required: "Plastic stock is required",
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.plastic_stock && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.plastic_stock.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Wood</label>
                <input
                  type="number"
                  {...register("wood_stock", {
                    required: "Wood stock is required",
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.wood_stock && (
                  <p className="text-red-600 text-xs mt-0.5">
                    {errors.wood_stock.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register("comment")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Add any notes..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong>{" "}
              {transactionType === "inbound"
                ? 'For inbound transactions, "To" is automatically set to EP.'
                : 'For outbound transactions, "From" is automatically set to EP.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTransactionModal;
