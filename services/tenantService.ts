import axiosInstance from "@/lib/axios";
import { ApiResponse, ITenant } from "@/types";

export const tenantService = {
  /**
   * Get all tenants (SaaS Admin only)
   */
  async getAll(): Promise<ApiResponse<ITenant[]>> {
    const response = await axiosInstance.get<ApiResponse<ITenant[]>>(
      "/tenants"
    );
    return response.data;
  },

  /**
   * Get tenant by ID
   */
  async getById(id: string): Promise<ApiResponse<ITenant>> {
    const response = await axiosInstance.get<ApiResponse<ITenant>>(
      `/tenants/${id}`
    );
    return response.data;
  },

  /**
   * Create tenant (SaaS Admin only)
   */
  async create(data: Partial<ITenant>): Promise<ApiResponse<ITenant>> {
    const response = await axiosInstance.post<ApiResponse<ITenant>>(
      "/tenants",
      data
    );
    return response.data;
  },

  /**
   * Update tenant
   */
  async update(
    id: string,
    data: Partial<ITenant>
  ): Promise<ApiResponse<ITenant>> {
    const response = await axiosInstance.put<ApiResponse<ITenant>>(
      `/tenants/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete tenant
   */
  async delete(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(`/tenants/${id}`);
    return response.data;
  },
};
