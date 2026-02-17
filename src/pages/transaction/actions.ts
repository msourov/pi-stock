import { CreateTransactionPayload } from "./types";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all stocks with pagination
export const fetchStocks = async (
  token: string,
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/stock-purchase/all?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching stocks:", error);
    throw error;
  }
};

// Filter stocks by product, branch, and movement type
export const filterProductStock = async (
  token: string,
  productId: string,
  branchId?: string,
  movementType?: string,
  page: number = 1,
  size: number = 10
) => {
  try {
    let url = `${API_BASE_URL}/stock-purchase/all?page=${page}&page_size=${size}&product_id=${productId}`;
    if (branchId) url += `&branch_id=${branchId}`;
    if (movementType) url += `&movement_type=${movementType}`;

    const res = await fetch(url, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    if (!res.ok) throw new Error(`Filter fetch failed with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error filtering stocks:", error);
    throw error;
  }
};

// Update stock status (approve, receive, sale)
export const updateStockStatus = async (
  token: string,
  stockId: string,
  po_status: "approve" | "receive" | "sale",
  payload: Record<string, unknown>
) => {
  try {
    const data = {
      ...payload,
      stock_id:stockId,
      po_status: "approve"
    }
    const res = await fetch(
      `${API_BASE_URL}/stock-purchase/update_status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) throw new Error(`Update status failed with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Error updating stock status (${po_status}):`, error);
    throw error;
  }
};


// Create new stock entry
export const createStock = async (token: string, payload: CreateTransactionPayload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/stock-purchase/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Create stock failed with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error creating stock:", error);
    throw error;
  }
};
