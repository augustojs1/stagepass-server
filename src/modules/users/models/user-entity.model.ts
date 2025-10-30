export type UserEntity = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_admin: boolean;
  refresh_token: string;
  updated_at: string | Date;
  created_at: string | Date;
};
