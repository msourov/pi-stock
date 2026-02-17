import React from "react";
import { Transaction } from "../types";
import { Edit, PackageMinus } from "lucide-react";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (tx: Transaction) => void;
  onWriteOff: (tx: Transaction) => void;
}

const TransactionTable: React.FC<Props> = ({
  transactions,
  loading,
  onEdit,
  onWriteOff,
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      inbound: "bg-emerald-100 text-emerald-700",
      outbound: "bg-rose-100 text-rose-700",
      opening_stock: "bg-amber-100 text-amber-700",
      adjustment: "bg-blue-100 text-blue-700",
      write_off: "bg-slate-100 text-slate-600",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] ?? "bg-gray-100 text-gray-600"}`}
      >
        {type.replace("_", " ")}
      </span>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
              Chep ID
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
              Type
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
              From → To
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
              Stock Date
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
              FB4
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
              Plastic
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
              Wood
            </th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
              Active
            </th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <tr key={tx.uid} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2 font-mono text-xs text-gray-900">
                {tx.chep_id}
              </td>
              <td className="px-3 py-2">{getTypeBadge(tx.t_type)}</td>
              <td className="px-3 py-2 text-xs text-gray-700">
                <span className="font-medium">{tx.from_where}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-medium">{tx.to_where}</span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-600">
                {formatDate(tx.stock_date)}
              </td>
              <td className="px-3 py-2 text-right text-xs font-medium text-blue-700">
                {tx.total_fb4_stock.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right text-xs font-medium text-emerald-700">
                {tx.total_plastic_stock.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right text-xs font-medium text-amber-700">
                {tx.total_wood_stock.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-center text-xs">
                {tx.active ? (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-emerald-500"
                    title="Active"
                  />
                ) : (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-red-400"
                    title="Inactive"
                  />
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onWriteOff(tx)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Write Off"
                  >
                    <PackageMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && !loading && (
            <tr>
              <td
                colSpan={9}
                className="text-center py-8 text-sm text-gray-400"
              >
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
