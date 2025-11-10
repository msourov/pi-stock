import { useState, useEffect } from "react";
import { Stock } from "./types";
import { notifications } from "@mantine/notifications";

interface UseStockPageProps {
  token: string;
  companyId: string;
  logout: () => void;
  opened: boolean;
  isAdmin: boolean;
  userBranchId: string;
}

export const useStockPage = ({ 
  token, 
  companyId, 
  logout, 
  opened,
  isAdmin,
  userBranchId 
}: UseStockPageProps) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<{ uid: string; name: string }[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchPO, setSearchPO] = useState<string>("");

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    page_size: 10,
    total_results: 0,
    total_page: 0,
  });

  console.log(companyId, 'companyId')

  // Fetch all stocks
  const fetchStocks = async (page: number = 1, size: number = pageSize) => {
    setLoadingTable(true);
    try {
      const url = `${
        import.meta.env.VITE_API_BASE_URL
      }/stock-purchase/all?page=${page}&page_size=${size}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const stocksData = data?.data || [];
        setStocks(stocksData);
        setFilteredStocks(stocksData);
        setPaginationData({
          page: data?.page || 1,
          page_size: data?.page_size || size,
          total_results: data?.total_results || stocksData.length,
          total_page: data?.total_page || 1,
        });
      } else if (res.status === 401) {
        logout();
        notifications.show({
          title: "Error",
          message: "Session expired. Please login again.",
          color: "red",
        });
      } else {
        console.error("Fetch failed with status:", res.status);
        setStocks([]);
        setFilteredStocks([]);
        notifications.show({
          title: "Error",
          message: "Failed to load stocks",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks([]);
      setFilteredStocks([]);
      notifications.show({
        title: "Error",
        message: "Network error while loading stocks",
        color: "red",
      });
    } finally {
      setLoadingTable(false);
    }
  };

  // Filter stocks with available query parameters
  const filterProductStock = async (
    filters: {
      product_id?: string;
      branch_id?: string;
      po_status?: string;
      start_date?: string;
      end_date?: string;
      po_number?: string;
    },
    page: number = 1,
    size: number = pageSize
  ) => {
    setFilterLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: size.toString(),
      });

      // Only add filters that have values
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.branch_id) params.append('branch_id', filters.branch_id);
      if (filters.po_status) params.append('po_status', filters.po_status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.po_number) params.append('po_number', filters.po_number);

      const url = `${
        import.meta.env.VITE_API_BASE_URL
      }/stock-purchase/all?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const filteredData = data?.data || [];
        setFilteredStocks(filteredData);
        setPaginationData({
          page: data?.page || 1,
          page_size: data?.page_size || size,
          total_results: data?.total_results || filteredData.length,
          total_page: data?.total_page || 1,
        });
        
        notifications.show({
          title: "Success",
          message: `Found ${filteredData.length} records`,
          color: "green",
        });
      } else if (res.status === 401) {
        logout();
      } else {
        console.error("Filter fetch failed:", res.status);
        setFilteredStocks([]);
        notifications.show({
          title: "Error",
          message: "Failed to filter stocks",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error filtering stocks:", error);
      setFilteredStocks([]);
      notifications.show({
        title: "Error",
        message: "Network error while filtering stocks",
        color: "red",
      });
    } finally {
      setFilterLoading(false);
    }
  };

  // Handle filter with all parameters
  const handleFilter = (page: number = 1, size: number = pageSize) => {
    const filters = {
      product_id: selectedProduct || undefined,
      branch_id: selectedBranch || (!isAdmin ? userBranchId : undefined),
      po_status: selectedStatus || undefined,
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
      po_number: searchPO || undefined,
    };

    // Check if we have any active filters
    const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

    if (hasActiveFilters) {
      filterProductStock(filters, page, size);
    } else {
      // If no filters, fetch all stocks
      fetchStocks(page, size);
    }
  };

  // Reset all filters
  const handleResetFilter = () => {
    setSelectedProduct(null);
    setSelectedBranch(null);
    setSelectedStatus(null);
    setStartDate(null);
    setEndDate(null);
    setSearchPO("");
    setSearchTerm("");
    fetchStocks(1, pageSize);
    
    notifications.show({
      title: "Success",
      message: "Filters reset",
      color: "blue",
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    handleFilter(page, pageSize);
  };

  const handlePageSizeChange = (value: string | number) => {
    const newSize = Math.max(5, Math.min(100, Number(value)));
    setPageSize(newSize);
    handleFilter(1, newSize);
  };

  // Fetch product options
  const fetchProductionOptions = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/product/product-helper-sam`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProductOptions(data?.data || []);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load products",
        color: "red",
      });
    }
  };

  // Client-side search for better UX
  useEffect(() => {
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = stocks.filter(
        (stock) =>
          stock.product_name?.toLowerCase().includes(lowerSearchTerm) ||
          stock.purchase_order?.toLowerCase().includes(lowerSearchTerm) ||
          stock.po_status?.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredStocks(filtered);
    } else {
      // If no search term, show the current filtered stocks from server
      setFilteredStocks(stocks);
    }
  }, [searchTerm, stocks]);

  // Initial data fetch
  useEffect(() => {
    fetchStocks(1, pageSize);
    fetchProductionOptions();
  }, []);

  // Refresh product options when modal opens/closes
  useEffect(() => {
    fetchProductionOptions();
  }, [opened]);

  return {
    // State
    stocks,
    filteredStocks,
    loadingTable,
    filterLoading,
    productOptions,
    paginationData,
    pageSize,
    searchTerm,
    selectedProduct,
    selectedBranch,
    selectedStatus,
    startDate,
    endDate,
    searchPO,
    
    // Setters
    setSearchTerm,
    setSelectedProduct,
    setSelectedBranch,
    setSelectedStatus,
    setStartDate,
    setEndDate,
    setSearchPO,
    
    // Functions
    fetchStocks,
    handleFilter,
    handleResetFilter,
    handlePageChange,
    handlePageSizeChange,
  };
};