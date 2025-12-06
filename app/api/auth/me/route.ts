import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticate, AuthRequest } from "@/middleware/auth";
import { ApiResponse } from "@/types";

export const GET = authenticate(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const user = await User.findById(req.user?.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId.toString(),
          isActive: user.isActive,
        },
      } as ApiResponse,
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
});
