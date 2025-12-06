"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard
      switch (user.role) {
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
          router.push("/login");
      }
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
