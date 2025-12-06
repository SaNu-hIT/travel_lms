"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { UserRole, ILead, DashboardStats, LeadStatus } from "@/types";
import { leadService } from "@/services/leadService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Lead update form
  const [leadUpdate, setLeadUpdate] = useState({
    status: LeadStatus.NEW,
    followUpDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [leadsRes, statsRes] = await Promise.all([
        leadService.getAll(),
        leadService.getStats(),
      ]);

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

  const handleOpenLeadDialog = (lead: ILead) => {
    setSelectedLead(lead);
    setLeadUpdate({
      status: lead.status,
      followUpDate: lead.followUpDate ? format(new Date(lead.followUpDate), "yyyy-MM-dd") : "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await leadService.update(selectedLead._id.toString(), leadUpdate as any);
      if (response.success) {
        toast({ title: "Success", description: "Lead updated successfully" });
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedLead || !comment.trim()) return;

    try {
      const response = await leadService.addComment(selectedLead._id.toString(), comment);
      if (response.success) {
        toast({ title: "Success", description: "Comment added" });
        setComment("");
        // Refresh selected lead
        const updatedLead = await leadService.getById(selectedLead._id.toString());
        if (updatedLead.success && updatedLead.data) {
          setSelectedLead(updatedLead.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: "bg-blue-500",
      [LeadStatus.CONTACTED]: "bg-yellow-500",
      [LeadStatus.INTERESTED]: "bg-purple-500",
      [LeadStatus.NOT_INTERESTED]: "bg-gray-500",
      [LeadStatus.CLOSED_WON]: "bg-green-500",
      [LeadStatus.CLOSED_LOST]: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
      <DashboardLayout title="Employee Dashboard">
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Leads</CardTitle>
                  <CardDescription>Total assigned</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New</CardTitle>
                  <CardDescription>Needs attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.newLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Closed Won</CardTitle>
                  <CardDescription>Successful</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.closedWon}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                  <CardDescription>Your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Work Area */}
          <Card>
            <CardHeader>
              <CardTitle>My Work Area</CardTitle>
              <CardDescription>Your assigned leads</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id.toString()}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell>{lead.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {lead.followUpDate
                          ? format(new Date(lead.followUpDate), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLeadDialog(lead)}
                        >
                          View/Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lead Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lead Details - {selectedLead?.name}</DialogTitle>
                <DialogDescription>{selectedLead?.email}</DialogDescription>
              </DialogHeader>

              {selectedLead && (
                <div className="space-y-6">
                  {/* Lead Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Company</Label>
                      <p className="font-medium">{selectedLead.company || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <p className="font-medium">{selectedLead.phone || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Source</Label>
                      <p className="font-medium">{selectedLead.source}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Created</Label>
                      <p className="font-medium">
                        {format(new Date(selectedLead.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Update Form */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Update Lead</h3>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={leadUpdate.status}
                        onValueChange={(value) =>
                          setLeadUpdate({ ...leadUpdate, status: value as LeadStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(LeadStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={leadUpdate.followUpDate}
                        onChange={(e) =>
                          setLeadUpdate({ ...leadUpdate, followUpDate: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleUpdateLead} className="w-full">
                      Update Lead
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Comments</h3>

                    {/* Existing Comments */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedLead.comments && selectedLead.comments.length > 0 ? (
                        selectedLead.comments.map((c, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">{c.userName}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(c.createdAt), "MMM dd, hh:mm a")}
                              </span>
                            </div>
                            <p className="text-sm">{c.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No comments yet</p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Label>Add Comment</Label>
                      <Textarea
                        placeholder="Enter your comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} variant="secondary" size="sm">
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
