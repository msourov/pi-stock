export interface Branch {
  uid: string;
  id: number;
  name: string;
  code: string;
  team: string;
  location: string;
  zone_code: string;
  zone_name: string;
  sub_zone_code: string;
  sub_zone_name: string;
  active: boolean;
  company_id: string;
  company_name: string;
  logs: {
    admin: string;
    message: string;
    create_at: string;
  };
  create_at: string;
}

export interface CreateBranchPayload {
  company_id: string;
  name: string;
  code: string;
  team: string;
  zone_code: string;
  zone_name: string;
  sub_zone_code: string;
  sub_zone_name: string;
  location: string;
}

export interface UpdateBranchPayload extends CreateBranchPayload {
  uid: string;
}