import React, { useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit,
  MapPin,
  PackageMinus,
  TrendingDown,
  TrendingUp,
  User,
  Activity,
  Package,
  Clock,
} from "lucide-react";
import { Transaction } from "./types";
import { useTransactions } from "./hooks";

interface Props {
  uid: string;
  token: string | null;
  logout: () => void;
  onBack: () => void;
  onEdit: (tx: Transaction) => void;
  onWriteOff: (tx: Transaction) => void;
}

const TransactionDetailPage: React.FC<Props> = ({
  uid,
  token,
  logout,
  onBack,
  onEdit,
  onWriteOff,
}) => {
  const {
    selectedTransaction: tx,
    loading,
    error,
    fetchTransactionDetail,
  } = useTransactions({ token, logout });

  useEffect(() => {
    if (uid) {
      fetchTransactionDetail(uid);
    }
  }, [uid]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      inbound: { bg: "bg-emerald-100", text: "text-emerald-700" },
      outbound: { bg: "bg-rose-100", text: "text-rose-700" },
      opening_stock: { bg: "bg-amber-100", text: "text-amber-700" },
      adjustment: { bg: "bg-blue-100", text: "text-blue-700" },
      write_off: { bg: "bg-slate-100", text: "text-slate-600" },
    };
    const s = styles[type] ?? { bg: "bg-gray-100", text: "text-gray-600" };
    return (
      <span
        className={`${s.bg} ${s.text} px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide`}
      >
        {type.replace(/_/g, " ")}
      </span>
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading transaction...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !tx) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">
            {error ?? "Transaction not found."}
          </p>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const stockRows = [
    {
      label: "FB4",
      total: tx.total_fb4_stock,
      receive: tx.total_fb4_receive_stock,
      send: tx.total_fb4_send_stock,
      adjustment: tx.total_fb4_adjustment_stock,
      writeOff: tx.total_fb4_write_off_stock,
      close: tx.fb4_close_stock,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Plastic",
      total: tx.total_plastic_stock,
      receive: tx.total_plastic_receive_stock,
      send: tx.total_plastic_send_stock,
      adjustment: tx.total_plastic_adjustment_stock,
      writeOff: tx.total_plastic_write_off_stock,
      close: tx.plastic_close_stock,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Wood",
      total: tx.total_wood_stock,
      receive: tx.total_wood_receive_stock,
      send: tx.total_wood_send_stock,
      adjustment: tx.total_wood_adjustment_stock,
      writeOff: tx.total_wood_write_off_stock,
      close: tx.wood_close_stock,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(tx)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onWriteOff(tx)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            <PackageMinus className="w-3.5 h-3.5" />
            Write Off
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="text-base font-bold text-gray-900 font-mono">
                    {tx.chep_id}
                  </h1>
                  {getTypeBadge(tx.t_type)}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tx.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tx.active ? "bg-emerald-500" : "bg-red-400"}`}
                    />
                    {tx.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium text-gray-700">
                      {tx.from_where}
                    </span>
                    <span className="text-gray-400 mx-0.5">→</span>
                    <span className="font-medium text-gray-700">
                      {tx.to_where}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(tx.stock_date)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    {tx.creator_id}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <div className="flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                Created: {formatDate(tx.create_at)}
              </div>
              {tx.update_at && (
                <div className="flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {formatDate(tx.update_at)}
                </div>
              )}
            </div>
          </div>
          {tx.comment && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                Comment:
              </span>
              <span className="text-xs text-gray-700">{tx.comment}</span>
            </div>
          )}
        </div>

        {/* ── Stock totals row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {stockRows.map((row) => (
            <div
              key={row.label}
              className={`bg-white rounded-lg border ${row.border} p-3 border-l-4`}
            >
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                {row.label}
              </div>
              <div className={`text-2xl font-bold ${row.color}`}>
                {row.total.toLocaleString()}
              </div>
              {row.close !== null && (
                <div className="text-xs text-gray-400 mt-0.5">
                  Close: {row.close}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Stock breakdown table ────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Stock Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 w-20">
                    Type
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      Received
                    </span>
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                      Sent
                    </span>
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Adjustment
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Write-Off
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Close
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stockRows.map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${row.color}`}>
                        {row.label}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold ${row.color}`}
                    >
                      {row.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.receive > 0 ? (
                        <span className="text-emerald-700 font-medium">
                          +{row.receive.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.send > 0 ? (
                        <span className="text-rose-700 font-medium">
                          -{row.send.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.adjustment !== 0 ? (
                        <span className="text-blue-700 font-medium">
                          {row.adjustment.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.writeOff > 0 ? (
                        <span className="text-slate-700 font-medium">
                          {row.writeOff.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.close !== null ? (
                        <span className="font-medium text-gray-700">
                          {row.close.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Activity log ─────────────────────────────────────────────────── */}
        {tx.logs && tx.logs.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Activity Log
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {tx.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800">{log.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Admin {log.admin} · {formatDate(log.create_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailPage;
