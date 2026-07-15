export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: AuthUser;
  };
  errors?: { field: string; message: string }[];
}

export interface ApiError {
  field?: string;
  message: string;
}
