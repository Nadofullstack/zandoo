export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export type RoleAuth = 'acheteur' | 'vendeur' | 'livreur' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: RoleAuth;
  /** True si l'utilisateur possède aussi une boutique approuvée (double rôle acheteur + vendeur) */
  estVendeur?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    /** Le jeton n'est plus renvoyé : il vit uniquement dans le cookie httpOnly */
    user: AuthUser;
  };
  errors?: { field: string; message: string }[];
}

export interface ApiError {
  field?: string;
  message: string;
}
