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

export interface CreateTransactionPayload {
  chep_id: string;
  t_type: 'inbound' | 'outbound';
  from_where: string;
  to_where: string;
  comment?: string;
  stock_date: string;
  fb4_close_stock?: number;
  plastic_close_stock?: number;
  wood_close_stock?: number;
  total_fb4_receive_stock?: number;
  total_plastic_receive_stock?: number;
  total_wood_receive_stock?: number;
  total_fb4_send_stock?: number;
  total_plastic_send_stock?: number;
  total_wood_send_stock?: number;
}

export interface OpenStockPayload {
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
}


export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {
  uid: string;
}

// Write‑off payload (similar to create, but endpoint is different)
export type WriteOffPayload = CreateTransactionPayload;