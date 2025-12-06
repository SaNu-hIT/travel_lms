import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { authorize, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, ITenant } from "@/types";

// GET /api/tenants - Get all tenants (SaaS Admin only)
export const GET = authorize(UserRole.SAAS_ADMIN)(
  async (req: AuthRequest) => {
    try {
      await dbConnect();

      const tenants = await Tenant.find().sort({ createdAt: -1 });

      return NextResponse.json(
        {
          success: true,
          data: tenants,
        } as ApiResponse<ITenant[]>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Get tenants error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
  }
);

// POST /api/tenants - Create tenant (SaaS Admin only)
export const POST = authorize(UserRole.SAAS_ADMIN)(
  async (req: AuthRequest) => {
    try {
      await dbConnect();

      const body = await req.json();
      const { name, domain, plan, maxUsers } = body;

      // Validation
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: "Company name is required",
          } as ApiResponse,
          { status: 400 }
        );
      }

      // Check if domain already exists
      if (domain) {
        const existing = await Tenant.findOne({ domain });
        if (existing) {
          return NextResponse.json(
            {
              success: false,
              error: "Domain already exists",
            } as ApiResponse,
            { status: 400 }
          );
        }
      }

      const tenant = await Tenant.create({
        name,
        domain,
        plan,
        maxUsers: maxUsers || 10,
      });

      return NextResponse.json(
        {
          success: true,
          data: tenant,
        } as ApiResponse<ITenant>,
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Create tenant error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
  }
);
