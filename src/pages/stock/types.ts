export type POStatus =
  | "completed"
  | "in_progress"
  | "approved"
  | "pending"
  | "received"
  | "saled"
  | "rejected"
  | "closed";

export interface Stock {
  uid: string;
  purchase_order: string;
  company_id: string;
  branch_id: string;
  product_id: string;
  product_name: string;
  po_status: POStatus;
  quantity: number;
  description: string;
  price: number; // cost price per unit
  selling_price?: number;
  po_need_at: string;
  create_at: string;
  company_name: string;
  branch_name: string;
  po_creator_id: string;
  po_seller_id?: string | null;
  po_reciever_id?: string | null;
  po_approval_id?: string | null;
  po_creator_name: string;
  po_seller_name?: string | null;
  po_reciever_name?: string | null;
  po_approval_name?: string | null;
}

export type MovementType = "opening" | "sale" | "purchase";

// export interface CreateStockPayload {
//   company_id: string;            
//   branch_id: string;             
//   product_id: string;            
//   movement_type: MovementType;   
//   quantity: number;              
//   reference?: string;     
//   description?: string;   
// }

export interface StockItem {
  company_id: string;
  branch_id: string;
  product_id: string;
  purchase_order: string;
  quantity: number;
  description: string;
  po_need_at: string; // ISO date string
  price: number;
  po_status: "pending" | "approved" | "rejected";
}

export interface CreateStockPayload {
  stock_history: StockItem[];
}


export interface ProductStatType {
  total_stock: number;
  total_receive_stock: number;
  total_send_stock: number;
  today_total_stock: number;
  today_total_received: number;
  today_total_sent: number;
}

export type ApprovalForm = {
  po_status: "approved";
  actual_price: number;
  selling_price: number;
  send_quantity: number;
};

export type ReceiveForm = {
  po_status: "received";
  receive_quantity: number;
};

export type SaleForm = {
  po_status: "saled";
  sale_quantity: number;
};
