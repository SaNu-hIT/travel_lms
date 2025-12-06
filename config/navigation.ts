import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  BarChart3,
  Settings,
  UserCircle,
  LucideIcon,
} from "lucide-react";
import { UserRole } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export const navigationConfig: Record<UserRole, NavItem[]> = {
  [UserRole.SAAS_ADMIN]: [
    {
      title: "Dashboard",
      href: "/saas-admin",
      icon: LayoutDashboard,
    },
    {
      title: "Tenants",
      href: "/saas-admin",
      icon: Building2,
    },
    {
      title: "Analytics",
      href: "/saas-admin",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/saas-admin",
      icon: Settings,
    },
  ],
  [UserRole.ADMIN]: [
    {
      title: "Dashboard",
      href: "/company-admin",
      icon: LayoutDashboard,
    },
    {
      title: "Leads",
      href: "/company-admin",
      icon: FileText,
    },
    {
      title: "Users",
      href: "/company-admin",
      icon: Users,
    },
    {
      title: "Reports",
      href: "/company-admin",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/company-admin",
      icon: Settings,
    },
  ],
  [UserRole.MANAGER]: [
    {
      title: "Dashboard",
      href: "/manager",
      icon: LayoutDashboard,
    },
    {
      title: "Team Leads",
      href: "/manager",
      icon: FileText,
    },
    {
      title: "My Team",
      href: "/manager",
      icon: Users,
    },
    {
      title: "Reports",
      href: "/manager",
      icon: BarChart3,
    },
  ],
  [UserRole.EMPLOYEE]: [
    {
      title: "Dashboard",
      href: "/employee",
      icon: LayoutDashboard,
    },
    {
      title: "My Leads",
      href: "/employee",
      icon: FileText,
    },
    {
      title: "Activity",
      href: "/employee",
      icon: UserCircle,
    },
  ],
};
