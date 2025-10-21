export type UserEntity = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  updated_at: string | Date;
  created_at: string | Date;
};
