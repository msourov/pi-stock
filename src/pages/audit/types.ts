export interface CheckStock {
  uid: string;
  description: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
  creator_id?: string;
  active?: boolean;
  create_at?: string;
  update_at?: string | null;
}

export interface CreatePayload {
  description: string;
  fb4_stock: number;
  plastic_stock: number;
  wood_stock: number;
  stock_date: string;
}

export interface StockFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePayload) => Promise<void>;
  initial?: CheckStock | null;
}

export interface UpdatePayload extends CreatePayload {
  uid: string;
}