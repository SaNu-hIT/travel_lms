"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { UserRole, ITenant, TenantPlan, TenantStatus } from "@/types";
import { tenantService } from "@/services/tenantService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SaasAdminDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<ITenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    plan: TenantPlan.FREE,
    maxUsers: 10,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantService.getAll();
      if (response.success && response.data) {
        setTenants(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await tenantService.create(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Tenant created successfully",
        });
        setIsDialogOpen(false);
        setFormData({ name: "", domain: "", plan: TenantPlan.FREE, maxUsers: 10 });
        fetchTenants();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create tenant",
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

  return (
    <ProtectedRoute allowedRoles={[UserRole.SAAS_ADMIN]}>
      <DashboardLayout title="SaaS Admin Dashboard">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Tenants</CardTitle>
                <CardDescription>Registered companies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tenants.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active</CardTitle>
                <CardDescription>Active tenants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {tenants.filter((t) => t.status === TenantStatus.ACTIVE).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inactive</CardTitle>
                <CardDescription>Inactive tenants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {tenants.filter((t) => t.status === TenantStatus.INACTIVE).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tenants Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Tenants</CardTitle>
                  <CardDescription>Manage all registered companies</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add New Tenant</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Tenant</DialogTitle>
                      <DialogDescription>Add a new company to the platform</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTenant} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain (Optional)</Label>
                        <Input
                          id="domain"
                          placeholder="example.com"
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <Select
                          value={formData.plan}
                          onValueChange={(value) => setFormData({ ...formData, plan: value as TenantPlan })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TenantPlan).map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxUsers">Max Users</Label>
                        <Input
                          id="maxUsers"
                          type="number"
                          value={formData.maxUsers}
                          onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                          min="1"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Create Tenant
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Max Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow
                        key={tenant._id.toString()}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => router.push(`/saas-admin/tenants/${tenant._id}`)}
                      >
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell>{tenant.domain || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tenant.plan}</Badge>
                        </TableCell>
                        <TableCell>{tenant.maxUsers}</TableCell>
                        <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                        <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
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
