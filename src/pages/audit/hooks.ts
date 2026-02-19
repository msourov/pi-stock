import { useCallback, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { CheckStock } from "./types";

interface ChepAuditPayload {
  description: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
}

interface ChepAuditUpdatePayload extends ChepAuditPayload {
  uid: string;
}

const useChepAudit = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CheckStock[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  // 1. Fetch All
  const getAudits = useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/check_chep/all/admin?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          },
        );

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) throw new Error("Failed to load stock checks");

        const data = await response.json();
        setItems(data.data || []);
        setTotalCount(data.total || data.count || 0);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error(`API Error`, errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, logout, baseUrl],
  );

  // 1. Create Check Stock
  const createAudit = async (payload: ChepAuditPayload) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/check_chep/check-stock/create/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.access_token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to create audit");
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`API Error`, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Check Stock
  const updateAudit = async (payload: ChepAuditUpdatePayload) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/check_chep/check-stock/update/admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.access_token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to update audit");
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  // 3. Get Details
  const getAuditDetails = async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/check_chep/check-stock/admin/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch details");
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Check Stock
  const deleteAudit = async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/check_chep/delete/${uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete audit");
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    items,
    totalCount,
    getAudits,
    createAudit,
    updateAudit,
    getAuditDetails,
    deleteAudit,
  };
};

export default useChepAudit;
