// auth-response.model.ts
export interface AuthResponse {
    token: string;
    username: string;
    expiresIn?: number;
  }
  
  export interface AuthRequest {
    username: string;
    password: string;
  }