import React, { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { CheckStock, CreatePayload } from "./types";
import { CheckStockDetail } from "./components/ChepCheckDetail";
import { DeleteModal } from "./components/ChepDeleteModal";
import { StockFormModal } from "./components/ChepUpdateModal";
import useChepAudit from "./hooks";

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CheckChepPage: React.FC = () => {
  const {
    getAudits,
    items,
    totalCount,
    loading,
    createAudit,
    updateAudit,
    deleteAudit,
  } = useChepAudit();

  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [detailUid, setDetailUid] = useState<string | null>(null);

  // Modal state
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<CheckStock | null>(null);
  const isEdit = !!selectedItem && formOpened;

  useEffect(() => {
    getAudits(page, limit);
  }, [page, getAudits]);

  const handleCreate = async (payload: CreatePayload) => {
    try {
      const result = await createAudit(payload);
      if (result.success) {
        notifications.show({
          title: "Created",
          message: result.message || "Stock check created.",
          icon: <IconCheck />,
          color: "teal",
        });
        closeForm();
        await getAudits(page, limit);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to create.",
        icon: <IconX />,
        color: "red",
      });
    }
  };

  const handleUpdate = async (payload: CreatePayload) => {
    if (!selectedItem) return;
    try {
      const result = await updateAudit({ uid: selectedItem.uid, ...payload });
      if (result.success) {
        notifications.show({
          title: "Updated",
          message: result.message || "Stock check updated.",
          icon: <IconCheck />,
          color: "teal",
        });
        closeForm();
        setSelectedItem(null);
        await getAudits(page, limit);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to update.",
        icon: <IconX />,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const result = await deleteAudit(selectedItem.uid);
      if (result.success || result) {
        // handle different API response shapes
        notifications.show({
          title: "Deleted",
          message: result.message || "Stock check deleted.",
          icon: <IconCheck />,
          color: "teal",
        });
        closeDelete();
        setSelectedItem(null);
        await getAudits(page, limit);
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to delete.",
        icon: <IconX />,
        color: "red",
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  if (detailUid) {
    return (
      <>
        <CheckStockDetail
          uid={detailUid}
          onBack={() => setDetailUid(null)}
          onEdit={(item) => {
            setDetailUid(null);
            setSelectedItem(item);
            openForm();
          }}
          onDelete={(item) => {
            setDetailUid(null);
            setSelectedItem(item);
            openDelete();
          }}
        />
        <DeleteModal
          opened={deleteOpened}
          onClose={() => {
            closeDelete();
            setSelectedItem(null);
          }}
          onConfirm={handleDelete}
          item={selectedItem}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              Stock Audit
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Physical stock check records against system values
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => getAudits(page, limit)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-200"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => {
                setSelectedItem(null);
                openForm();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              New Check
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-red-900 text-sm">
                Error loading records
              </div>
              <div className="text-red-700 text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Description
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-sm text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {loading && items.length > 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr
                    key={item.uid}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setDetailUid(item.uid)}
                  >
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {formatDate(item.stock_date)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-blue-700">
                      {item.fb4_stock.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-emerald-700">
                      {item.plastic_stock.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-amber-700">
                      {item.wood_stock.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            openForm();
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            openDelete();
                          }}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center">
                      <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        No stock checks yet
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Create your first stock audit entry
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="mt-3 flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
            <div className="text-xs text-gray-600">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span>–
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pn: number;
                if (totalPages <= 5) pn = i + 1;
                else if (page <= 3) pn = i + 1;
                else if (page >= totalPages - 2) pn = totalPages - 4 + i;
                else pn = page - 2 + i;
                return (
                  <button
                    key={pn}
                    onClick={() => setPage(pn)}
                    className={`w-7 h-7 rounded text-xs font-medium ${page === pn ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {pn}
                  </button>
                );
              })}
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

      {/* Create / Edit modal */}
      <StockFormModal
        opened={formOpened}
        onClose={() => {
          closeForm();
          setSelectedItem(null);
        }}
        onSubmit={isEdit ? handleUpdate : handleCreate}
        initial={isEdit ? selectedItem : null}
      />

      {/* Delete modal */}
      <DeleteModal
        opened={deleteOpened}
        onClose={() => {
          closeDelete();
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        item={selectedItem}
      />
    </div>
  );
};

export default CheckChepPage;
