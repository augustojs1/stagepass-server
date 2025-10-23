export type UserWithProfile = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_admin: boolean;
  avatar_url: string;
  phone_number: string;
  updated_at: string | Date;
  created_at: string | Date;
};
