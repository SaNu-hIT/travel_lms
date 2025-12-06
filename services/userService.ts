import axiosInstance from "@/lib/axios";
import { ApiResponse, IUser } from "@/types";

export const userService = {
  /**
   * Get all users in tenant
   * @param queryParams Optional query parameters (e.g., "?tenantId=xxx")
   */
  async getAll(queryParams?: string): Promise<ApiResponse<IUser[]>> {
    const url = queryParams ? `/users${queryParams}` : "/users";
    const response = await axiosInstance.get<ApiResponse<IUser[]>>(url);
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<ApiResponse<IUser>> {
    const response = await axiosInstance.get<ApiResponse<IUser>>(
      `/users/${id}`
    );
    return response.data;
  },

  /**
   * Create user (Admin only)
   */
  async create(data: Partial<IUser>): Promise<ApiResponse<IUser>> {
    const response = await axiosInstance.post<ApiResponse<IUser>>(
      "/users",
      data
    );
    return response.data;
  },

  /**
   * Update user
   */
  async update(id: string, data: Partial<IUser>): Promise<ApiResponse<IUser>> {
    const response = await axiosInstance.put<ApiResponse<IUser>>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get users by manager
   */
  async getByManager(managerId: string): Promise<ApiResponse<IUser[]>> {
    const response = await axiosInstance.get<ApiResponse<IUser[]>>(
      `/users/manager/${managerId}`
    );
    return response.data;
  },
};
