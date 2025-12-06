import axiosInstance from "@/lib/axios";
import { ApiResponse, ILead, DashboardStats } from "@/types";

export const leadService = {
  /**
   * Get all leads (with filters)
   */
  async getAll(params?: Record<string, any>): Promise<ApiResponse<ILead[]>> {
    const response = await axiosInstance.get<ApiResponse<ILead[]>>("/leads", {
      params,
    });
    return response.data;
  },

  /**
   * Get lead by ID
   */
  async getById(id: string): Promise<ApiResponse<ILead>> {
    const response = await axiosInstance.get<ApiResponse<ILead>>(
      `/leads/${id}`
    );
    return response.data;
  },

  /**
   * Create lead
   */
  async create(data: Partial<ILead>): Promise<ApiResponse<ILead>> {
    const response = await axiosInstance.post<ApiResponse<ILead>>(
      "/leads",
      data
    );
    return response.data;
  },

  /**
   * Update lead
   */
  async update(id: string, data: Partial<ILead>): Promise<ApiResponse<ILead>> {
    const response = await axiosInstance.put<ApiResponse<ILead>>(
      `/leads/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete lead
   */
  async delete(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(`/leads/${id}`);
    return response.data;
  },

  /**
   * Add comment to lead
   */
  async addComment(
    id: string,
    comment: string
  ): Promise<ApiResponse<ILead>> {
    const response = await axiosInstance.post<ApiResponse<ILead>>(
      `/leads/${id}/comments`,
      { comment }
    );
    return response.data;
  },

  /**
   * Assign lead to user
   */
  async assign(
    id: string,
    assignedToId: string
  ): Promise<ApiResponse<ILead>> {
    const response = await axiosInstance.patch<ApiResponse<ILead>>(
      `/leads/${id}/assign`,
      { assignedToId }
    );
    return response.data;
  },

  /**
   * Bulk assign leads
   */
  async bulkAssign(
    leadIds: string[],
    assignedToId: string
  ): Promise<ApiResponse> {
    const response = await axiosInstance.post<ApiResponse>("/leads/bulk-assign", {
      leadIds,
      assignedToId,
    });
    return response.data;
  },

  /**
   * Import leads from CSV
   */
  async importCSV(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<ApiResponse>(
      "/leads/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Get dashboard stats
   */
  async getStats(params?: Record<string, any>): Promise<ApiResponse<DashboardStats>> {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      "/leads/stats",
      { params }
    );
    return response.data;
  },
};
