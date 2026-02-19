export interface CategoryOptions {
  uid: string;
  name: string;
}

export interface Category {
  uid: string;
  name: string;
  category_type: "from_where" | "to_where";
  active: boolean;
}
export interface UpdateCategory {
  uid: string;
  name: string;
  category_type: string;
  active: boolean;
}
