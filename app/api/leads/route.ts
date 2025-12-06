import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { authenticate, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, ILead } from "@/types";

// GET /api/leads - Get all leads (with filters)
export const GET = authenticate(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const assignedToId = searchParams.get("assignedToId");

    const tenantId = req.user?.tenantId;

    // Build query based on role
    let query: any = { tenantId };

    // Role-based filtering
    if (req.user?.role === UserRole.EMPLOYEE) {
      // Employees only see their own leads
      query.assignedToId = req.user.userId;
    } else if (req.user?.role === UserRole.MANAGER) {
      // Managers see their team's leads + unassigned
      // This would require fetching team members first
      // For now, we'll allow managers to see all leads in their tenant
    }

    // Apply filters
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedToId) query.assignedToId = assignedToId;

    const leads = await Lead.find(query)
      .populate("assignedToId", "name email")
      .populate("createdById", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: leads,
      } as ApiResponse<ILead[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
});

// POST /api/leads - Create lead
export const POST = authenticate(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, phone, company, source, assignedToId } = body;

    // Validation
    if (!name || !email || !source) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and source are required",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const tenantId = req.user?.tenantId;
    const createdById = req.user?.userId;

    const lead = await Lead.create({
      tenantId,
      name,
      email,
      phone,
      company,
      source,
      assignedToId,
      createdById,
    });

    return NextResponse.json(
      {
        success: true,
        data: lead,
      } as ApiResponse<ILead>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
});
