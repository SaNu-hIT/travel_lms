import { Document, Types } from "mongoose";

// User Roles
export enum UserRole {
  SAAS_ADMIN = "SAAS_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

// Lead Status
export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  NOT_INTERESTED = "NOT_INTERESTED",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

// Lead Source
export enum LeadSource {
  WEBSITE = "WEBSITE",
  REFERRAL = "REFERRAL",
  COLD_CALL = "COLD_CALL",
  EMAIL_CAMPAIGN = "EMAIL_CAMPAIGN",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  OTHER = "OTHER",
}

// Tenant Plan
export enum TenantPlan {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

// Tenant Status
export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

// ============ Mongoose Document Interfaces ============

export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  domain?: string;
  plan: TenantPlan;
  status: TenantStatus;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  managerId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeadComment {
  userId: Types.ObjectId;
  userName: string;
  comment: string;
  createdAt: Date;
}

export interface ILead extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  assignedToId?: Types.ObjectId;
  status: LeadStatus;
  source: LeadSource;

  // Lead Information
  name: string;
  email: string;
  phone?: string;
  company?: string;

  // Tracking
  followUpDate?: Date;
  comments: ILeadComment[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdById: Types.ObjectId;
}

// ============ API Response Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
  };
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  closedWon: number;
  closedLost: number;
  conversionRate: number;
}
