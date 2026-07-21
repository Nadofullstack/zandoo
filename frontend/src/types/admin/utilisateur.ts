import type { RoleUtilisateur, Pagination } from './common';

/* ─── Utilisateur ────────────────────────────────────────────────────────── */

export interface UtilisateurAdmin {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: RoleUtilisateur;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaireUtilisateur {
  fullName: string;
  email: string;
  phone: string;
  role: RoleUtilisateur;
  isVerified: boolean;
}

export interface StatistiquesUtilisateurs {
  total: number;
  acheteurs: number;
  vendeurs: number;
  livreurs: number;
  admins: number;
  actifs: number;
  suspendus: number;
}

export interface ReponseListeUtilisateurs {
  success: boolean;
  data: { utilisateurs: UtilisateurAdmin[]; pagination: Pagination };
}

export interface ReponseUtilisateur {
  success: boolean;
  data: { utilisateur: UtilisateurAdmin };
  message?: string;
}

export interface ReponseStatistiquesUtilisateurs {
  success: boolean;
  data: { statistiques: StatistiquesUtilisateurs };
}
