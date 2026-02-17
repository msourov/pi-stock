import React, { useEffect, useState } from "react";
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  OpenStockPayload,
} from "./types";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  ChevronDown,
  FilePenLine,
  TreePine,
  Layers,
} from "lucide-react";
import CreateTransactionModal from "./components/CreateTransactionModal";
import OpenStockModal from "./components/OpenStockModal";
import EditTransactionModal from "./components/EditTransactionModal";
import { useTransactions } from "./hooks";
import { useAuth } from "../../AuthProvider";
import WriteOffModal from "./components/WriteOffModal";

type ModalType = "create" | "openStock" | "edit" | "writeOff" | null;

const TransactionPage = () => {
  const token = localStorage.getItem("token");
  const { logout } = useAuth();

  const {
    transactions,
    loading,
    error,
    totalCount,
    fetchTransactions,
    createTransaction,
    createOpenStock,
    updateTransaction,
    writeOffTransaction,
  } = useTransactions({ token, logout });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);

  useEffect(() => {
    if (token) {
      fetchTransactions(page, limit);
    }
  }, [page, limit, token, fetchTransactions]);

  // Modal handlers
  const openCreateModal = () => {
    setSelectedTransaction(null);
    setModalType("create");
  };

  const openOpenStockModal = () => {
    setSelectedTransaction(null);
    setModalType("openStock");
  };

  const openEditModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setModalType("edit");
  };

  const openWriteOffModal = (tx?: Transaction) => {
    setSelectedTransaction(tx || null);
    setModalType("writeOff");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTransaction(null);
  };

  const handleSuccess = () => {
    fetchTransactions(page, limit);
    closeModal();
  };

  const getTransactionTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      inbound: { bg: "bg-emerald-100", text: "text-emerald-700" },
      outbound: { bg: "bg-rose-100", text: "text-rose-700" },
      opening_stock: { bg: "bg-amber-100", text: "text-amber-700" },
      adjustment: { bg: "bg-blue-100", text: "text-blue-700" },
      write_off: { bg: "bg-slate-100", text: "text-slate-700" },
    };
    const badge = badges[type] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span
        className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded text-xs font-medium`}
      >
        {type.replace("_", " ")}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.t_type === filterType;
    const matchesSearch =
      searchTerm === "" ||
      t.chep_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.from_where.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.to_where.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(totalCount / limit);

  // Calculate stock totals
  const stockTotals = transactions.reduce(
    (acc, t) => ({
      fb4: acc.fb4 + (t.total_fb4_stock || 0),
      plastic: acc.plastic + (t.total_plastic_stock || 0),
      wood: acc.wood + (t.total_wood_stock || 0),
    }),
    { fb4: 0, plastic: 0, wood: 0 },
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-gray-50 p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto">
        {/* Compact Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CHEP Stock Transactions
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage pallet inventory and transactions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTransactions(page, limit)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-200"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
              <button
                onClick={openOpenStockModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Opening
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-red-900 text-sm">
                  Error loading transactions
                </div>
                <div className="text-red-700 text-xs mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {/* Redesigned Stats Cards - Mantine style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { 
                label: "FB4", 
                value: stockTotals.fb4, 
                color: "blue", 
                icon: Package,
                borderColor: "border-l-blue-500",
                bgColor: "bg-blue-50",
                textColor: "text-blue-600"
              },
              { 
                label: "Plastic", 
                value: stockTotals.plastic, 
                color: "emerald", 
                icon: Layers,
                borderColor: "border-l-emerald-500",
                bgColor: "bg-emerald-50",
                textColor: "text-emerald-600"
              },
              { 
                label: "Wood", 
                value: stockTotals.wood, 
                color: "amber", 
                icon: TreePine,
                borderColor: "border-l-amber-500",
                bgColor: "bg-amber-50",
                textColor: "text-amber-600"
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white border border-gray-200 rounded-lg p-3 border-l-4 ${stat.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        {stat.label} Total
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {stat.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Filters */}
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-1">
                {["all", "inbound", "outbound", "opening_stock"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterType === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type === "all" ? "All" : type.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    From → To
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Date
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Creator
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && transactions.length > 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-600 text-xs">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    </td>
                  </tr>
                )}
                {filteredTransactions.map((tx) => (
                  <React.Fragment key={tx.uid}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs text-gray-900">
                        {tx.chep_id}
                      </td>
                      <td className="px-3 py-2">
                        {getTransactionTypeBadge(tx.t_type)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{tx.from_where}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{tx.to_where}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {formatDate(tx.stock_date)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-xs text-blue-700">
                        {tx.total_fb4_stock.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-xs text-emerald-700">
                        {tx.total_plastic_stock.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-xs text-amber-700">
                        {tx.total_wood_stock.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">
                        {tx.creator_id}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              setViewDetailsId(
                                viewDetailsId === tx.uid ? null : tx.uid,
                              )
                            }
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View details"
                          >
                            {viewDetailsId === tx.uid ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openWriteOffModal(tx)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Write off"
                          >
                            <FilePenLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {viewDetailsId === tx.uid && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-3 py-3">
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <div className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                Received
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">FB4:</span>
                                  <span className="font-medium">
                                    {tx.total_fb4_receive_stock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Plastic:
                                  </span>
                                  <span className="font-medium">
                                    {tx.total_plastic_receive_stock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wood:</span>
                                  <span className="font-medium">
                                    {tx.total_wood_receive_stock}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <div className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                Sent
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">FB4:</span>
                                  <span className="font-medium">
                                    {tx.total_fb4_send_stock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Plastic:
                                  </span>
                                  <span className="font-medium">
                                    {tx.total_plastic_send_stock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wood:</span>
                                  <span className="font-medium">
                                    {tx.total_wood_send_stock}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <div className="font-semibold text-gray-900 mb-2">
                                Close Stock
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">FB4:</span>
                                  <span className="font-medium">
                                    {tx.fb4_close_stock ?? "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Plastic:
                                  </span>
                                  <span className="font-medium">
                                    {tx.plastic_close_stock ?? "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wood:</span>
                                  <span className="font-medium">
                                    {tx.wood_close_stock ?? "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {tx.comment && (
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                              <div className="text-xs font-medium text-amber-900">
                                Comment:
                              </div>
                              <div className="text-xs text-amber-800 mt-0.5">
                                {tx.comment}
                              </div>
                            </div>
                          )}
                          {tx.logs && tx.logs.length > 0 && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2">
                              <div className="text-xs font-medium text-gray-900 mb-1">
                                Activity Log:
                              </div>
                              <div className="space-y-1">
                                {tx.logs.map((log, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-gray-600"
                                  >
                                    <span className="font-medium">
                                      {log.message}
                                    </span>{" "}
                                    by {log.admin} • {formatDate(log.create_at)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                No transactions found
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Compact Pagination */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="mt-3 flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
            <div className="text-xs text-gray-600">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span>-
              <span className="font-medium">
                {Math.min(page * limit, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded text-xs font-medium ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === "create" && (
        <CreateTransactionModal
          opened={true}
          onSubmit={async (data: CreateTransactionPayload) => {
            await createTransaction(data);
            handleSuccess();
          }}
          onClose={closeModal}
        />
      )}

      {modalType === "openStock" && (
        <OpenStockModal
          opened={true}
          onSubmit={async (data) => {
            const payload: OpenStockPayload = {
              fb4_stock: data.fb4_stock,
              plastic_stock: data.plastic_stock,
              wood_stock: data.wood_stock,
              stock_date: data.stock_date
                ? data.stock_date.toISOString()
                : new Date().toISOString(),
            };

            await createOpenStock(payload);
            handleSuccess();
          }}
          onClose={closeModal}
        />
      )}

      {modalType === "edit" && selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          opened={true}
          onSubmit={async (data: UpdateTransactionPayload) => {
            await updateTransaction(data);
            handleSuccess();
          }}
          onClose={closeModal}
        />
      )}

      {modalType === "writeOff" && selectedTransaction && (
        <WriteOffModal
          transaction={selectedTransaction}
          opened={true}
          onSubmit={async (data) => {
            await writeOffTransaction(data);
            handleSuccess();
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TransactionPage;
