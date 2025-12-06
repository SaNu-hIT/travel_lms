import mongoose, { Schema, Model } from "mongoose";
import { ITenant, TenantPlan, TenantStatus } from "@/types";

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    plan: {
      type: String,
      enum: Object.values(TenantPlan),
      default: TenantPlan.FREE,
    },
    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.ACTIVE,
    },
    maxUsers: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TenantSchema.index({ name: 1 });
TenantSchema.index({ status: 1 });

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
