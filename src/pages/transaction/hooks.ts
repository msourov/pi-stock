import { useCallback, useEffect, useState } from "react";
import {
  CreateTransactionPayload,
  OpenStockPayload,
  StockDetails,
  Transaction,
  UpdateTransactionPayload,
  WriteOffPayload,
} from "./types";
interface ApiResponse {
  status_code: number;
  success: boolean;
  count: number;
  data: Transaction[];
}
interface UseTransactionsProps {
  token: string | null;
  logout: () => void;
}

export const useTransactions = ({ token, logout }: UseTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [stock, setStock] = useState<StockDetails | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const STOCK_UID = "112233445566778899";

  const fetchStockStat = useCallback(async () => {
    setStockLoading(true);
    setStockError(null);
    try {
      const response = await fetch(
        `${baseUrl}/transaction/stock/admin?uid=${STOCK_UID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      if (response.status === 401) {
        logout();
        return;
      }
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to fetch stock");
      setStock(result.data);
    } catch (err) {
      setStockError(err.message);
    } finally {
      setStockLoading(false);
    }
  }, [token, baseUrl, logout]);

  const fetchTransactions = useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/transaction/all/admin?page=${page}&limit=${limit}`,
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

  const fetchTransactionDetail = async (uid: string) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${baseUrl}/transaction/detail/admin?uid=${uid}`,
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
        throw new Error("Failed to fetch transaction detail");
      }

      const data = await res.json();
      setSelectedTransaction(data.data || null);

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSelectedTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (payload: CreateTransactionPayload) => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/transaction/create/admin`, {
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
      const res = await fetch(`${baseUrl}/transaction/create/open-stock`, {
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
      const res = await fetch(`${baseUrl}/transaction/update/admin`, {
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

  const writeOffTransaction = async (payload: WriteOffPayload) => {
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

  useEffect(() => {
    if (token) {
      fetchTransactions(1, 20);
      fetchStockStat();
    }
  }, [token, fetchTransactions, fetchStockStat]);

  return {
    transactions,
    selectedTransaction,
    loading,
    error,
    totalCount,
    stock,
    stockLoading,
    stockError,
    fetchStockStat,
    fetchTransactions,
    fetchTransactionDetail,
    createTransaction,
    createOpenStock,
    updateTransaction,
    writeOffTransaction,
  };
};
