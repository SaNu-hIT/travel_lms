"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { UserRole, ITenant, IUser, TenantStatus } from "@/types";
import { tenantService } from "@/services/tenantService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<ITenant | null>(null);
  const [adminUsers, setAdminUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for creating admin user
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchTenantDetails();
    fetchAdminUsers();
  }, [tenantId]);

  const fetchTenantDetails = async () => {
    try {
      setIsLoading(true);
      const response = await tenantService.getById(tenantId);
      if (response.success && response.data) {
        setTenant(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tenant details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      // Use query parameter to filter by tenant
      const response = await userService.getAll(`?tenantId=${tenantId}`);
      if (response.success && response.data) {
        // Filter only admin users
        const admins = response.data.filter(
          (user) => user.role === UserRole.ADMIN
        );
        setAdminUsers(admins);
      }
    } catch (error) {
      console.error("Failed to load admin users", error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await userService.create({
        ...adminForm,
        tenantId,
        role: UserRole.ADMIN,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Company admin created successfully",
        });
        setIsDialogOpen(false);
        setAdminForm({ name: "", email: "", password: "" });
        fetchAdminUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create admin user",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: TenantStatus) => {
    const variants: Record<TenantStatus, "default" | "secondary" | "destructive"> = {
      [TenantStatus.ACTIVE]: "default",
      [TenantStatus.SUSPENDED]: "secondary",
      [TenantStatus.INACTIVE]: "destructive",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.SAAS_ADMIN]}>
        <DashboardLayout title="Tenant Details">
          <p>Loading...</p>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!tenant) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.SAAS_ADMIN]}>
        <DashboardLayout title="Tenant Not Found">
          <div className="space-y-4">
            <p>Tenant not found</p>
            <Button onClick={() => router.push("/saas-admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.SAAS_ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => router.push("/saas-admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Tenant Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{tenant.name}</CardTitle>
                  <CardDescription>
                    {tenant.domain || "No domain set"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(tenant.status)}
                  <Badge variant="outline">{tenant.plan}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Max Users</p>
                  <p className="text-2xl font-bold">{tenant.maxUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Created At</p>
                  <p className="text-lg font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Admin Users</p>
                  <p className="text-2xl font-bold">{adminUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Users Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Admins</CardTitle>
                  <CardDescription>
                    Manage administrators for this company
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Company Admin</DialogTitle>
                      <DialogDescription>
                        Add a new administrator for {tenant.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={adminForm.name}
                          onChange={(e) =>
                            setAdminForm({ ...adminForm, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={adminForm.email}
                          onChange={(e) =>
                            setAdminForm({ ...adminForm, email: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={adminForm.password}
                          onChange={(e) =>
                            setAdminForm({ ...adminForm, password: e.target.value })
                          }
                          required
                          minLength={6}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Create Admin User
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {adminUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No admin users found for this company</p>
                  <p className="text-sm mt-1">
                    Click Add Admin User to create the first administrator
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user._id.toString()}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
