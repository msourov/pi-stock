import { useEffect, useState } from "react";
import { CheckStock } from "../types";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Edit,
  Package,
  Trash2,
} from "lucide-react";
import useChepAudit from "../hooks";

interface DetailProps {
  uid: string;
  onBack: () => void;
  onEdit: (item: CheckStock) => void;
  onDelete: (item: CheckStock) => void;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const CheckStockDetail: React.FC<DetailProps> = ({
  uid,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { getAuditDetails, loading } = useChepAudit();
  const [item, setItem] = useState<CheckStock | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getAuditDetails(uid);
        setItem(result.data || result);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load details.");
      }
    };
    fetchDetail();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {error ?? "Item not found"}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            The record may have been deleted.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Record
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {item.description}
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Audit Date: {formatDate(item.stock_date)}
                </span>
                {item.creator_id && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    ID: {item.creator_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-xs text-gray-400 font-medium">
              Created:{" "}
              <span className="text-gray-600">
                {item.create_at ? formatDate(item.create_at) : "N/A"}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-medium text-right">
              Last Update:{" "}
              <span className="text-gray-600">
                {item.update_at ? formatDate(item.update_at) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Stock totals grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "FB4 Stock",
              value: item.fb4_stock,
              color: "text-blue-700",
              border: "border-l-blue-500",
              bg: "bg-blue-50",
            },
            {
              label: "Plastic Stock",
              value: item.plastic_stock,
              color: "text-emerald-700",
              border: "border-l-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              label: "Wood Stock",
              value: item.wood_stock,
              color: "text-amber-700",
              border: "border-l-amber-500",
              bg: "bg-amber-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl border border-gray-200 border-l-4 ${s.border} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div
                className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}
              >
                <Package className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-3xl font-extrabold ${s.color} mt-1`}>
                {s.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
