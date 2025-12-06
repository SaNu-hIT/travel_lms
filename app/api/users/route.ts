import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { authorize, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, IUser } from "@/types";

// GET /api/users - Get all users in tenant
export const GET = authorize(UserRole.ADMIN, UserRole.MANAGER)(
  async (req: AuthRequest) => {
    try {
      await dbConnect();

      const tenantId = req.user?.tenantId;

      // If manager, only show their team
      let query: any = { tenantId };
      if (req.user?.role === UserRole.MANAGER) {
        query = {
          tenantId,
          $or: [{ _id: req.user.userId }, { managerId: req.user.userId }],
        };
      }

      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

      return NextResponse.json(
        {
          success: true,
          data: users,
        } as ApiResponse<IUser[]>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Get users error:", error);
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

// POST /api/users - Create user (Admin only)
export const POST = authorize(UserRole.ADMIN)(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password, name, role, managerId } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, name, and role are required",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const tenantId = req.user?.tenantId;

    // Check if user already exists in this tenant
    const existing = await User.findOne({ tenantId, email });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      tenantId,
      email,
      password: hashedPassword,
      name,
      role,
      managerId,
    });

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        data: userResponse,
      } as ApiResponse<IUser>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
});
