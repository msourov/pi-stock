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
  product_actual_cost: string;
  product_selling_price: string;
  create_at: string;
  active: boolean;
}
export type MovementType = "opening" | "sale" | "purchase";

export interface CreateStockPayload {
  company_id: string;            
  branch_id: string;             
  product_id: string;            
  movement_type: MovementType;   
  quantity: number;              
  reference?: string;     
  description?: string;   
}

export interface ProductStatType {
  total_stock: number;
  total_receive_stock: number;
  total_send_stock: number;
  today_total_stock: number;
  today_total_received: number;
  today_total_sent: number;
}
