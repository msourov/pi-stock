import {
  Package,
  Layers,
  TreePine,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { StockDetails } from "../types";


interface Props {
  stock: StockDetails | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const StockSummaryCard = ({
  stock,
  loading,
  error,
  onRefresh,
}: Props) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const items = stock
    ? [
        {
          label: "FB4 Stock",
          value: stock.fb4_stock,
          writeOff: stock.total_fb4_write_off_stock,
          icon: Package,
          borderColor: "border-l-blue-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          label: "Plastic Stock",
          value: stock.plastic_stock,
          writeOff: stock.total_plastic_write_off_stock,
          icon: Layers,
          borderColor: "border-l-emerald-500",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-600",
        },
        {
          label: "Wood Stock",
          value: stock.wood_stock,
          writeOff: stock.total_wood_write_off_stock,
          icon: TreePine,
          borderColor: "border-l-amber-500",
          bgColor: "bg-amber-50",
          textColor: "text-amber-600",
        },
      ]
    : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            Current Stock Levels
          </span>
          {stock && (
            <span className="text-xs text-gray-400">
              · as of {formatDate(stock.stock_date)}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Skeleton */}
      {loading && !stock && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Stock cards */}
      {!loading && stock && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`border border-gray-200 border-l-4 ${item.borderColor} rounded-lg p-3`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase truncate">
                      {item.label}
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {item.value.toLocaleString()}
                    </div>
                    {item.writeOff > 0 && (
                      <div className="text-xs text-rose-500 mt-0.5">
                        −{item.writeOff.toLocaleString()} written off
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
