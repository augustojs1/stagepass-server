export class UserCreatedAndTokensDto {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_admin: boolean;
    avatar_url: string;
    phone_number: string;
    updated_at: string | Date;
    created_at: string | Date;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}
