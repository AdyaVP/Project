// ==================== USER TYPES ====================
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== AUTH TYPES ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: Role;
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken?: string;
}

// ==================== QUERY PARAMS ====================
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

// ==================== JWT PAYLOAD ====================
export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}
