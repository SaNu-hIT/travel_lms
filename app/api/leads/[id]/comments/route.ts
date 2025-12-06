import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { authenticate, AuthRequest, ensureTenantAccess } from "@/middleware/auth";
import { ApiResponse, ILead } from "@/types";

// POST /api/leads/:id/comments
async function handler(req: AuthRequest, params: Promise<{ id: string }>) {
  try {
    await dbConnect();
    const { id } = await params;
    const { comment } = await req.json();

      if (!comment || comment.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Comment is required",
          } as ApiResponse,
          { status: 400 }
        );
      }

      const lead = await Lead.findById(id);

      if (!lead) {
        return NextResponse.json(
          {
            success: false,
            error: "Lead not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Ensure tenant access
      if (!ensureTenantAccess(req, lead.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      // Get user name
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          } as ApiResponse,
          { status: 404 }
        );
      }

      // Add comment
      lead.comments.push({
        userId: user._id,
        userName: user.name,
        comment: comment.trim(),
        createdAt: new Date(),
      });

      await lead.save();

      return NextResponse.json(
        {
          success: true,
          data: lead,
        } as ApiResponse<ILead>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Add comment error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ApiResponse,
        { status: 500 }
      );
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return authenticate((authReq: AuthRequest) => handler(authReq, params))(req as AuthRequest);
}
