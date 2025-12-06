"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRole } from "@/types";

// Test credentials for quick login
const testCredentials = [
  {
    label: "SaaS Admin",
    email: "admin@lmsplatform.com",
    password: "admin123",
    role: "SAAS_ADMIN",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    label: "Company Admin (Acme)",
    email: "admin@acme.com",
    password: "admin123",
    role: "ADMIN",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "Manager (Acme)",
    email: "manager@acme.com",
    password: "manager123",
    role: "MANAGER",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    label: "Employee 1 (Acme)",
    email: "employee1@acme.com",
    password: "employee123",
    role: "EMPLOYEE",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    label: "Employee 2 (Acme)",
    email: "employee2@acme.com",
    password: "employee123",
    role: "EMPLOYEE",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    label: "Company Admin (TechCo)",
    email: "admin@techco.com",
    password: "admin123",
    role: "ADMIN",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "Employee (TechCo)",
    email: "employee@techco.com",
    password: "employee123",
    role: "EMPLOYEE",
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        // Store auth data
        login(response.data.token, response.data.user);

        // Redirect based on role
        const { role } = response.data.user;

        switch (role) {
          case UserRole.SAAS_ADMIN:
            router.push("/saas-admin");
            break;
          case UserRole.ADMIN:
            router.push("/company-admin");
            break;
          case UserRole.MANAGER:
            router.push("/manager");
            break;
          case UserRole.EMPLOYEE:
            router.push("/employee");
            break;
          default:
            router.push("/");
        }
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(testEmail, testPassword);

      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        const { role } = response.data.user;

        switch (role) {
          case UserRole.SAAS_ADMIN:
            router.push("/saas-admin");
            break;
          case UserRole.ADMIN:
            router.push("/company-admin");
            break;
          case UserRole.MANAGER:
            router.push("/manager");
            break;
          case UserRole.EMPLOYEE:
            router.push("/employee");
            break;
          default:
            router.push("/");
        }
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            LMS SaaS Platform
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or use test credentials
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {testCredentials.map((cred) => (
                  <Button
                    key={cred.email}
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-white ${cred.color} border-0`}
                    disabled={isLoading}
                    onClick={() => handleTestLogin(cred.email, cred.password)}
                  >
                    <span className="font-semibold">{cred.label}</span>
                    <span className="ml-auto text-xs opacity-80">{cred.email}</span>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-center text-slate-500 mt-2">
                Click any button above to login instantly
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
