import { useCallback, useState } from "react";
export interface LogEntry {
  admin: string;
  message: string;
  create_at: string;
}

export interface Transaction {
  uid: string;
  chep_id: string;
  t_type: string;
  fb4_close_stock: number | null;
  plastic_close_stock: number | null;
  wood_close_stock: number | null;
  total_fb4_stock: number;
  total_plastic_stock: number;
  total_wood_stock: number;
  total_fb4_receive_stock: number;
  total_plastic_receive_stock: number;
  total_wood_receive_stock: number;
  total_fb4_send_stock: number;
  total_plastic_send_stock: number;
  total_wood_send_stock: number;
  total_fb4_adjustment_stock: number;
  total_plastic_adjustment_stock: number;
  total_wood_adjustment_stock: number;
  total_fb4_write_off_stock: number;
  total_plastic_write_off_stock: number;
  total_wood_write_off_stock: number;
  creator_id: string;
  from_where: string;
  to_where: string;
  comment: string | null;
  stock_date: string;
  logs: LogEntry[];
  active: boolean;
  create_at: string;
  update_at: string | null;
}

interface ApiResponse {
  status_code: number;
  success: boolean;
  count: number;
  data: Transaction[];
}

export interface CreateTransactionPayload {
  chep_id: string;
  comment?: string;
  from_where?: string;
  to_where?: string;
  t_type: string;
  fb4_stock?: number;
  plastic_stock?: number;
  wood_stock?: number;
  stock_date?: string;
}

export interface UpdateTransactionPayload {
  uid: string;
  comment?: string;
  from_where?: string;
  to_where?: string;
  t_type?: string;
  fb4_stock?: number;
  plastic_stock?: number;
  wood_stock?: number;
  stock_date?: string;
}

export interface OpenStockPayload {
  fb4_stock?: number;
  plastic_stock?: number;
  wood_stock?: number;
  stock_date?: string;
}

interface UseTransactionsProps {
  token: string | null;
  logout: () => void;
}

export const useTransactions = ({ token, logout }: UseTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchTransactions = useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/transaction/all?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.status === 401) {
          logout();
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data: ApiResponse = await res.json();
        setTransactions(data.data || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setTransactions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [token, logout, baseUrl],
  );

  const createTransaction = async (payload: CreateTransactionPayload) => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/transaction/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to create transaction");
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const createOpenStock = async (payload: OpenStockPayload) => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/transaction/create/open-stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to create open stock");
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (payload: UpdateTransactionPayload) => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/transaction/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update transaction");
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const writeOffTransaction = async (payload: CreateTransactionPayload) => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/transaction/write-off`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to write off transaction");
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    totalCount,
    fetchTransactions,
    createTransaction,
    createOpenStock,
    updateTransaction,
    writeOffTransaction,
  };
};
