import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { authorize, AuthRequest, ensureTenantAccess } from "@/middleware/auth";
import { UserRole, ApiResponse, IUser } from "@/types";

// GET /api/users/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.ADMIN, UserRole.MANAGER)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Ensure tenant access
      if (!ensureTenantAccess(authReq, user.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: user,
        } as ApiResponse<IUser>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Get user error:", error);
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

// PUT /api/users/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.ADMIN)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await req.json();

      const user = await User.findById(id);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Ensure tenant access
      if (!ensureTenantAccess(authReq, user.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      // Hash password if provided
      if (body.password) {
        body.password = await hashPassword(body.password);
      }

      const updatedUser = await User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      }).select("-password");

      return NextResponse.json(
        {
          success: true,
          data: updatedUser,
        } as ApiResponse<IUser>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Update user error:", error);
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

// DELETE /api/users/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authorize(UserRole.ADMIN)(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      const user = await User.findById(id);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Ensure tenant access
      if (!ensureTenantAccess(authReq, user.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      await User.findByIdAndDelete(id);

      return NextResponse.json(
        {
          success: true,
          message: "User deleted successfully",
        } as ApiResponse,
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete user error:", error);
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
