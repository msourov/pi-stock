export interface User {
  uid: string;
  id: number;
  name: string;
  email: string;
  mobile_number: string;
  company_name: string;
  company_id: string;
  role_name: string;
  role_id: string;
  user_id: string;
  super_admin: boolean;
  active: boolean;
  logs: {
    admin: string;
    message: string;
    create_at: string;
  };
  create_at: string;
}

export interface CreateUserPayload {
  name: string;
  user_id: string;
  mobile_number: string;
  company_id: string;
  branch_id: string;
  email: string;
  password: string;
  role_id: string;
  company_admin: boolean;
  active: boolean;
}

export interface UpdateUserPayload {
  uid: string;
  name: string;
  active: boolean;
  company_id: string;
  branch_id: string;
  role: string;
  email: string;
  company_admin: boolean;
  mobile_number: string;
}

export interface UserFormData {
  name: string;
  email: string;
  mobile_number: string;
  role_id: string;
  password: string;
  confirmPassword: string;
}