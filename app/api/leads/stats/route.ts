import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { authenticate, AuthRequest } from "@/middleware/auth";
import { UserRole, ApiResponse, DashboardStats, LeadStatus } from "@/types";

// GET /api/leads/stats
export const GET = authenticate(async (req: AuthRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const assignedToId = searchParams.get("assignedToId");

    const tenantId = req.user?.tenantId;

    // Build query based on role
    let query: any = { tenantId };

    // Role-based filtering
    if (req.user?.role === UserRole.EMPLOYEE) {
      query.assignedToId = req.user.userId;
    } else if (assignedToId) {
      query.assignedToId = assignedToId;
    }

    // Get all leads matching query
    const leads = await Lead.find(query);

    // Calculate stats
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === LeadStatus.NEW).length;
    const contactedLeads = leads.filter(
      (l) => l.status === LeadStatus.CONTACTED || l.status === LeadStatus.INTERESTED
    ).length;
    const closedWon = leads.filter((l) => l.status === LeadStatus.CLOSED_WON).length;
    const closedLost = leads.filter((l) => l.status === LeadStatus.CLOSED_LOST).length;

    const conversionRate =
      totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(2) : "0";

    const stats: DashboardStats = {
      totalLeads,
      newLeads,
      contactedLeads,
      closedWon,
      closedLost,
      conversionRate: parseFloat(conversionRate),
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      } as ApiResponse<DashboardStats>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
});
