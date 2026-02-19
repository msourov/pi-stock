import React, { useEffect, useState } from "react";
import {
  Transaction,
  CreateTransactionPayload,
  OpenStockPayload,
  WriteOffPayload,
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
} from "lucide-react";
import CreateTransactionModal from "./components/CreateTransactionModal";
import OpenStockModal from "./components/OpenStockModal";
import EditTransactionModal from "./components/EditTransactionModal";
import { useTransactions } from "./hooks";
import { useAuth } from "../../AuthProvider";
import WriteOffModal from "./components/WriteOffModal";
import TransactionDetailPage from "./TransactionDetailPage";
import { StockSummaryCard } from "./components/StockSummaryCard";
import {
  getTransactionTypeBadge,
  formatDate,
  filterTransactions,
} from "../../utils/transactionUtils";

type ModalType = "create" | "openStock" | "edit" | "writeOff" | null;

const TransactionPage = () => {
  const token = localStorage.getItem("token");
  const { logout } = useAuth();

  const {
    transactions,
    loading,
    error,
    totalCount,
    stock,
    stockLoading,
    stockError,
    fetchStockStat,
    fetchTransactions,
    createTransaction,
    createOpenStock,
    updateTransaction,
    writeOffTransaction,
  } = useTransactions({ token, logout });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [detailUid, setDetailUid] = useState<string | null>(null);

  // Sync page input with page state
  useEffect(() => {
    setPageInputValue(String(page));
  }, [page]);

  useEffect(() => {
    if (token) {
      fetchTransactions(page, limit);
    }
  }, [page, limit, token, fetchTransactions]);

  // Hide opening stock button if any opening_stock transaction already exists
  const hasOpeningStock = transactions.some(
    (t) => t.t_type === "opening_stock",
  );

  const filteredTransactions = filterTransactions(
    transactions,
    filterType,
    searchTerm,
  ).filter((t) => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(t.stock_date);
    if (startDate && txDate < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }
    return true;
  });

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

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = parseInt(pageInputValue, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setPage(val);
      } else {
        setPageInputValue(String(page));
      }
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit);

  // Render the flow cell based on transaction type
  const renderFlow = (tx: Transaction) => {
    const { t_type, from_where, to_where } = tx;

    if (t_type === "inbound") {
      // EP always on left: EP ← from_where
      return (
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {to_where}
          </span>
          <span className="text-emerald-500 font-bold">←</span>
          <span className="text-gray-600">{from_where}</span>
        </div>
      );
    }

    if (t_type === "outbound") {
      // EP always on left: EP → to_where
      return (
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
            {from_where}
          </span>
          <span className="text-rose-500 font-bold">→</span>
          <span className="text-gray-600">{to_where}</span>
        </div>
      );
    }

    // adjustment / opening_stock / write_off — neutral display
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="font-medium text-gray-600">{from_where}</span>
        <span className="text-gray-400">↔</span>
        <span className="font-medium text-gray-600">{to_where}</span>
      </div>
    );
  };

  if (detailUid) {
    return (
      <>
        <TransactionDetailPage
          uid={detailUid}
          token={token}
          logout={logout}
          onBack={() => setDetailUid(null)}
          onEdit={(tx) => {
            setDetailUid(null);
            openEditModal(tx);
          }}
          onWriteOff={(tx) => {
            setDetailUid(null);
            openWriteOffModal(tx);
          }}
        />
        {modalType === "edit" && selectedTransaction && (
          <EditTransactionModal
            transaction={selectedTransaction}
            opened={true}
            onSubmit={async (data) => {
              const fixedData = {
                ...data,
                t_type: data.t_type as
                  | "inbound"
                  | "outbound"
                  | "adjustment_inbound"
                  | "adjustment_outbound",
              };
              await updateTransaction(fixedData);
              handleSuccess();
            }}
            onClose={closeModal}
          />
        )}
        {modalType === "writeOff" && selectedTransaction && (
          <WriteOffModal
            transaction={selectedTransaction}
            opened={true}
            onSubmit={async (data: WriteOffPayload) => {
              await writeOffTransaction(data);
              handleSuccess();
            }}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

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
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="max-w-[1600px] mx-auto">
        <div className="mb-3">
          {/* Header */}
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
              {/* Hide Opening button if an opening_stock transaction already exists */}
              {!hasOpeningStock && (
                <button
                  onClick={openOpenStockModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Opening
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Error */}
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

          <StockSummaryCard
            stock={stock}
            loading={stockLoading}
            error={stockError}
            onRefresh={fetchStockStat}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 mb-3">
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="flex-1 min-w-[180px] relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date range */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500 whitespace-nowrap">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-xs text-gray-500 whitespace-nowrap">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1"
                    title="Clear dates"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Type filter buttons */}
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

        {/* Table */}
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
                    Flow
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
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setDetailUid(tx.uid)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-900">
                        {tx.chep_id}
                      </td>
                      <td className="px-3 py-2">
                        {getTransactionTypeBadge(tx.t_type)}
                      </td>
                      <td className="px-3 py-2">{renderFlow(tx)}</td>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewDetailsId(
                                viewDetailsId === tx.uid ? null : tx.uid,
                              );
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(tx);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWriteOffModal(tx);
                            }}
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

        {/* Pagination */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="mt-3 flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200 flex-wrap gap-2">
            {/* Left: count info + rows per page */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span>–
                <span className="font-medium">
                  {Math.min(page * limit, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Rows:</label>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="border border-gray-300 rounded-md px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: page controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                title="First page"
              >
                «
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered pages */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
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
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                title="Last page"
              >
                »
              </button>

              {/* Direct page jump */}
              <div className="flex items-center gap-1 ml-2">
                <label className="text-xs text-gray-500">Go to</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onKeyDown={handlePageInput}
                  className="w-12 border border-gray-300 rounded-md px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Type a page number and press Enter"
                />
              </div>
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
          onSubmit={async (data) => {
            const fixedData = {
              ...data,
              t_type: data.t_type as
                | "inbound"
                | "outbound"
                | "adjustment_inbound"
                | "adjustment_outbound",
            };
            await updateTransaction(fixedData);
            handleSuccess();
          }}
          onClose={closeModal}
        />
      )}

      {modalType === "writeOff" && selectedTransaction && (
        <WriteOffModal
          transaction={selectedTransaction}
          opened={true}
          onSubmit={async (data: WriteOffPayload) => {
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
