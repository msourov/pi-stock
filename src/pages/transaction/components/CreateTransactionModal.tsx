import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@mantine/core";
import useCategory from "../../categories/hooks";

interface CategoryOption {
  uid: string;
  name: string;
}

interface CreateTransactionPayload {
  chep_id: string;
  t_type: "inbound" | "outbound" | "adjustment_inbound" | "adjustment_outbound";
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionPayload>({
    defaultValues: {
      t_type: "inbound",
      from_where: "",
      to_where: "EP",
      fb4_stock: 0,
      plastic_stock: 0,
      wood_stock: 0,
      stock_date: new Date().toISOString().slice(0, 16),
      comment: "",
    },
  });
  const { getCategoryHelperSam } = useCategory();

  const transactionType = watch("t_type");

  const [fromOptions, setFromOptions] = useState<CategoryOption[]>([]);
  const [toOptions, setToOptions] = useState<CategoryOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      reset({
        t_type: "inbound",
        from_where: "",
        to_where: "EP",
        fb4_stock: 0,
        plastic_stock: 0,
        wood_stock: 0,
        stock_date: new Date().toISOString().slice(0, 16),
        comment: "",
      });
    }
  }, [opened, reset]);

  // Fetch the right category options whenever type changes
  useEffect(() => {
    if (!opened) return;

    const load = async () => {
      setOptionsLoading(true);
      try {
        if (transactionType === "inbound") {
          // from_where is dynamic, to_where locked to EP
          const res = await getCategoryHelperSam({
            page: 1,
            page_size: 100,
            category_type: "from_where",
          });

          setFromOptions(res.data || []);
          setToOptions([]);
          setValue("from_where", "");
          setValue("to_where", "EP");
        } else if (transactionType === "outbound") {
          // to_where is dynamic, from_where locked to EP
          const res = await getCategoryHelperSam({
            page: 1,
            page_size: 100,
            category_type: "to_where",
          });

          setToOptions(res.data || []);

          setFromOptions([]);
          setValue("from_where", "EP");
          setValue("to_where", "");
        } else {
          // adjustment — both free text, no dropdown
          setFromOptions([]);
          setToOptions([]);
          setValue("from_where", "");
          setValue("to_where", "");
        }
      } finally {
        setOptionsLoading(false);
      }
    };

    load();
  }, [transactionType, opened, setValue]);

  const submitHandler = handleSubmit(async (data) => {
    const payload: CreateTransactionPayload = {
      ...data,
      stock_date: new Date(data.stock_date).toISOString(),
      fb4_stock: Number(data.fb4_stock) || 0,
      plastic_stock: Number(data.plastic_stock) || 0,
      wood_stock: Number(data.wood_stock) || 0,
    };
    await onSubmit(payload);
  });

  // Shared input classes
  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const readOnlyCls =
    "w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed";
  const selectCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  const isAdjustment =
    transactionType === "adjustment_inbound" ||
    transactionType === "adjustment_outbound";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Transaction"
      centered
      size="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={submitHandler} className="p-4">
        <div className="space-y-3">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("t_type", { required: "Type is required" })}
              className={selectCls}
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="adjustment_inbound">Adjust positive</option>
              <option value="adjustment_outbound">Adjust negative</option>
            </select>
            {errors.t_type && (
              <p className="text-red-600 text-xs mt-1">
                {errors.t_type.message}
              </p>
            )}
          </div>

          {/* Chep ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chep ID <span className="text-red-500">*</span>
            </label>
            <input
              {...register("chep_id", { required: "Chep ID is required" })}
              className={inputCls}
              placeholder="Enter Chep ID"
            />
            {errors.chep_id && (
              <p className="text-red-600 text-xs mt-1">
                {errors.chep_id.message}
              </p>
            )}
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            {/* FROM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From <span className="text-red-500">*</span>
              </label>

              {transactionType === "outbound" ? (
                // Locked to EP
                <input value="EP" readOnly className={readOnlyCls} />
              ) : isAdjustment ? (
                // Free text for adjustments
                <input
                  {...register("from_where", {
                    required: "Origin is required",
                  })}
                  className={inputCls}
                  placeholder="Enter origin"
                />
              ) : (
                // Inbound — dropdown from API
                <div className="relative">
                  <select
                    {...register("from_where", {
                      required: "Origin is required",
                    })}
                    className={selectCls}
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading ? "Loading..." : "Select source"}
                    </option>
                    {fromOptions.map((opt) => (
                      <option key={opt.uid} value={opt.name}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  {optionsLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {errors.from_where && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.from_where.message}
                </p>
              )}
            </div>

            {/* TO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>

              {transactionType === "inbound" ? (
                // Locked to EP
                <input value="EP" readOnly className={readOnlyCls} />
              ) : isAdjustment ? (
                // Free text for adjustments
                <input
                  {...register("to_where", {
                    required: "Destination is required",
                  })}
                  className={inputCls}
                  placeholder="Enter destination"
                />
              ) : (
                // Outbound — dropdown from API
                <div className="relative">
                  <select
                    {...register("to_where", {
                      required: "Destination is required",
                    })}
                    className={selectCls}
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading ? "Loading..." : "Select destination"}
                    </option>
                    {toOptions.map((opt) => (
                      <option key={opt.uid} value={opt.name}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  {optionsLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {errors.to_where && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.to_where.message}
                </p>
              )}
            </div>
          </div>

          {/* Flow hint */}
          {!isAdjustment && (
            <div
              className={`border rounded-lg p-2.5 text-xs ${
                transactionType === "inbound"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {transactionType === "inbound" ? (
                <>
                  <strong>Inbound:</strong> stock flows{" "}
                  <span className="font-mono">
                    {watch("from_where") || "Source"} → EP
                  </span>
                </>
              ) : (
                <>
                  <strong>Outbound:</strong> stock flows{" "}
                  <span className="font-mono">
                    EP → {watch("to_where") || "Destination"}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Stock Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register("stock_date", { required: "Date is required" })}
              className={inputCls}
            />
            {errors.stock_date && (
              <p className="text-red-600 text-xs mt-1">
                {errors.stock_date.message}
              </p>
            )}
          </div>

          {/* Stock Quantities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantities <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { field: "fb4_stock", label: "FB4" },
                  { field: "plastic_stock", label: "Plastic" },
                  { field: "wood_stock", label: "Wood" },
                ] as const
              ).map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    {...register(field, {
                      required: `${label} stock is required`,
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className={inputCls}
                    placeholder="0"
                  />
                  {errors[field] && (
                    <p className="text-red-600 text-xs mt-0.5">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register("comment")}
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="Add any notes..."
            />
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
            disabled={isSubmitting || optionsLoading}
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
