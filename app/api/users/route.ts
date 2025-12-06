import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { authorize, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, IUser } from "@/types";

// GET /api/users - Get all users in tenant (or all tenants for SaaS Admin)
export const GET = authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.SAAS_ADMIN)(
  async (req: AuthRequest) => {
    try {
      await dbConnect();

      const tenantId = req.user?.tenantId;
      const { searchParams } = new URL(req.url);
      const filterTenantId = searchParams.get("tenantId");

      let query: any = {};

      // SaaS Admin can filter by tenant or view all
      if (req.user?.role === UserRole.SAAS_ADMIN) {
        if (filterTenantId) {
          query.tenantId = filterTenantId;
        }
        // else query is empty - shows all users across all tenants
      } else if (req.user?.role === UserRole.MANAGER) {
        // Manager - only show their team
        query = {
          tenantId,
          $or: [{ _id: req.user.userId }, { managerId: req.user.userId }],
        };
      } else {
        // Admin - show all users in their tenant
        query.tenantId = tenantId;
      }

      console.log("🔍 GET /api/users - Role:", req.user?.role);
      console.log("🔍 GET /api/users - User's tenantId:", tenantId);
      console.log("🔍 GET /api/users - Filter tenantId:", filterTenantId);
      console.log("🔍 GET /api/users - Query:", JSON.stringify(query));

      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

      console.log("🔍 GET /api/users - Found users:", users.length);
      console.log("🔍 GET /api/users - User tenantIds:", users.map(u => ({ name: u.name, tenantId: u.tenantId })));

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

// POST /api/users - Create user (Admin and SaaS Admin)
export const POST = authorize(UserRole.ADMIN, UserRole.SAAS_ADMIN)(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password, name, role, managerId, tenantId: requestTenantId } = body;

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

    // Determine tenant ID
    // SaaS Admin can specify tenant, others use their own tenant
    let tenantId: string;
    if (req.user?.role === UserRole.SAAS_ADMIN) {
      if (!requestTenantId) {
        return NextResponse.json(
          {
            success: false,
            error: "Tenant ID is required for SaaS Admin",
          } as ApiResponse,
          { status: 400 }
        );
      }
      tenantId = requestTenantId;
    } else {
      tenantId = req.user?.tenantId!;
    }

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
