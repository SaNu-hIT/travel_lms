"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { UserRole, IUser, ILead, DashboardStats } from "@/types";
import { userService } from "@/services/userService";
import { leadService } from "@/services/leadService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LeadSource } from "@/types";

export default function CompanyAdminDashboard() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const { toast } = useToast();

  // User form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.EMPLOYEE,
    managerId: "",
  });

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: LeadSource.WEBSITE,
    assignedToId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, leadsRes, statsRes] = await Promise.all([
        userService.getAll(),
        leadService.getAll(),
        leadService.getStats(),
      ]);

      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userService.create(userForm as any);
      if (response.success) {
        toast({ title: "Success", description: "User created successfully" });
        setIsUserDialogOpen(false);
        setUserForm({ name: "", email: "", password: "", role: UserRole.EMPLOYEE, managerId: "" });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await leadService.create(leadForm as any);
      if (response.success) {
        toast({ title: "Success", description: "Lead created successfully" });
        setIsLeadDialogOpen(false);
        setLeadForm({ name: "", email: "", phone: "", company: "", source: LeadSource.WEBSITE, assignedToId: "" });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const managers = users.filter((u) => u.role === UserRole.MANAGER);
  const employees = users.filter((u) => u.role === UserRole.EMPLOYEE);

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <DashboardLayout title="Company Admin Dashboard">
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.newLeads}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Closed Won</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.closedWon}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage managers and employees</CardDescription>
                    </div>
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Add User</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>Add a new manager or employee</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={userForm.name}
                              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                              id="password"
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                              value={userForm.role}
                              onValueChange={(value) => setUserForm({ ...userForm, role: value as UserRole })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                                <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {userForm.role === UserRole.EMPLOYEE && (
                            <div className="space-y-2">
                              <Label htmlFor="managerId">Manager</Label>
                              <Select
                                value={userForm.managerId}
                                onValueChange={(value) => setUserForm({ ...userForm, managerId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                  {managers.map((mgr) => (
                                    <SelectItem key={mgr._id.toString()} value={mgr._id.toString()}>
                                      {mgr.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <Button type="submit" className="w-full">
                            Create User
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id.toString()}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lead Management</CardTitle>
                      <CardDescription>View and manage all leads</CardDescription>
                    </div>
                    <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Add Lead</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              value={leadForm.name}
                              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={leadForm.email}
                              onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={leadForm.phone}
                              onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              value={leadForm.company}
                              onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Source *</Label>
                            <Select
                              value={leadForm.source}
                              onValueChange={(value) => setLeadForm({ ...leadForm, source: value as LeadSource })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(LeadSource).map((src) => (
                                  <SelectItem key={src} value={src}>
                                    {src}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select
                              value={leadForm.assignedToId}
                              onValueChange={(value) => setLeadForm({ ...leadForm, assignedToId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((emp) => (
                                  <SelectItem key={emp._id.toString()} value={emp._id.toString()}>
                                    {emp.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button type="submit" className="w-full">
                            Create Lead
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead._id.toString()}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.company || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{lead.source}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{lead.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {(lead.assignedToId as any)?.name || "Unassigned"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
