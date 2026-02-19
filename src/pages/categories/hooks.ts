import { useState, useCallback } from "react";
import { useAuth } from "../../AuthProvider";
import { Category } from "./type";

interface CategoryPayload {
  name: string;
  category_type: string;
  active: boolean;
}

interface HelperParams {
  page?: number;
  page_size?: number;
  category_type?: string;
}

const useCategory = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...options.headers,
        },
      });

      if (response.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "API Error");
      return result;
    },
    [baseUrl, logout],
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/category/all");
      setCategories(data.data || []);
      return data;
    } catch (err) {
      setCategories([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const createCategory = useCallback(
    async (payload: CategoryPayload) => {
      return apiFetch("/category/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    [apiFetch],
  );

  const updateCategory = useCallback(
    async (uid: string, name: string) => {
      return apiFetch(`/category/update/${uid}`, {
        method: "PUT",
        body: JSON.stringify({ uid, name }),
      });
    },
    [apiFetch],
  );

  const deleteCategory = useCallback(
    async (uid: string) => {
      return apiFetch(`/category/delete/${uid}`, {
        method: "DELETE",
      });
    },
    [apiFetch],
  );

  const getCategoryHelperSm = useCallback(
    async (params?: HelperParams) => {
      const query = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      return apiFetch(
        `/category/category-helper-sm${query ? `?${query}` : ""}`,
      );
    },
    [apiFetch],
  );

  const getCategoryHelperSam = useCallback(
    async (params?: HelperParams) => {
      const query = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      return apiFetch(
        `/category/category-helper-sam${query ? `?${query}` : ""}`,
      );
    },
    [apiFetch],
  );

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryHelperSm,
    getCategoryHelperSam,
  };
};

export default useCategory;
