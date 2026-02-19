import { Transaction } from "../pages/transaction/types";

export const getTransactionTypeBadge = (type: string) => {
  const badges: Record<string, { bg: string; text: string }> = {
    inbound: { bg: "bg-emerald-100", text: "text-emerald-700" },
    outbound: { bg: "bg-rose-100", text: "text-rose-700" },
    opening_stock: { bg: "bg-amber-100", text: "text-amber-700" },
    adjustment: { bg: "bg-blue-100", text: "text-blue-700" },
    write_off: { bg: "bg-slate-100", text: "text-slate-700" },
  };

  const badge = badges[type] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <span
      className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded text-xs font-medium`}
    >
      {type.replace("_", " ")}
    </span>
  );
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const filterTransactions = (
  transactions: Transaction[],
  filterType: string,
  searchTerm: string,
) => {
  return transactions.filter((t) => {
    const matchesType = filterType === "all" || t.t_type === filterType;

    const matchesSearch =
      searchTerm === "" ||
      t.chep_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.from_where.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.to_where.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });
};
