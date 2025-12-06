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
  children?: NavItem[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navigationConfig: Record<UserRole, NavSection[]> = {
  [UserRole.SAAS_ADMIN]: [
    {
      section: "Main",
      items: [
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
      ],
    },
    {
      section: "Analytics",
      items: [
        {
          title: "Reports",
          href: "/saas-admin",
          icon: BarChart3,
        },
      ],
    },
    {
      section: "Settings",
      items: [
        {
          title: "Configuration",
          href: "/saas-admin",
          icon: Settings,
        },
      ],
    },
  ],
  [UserRole.ADMIN]: [
    {
      section: "Main",
      items: [
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
      ],
    },
    {
      section: "Analytics",
      items: [
        {
          title: "Reports",
          href: "/company-admin",
          icon: BarChart3,
        },
      ],
    },
    {
      section: "Settings",
      items: [
        {
          title: "Configuration",
          href: "/company-admin",
          icon: Settings,
        },
      ],
    },
  ],
  [UserRole.MANAGER]: [
    {
      section: "Main",
      items: [
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
      ],
    },
    {
      section: "Analytics",
      items: [
        {
          title: "Reports",
          href: "/manager",
          icon: BarChart3,
        },
      ],
    },
  ],
  [UserRole.EMPLOYEE]: [
    {
      section: "Main",
      items: [
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
      ],
    },
    {
      section: "Activity",
      items: [
        {
          title: "My Activity",
          href: "/employee",
          icon: UserCircle,
        },
      ],
    },
  ],
};
