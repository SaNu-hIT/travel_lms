"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { UserRole, IUser, ILead, DashboardStats } from "@/types";
import { userService } from "@/services/userService";
import { leadService } from "@/services/leadService";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ManagerDashboard() {
  const { user: currentUser } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<IUser[]>([]);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLeadsByEmployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, leadsRes, statsRes] = await Promise.all([
        userService.getAll(),
        leadService.getAll(),
        leadService.getStats(),
      ]);

      if (usersRes.success && usersRes.data) {
        // Filter team members (employees under this manager)
        const team = usersRes.data.filter(
          (u) => u.role === UserRole.EMPLOYEE && u.managerId === currentUser?.id
        );
        setTeamMembers(team);
      }

      if (leadsRes.success && leadsRes.data) setLeads(leadsRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadsByEmployee = async (employeeId: string) => {
    try {
      const params = employeeId !== "all" ? { assignedToId: employeeId } : {};
      const response = await leadService.getAll(params);
      if (response.success && response.data) {
        setLeads(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    }
  };

  const handleReassign = async (leadId: string, newAssigneeId: string) => {
    try {
      const response = await leadService.update(leadId, { assignedToId: newAssigneeId } as any);
      if (response.success) {
        toast({ title: "Success", description: "Lead reassigned successfully" });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reassign lead",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
      <DashboardLayout title="Manager Dashboard">
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Leads</CardTitle>
                  <CardDescription>Team total</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Leads</CardTitle>
                  <CardDescription>Requiring contact</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.newLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Closed Won</CardTitle>
                  <CardDescription>Successful conversions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.closedWon}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                  <CardDescription>Team performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team Members Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Your team overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teamMembers.map((member) => {
                  const memberLeads = leads.filter(
                    (l) => (l.assignedToId as any)?._id?.toString() === member._id.toString()
                  );
                  return (
                    <Card key={member._id.toString()}>
                      <CardHeader>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription className="text-sm">{member.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{memberLeads.length} leads</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leads Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Leads</CardTitle>
                  <CardDescription>Manage and reassign leads</CardDescription>
                </div>
                <div className="w-64">
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member._id.toString()} value={member._id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Reassign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id.toString()}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell>
                        <Badge>{lead.status}</Badge>
                      </TableCell>
                      <TableCell>{(lead.assignedToId as any)?.name || "Unassigned"}</TableCell>
                      <TableCell>
                        <Select
                          value={lead.assignedToId?.toString() || ""}
                          onValueChange={(value) => handleReassign(lead._id.toString(), value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Reassign" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member._id.toString()} value={member._id.toString()}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
