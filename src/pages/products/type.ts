export interface ApiResponse {
  status_code: number;
  success: boolean;
  data: Product[];
}

export interface Product {
  id: number;
  serial_number: string;
  purchase_uom: string;
  reference: string | null;
  avg_cost: number | null;
  name: string;
  department: string | null;
  sale_uom: string | null;
  tax_rate_pct: number | null;
  tax_inclusive: boolean;
  description: string | null;
  active: boolean;
  barcode: string | null;
  extra_info: string | null;
  logs: ProductLog;
  product_id: string;
  info1: string | null;
  other_barcodes: string | null;
  reorder_point_base: number;
  attributes: string | null;
  category: string | null;
  info2: string | null;
  unit_cost: number | null;
  reorder_qty_base: number;
  exprie_at: string; // ISO timestamp
  company_id: string;
  is_iamge: string | null; // likely a file extension like 'png'
  actual_cost: number | null;
  lead_time_days: number | null;
  create_at: string; // ISO timestamp
  brand_name: string | null;
  base_uom: string | null;
  selling_price: number | null;
  costing_method: "fifo" | "lifo" | "average" | string;
  update_at: string; // ISO timestamp
  uid: string;
  branch_id: string[];
  batch_no: string | null;
  last_purchase_cost: number | null;
}

export interface CreateProductPayload {
  name: string;
  company_id: string;
  base_uom: string;
  description?: string;
  category?: string;
  brand_name: string;
  serial_number?: string;
  model_number?:string;
}


export interface ProductLog {
  admin: string;
  message: string;
  create_at: string;
}

export interface Category {
  id: string;
  name: string;
  company_id: string;
  branch_id: string;
  active: boolean;
  description?: string;
  created_at?: string;
}

export interface CreateCategoryPayload {
  name: string;
  company_id: string;
  branch_id: string[];
  active: boolean;
}