import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { authenticate, AuthRequest, ensureTenantAccess } from "@/middleware/auth";
import { UserRole, ApiResponse, ILead } from "@/types";

// GET /api/leads/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authenticate(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      const lead = await Lead.findById(id)
        .populate("assignedToId", "name email")
        .populate("createdById", "name email");

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
      if (!ensureTenantAccess(authReq, lead.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      // Employees can only access their own leads
      if (
        authReq.user?.role === UserRole.EMPLOYEE &&
        lead.assignedToId?._id?.toString() !== authReq.user.userId
      ) {
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
          data: lead,
        } as ApiResponse<ILead>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Get lead error:", error);
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

// PUT /api/leads/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authenticate(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await req.json();

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
      if (!ensureTenantAccess(authReq, lead.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      // Employees can only update their own leads (and can't reassign)
      if (authReq.user?.role === UserRole.EMPLOYEE) {
        if (lead.assignedToId?.toString() !== authReq.user.userId) {
          return NextResponse.json(
            {
              success: false,
              error: "Access denied",
            } as ApiResponse,
            { status: 403 }
          );
        }
        // Remove assignedToId from update if employee tries to change it
        delete body.assignedToId;
      }

      const updatedLead = await Lead.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedLead,
        } as ApiResponse<ILead>,
        { status: 200 }
      );
    } catch (error) {
      console.error("Update lead error:", error);
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

// DELETE /api/leads/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authenticate(async (authReq: AuthRequest) => {
    try {
      await dbConnect();
      const { id } = await params;

      // Only admins and managers can delete leads
      if (
        authReq.user?.role !== UserRole.ADMIN &&
        authReq.user?.role !== UserRole.MANAGER
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Only admins and managers can delete leads",
          } as ApiResponse,
          { status: 403 }
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
      if (!ensureTenantAccess(authReq, lead.tenantId.toString())) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied",
          } as ApiResponse,
          { status: 403 }
        );
      }

      await Lead.findByIdAndDelete(id);

      return NextResponse.json(
        {
          success: true,
          message: "Lead deleted successfully",
        } as ApiResponse,
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete lead error:", error);
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
