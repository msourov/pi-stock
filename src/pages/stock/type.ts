export interface Stock {
  uid: string;
  product_id: string;
  product_name: string;
  company_id: string;
  company_name: string;
  branch_id: string;
  branch_name: string;
  quantity: number;
  movement_type: "opening" | "in" | "out" | string;
  movement_status: "pending" | "approved" | "rejected" | null;
  movement_at: string;
  opening_stock: number;
  closing_stock: number;
  reference: string;
  description: string;
  price: number;
  create_at: string;
  active: boolean;
}
export type MovementType = "opening" | "in" | "out";

export interface CreateStockPayload {
  company_id: string;            // mandatory
  branch_id: string;             // mandatory
  product_id: string;            // mandatory
  movement_type: MovementType;   // mandatory
  quantity: number;              // mandatory
  reference?: string;            // optional
  description?: string;          // optional
}