import axiosInstance from "@/lib/axios";
import { ApiResponse, LoginResponse } from "@/types";

export const authService = {
  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      { email, password }
    );
    return response.data;
  },

  /**
   * Get current user
   */
  async me(): Promise<ApiResponse> {
    const response = await axiosInstance.get<ApiResponse>("/auth/me");
    return response.data;
  },

  /**
   * Logout (client-side only)
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};
