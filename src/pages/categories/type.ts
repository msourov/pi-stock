export interface CategoryOptions {
  uid: string;
  name: string;
}

export interface Category {
  uid: string;
  id: string;
  name: string;
  branch_id: string[];
  active: boolean;
  created_at?: string;
  info1?: string | null;
}

export interface BranchOption {
  value: string;
  label: string;
}