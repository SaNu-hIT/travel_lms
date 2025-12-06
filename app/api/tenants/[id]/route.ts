import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { authorize, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, ITenant } from "@/types";

// GET /api/tenants/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.SAAS_ADMIN)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      const tenant = await Tenant.findById(id);

      if (!tenant) {
        return NextResponse.json(
          {
            success: false,
            error: "Tenant not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: tenant,
        } as ApiResponse<ITenant>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Get tenant error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
  })(req as AuthRequest);
}

// PUT /api/tenants/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.SAAS_ADMIN)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await req.json();

      const tenant = await Tenant.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      if (!tenant) {
        return NextResponse.json(
          {
            success: false,
            error: "Tenant not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: tenant,
        } as ApiResponse<ITenant>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Update tenant error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
  })(req as AuthRequest);
}

// DELETE /api/tenants/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.SAAS_ADMIN)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      const tenant = await Tenant.findByIdAndDelete(id);

      if (!tenant) {
        return NextResponse.json(
          {
            success: false,
            error: "Tenant not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Tenant deleted successfully",
        } as ApiResponse,
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete tenant error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
  })(req as AuthRequest);
}
