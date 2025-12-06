"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { navigationConfig, NavSection } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
} from "lucide-react";
import { UserRole } from "@/types";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navSections: NavSection[] = user?.role
    ? navigationConfig[user.role as UserRole] || []
    : [];

  // Get role-based color
  const getRoleColor = () => {
    switch (user?.role) {
      case UserRole.SAAS_ADMIN:
        return "from-purple-600 to-purple-700";
      case UserRole.ADMIN:
        return "from-blue-600 to-blue-700";
      case UserRole.MANAGER:
        return "from-green-600 to-green-700";
      case UserRole.EMPLOYEE:
        return "from-orange-600 to-orange-700";
      default:
        return "from-slate-600 to-slate-700";
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case UserRole.SAAS_ADMIN:
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case UserRole.ADMIN:
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case UserRole.MANAGER:
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case UserRole.EMPLOYEE:
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 flex-1">
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", getRoleColor())}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {(!isCollapsed || mobile) && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white">
                  Travel LMS
                </span>
                <span className="text-xs text-slate-500">
                  {user?.role?.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </Link>
          {!mobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {/* Section Header */}
            {(!isCollapsed || mobile) && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.section}
                </span>
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobile && setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 transition-colors text-sm",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {(!isCollapsed || mobile) && (
                      <span className="flex-1">{item.title}</span>
                    )}
                    {item.badge && (!isCollapsed || mobile) && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className={cn("bg-gradient-to-br text-white font-semibold text-xs", getRoleColor())}>
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            {(!isCollapsed || mobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {(!isCollapsed || mobile) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar - Sheet/Drawer */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-slate-900 border-r border-slate-700 shadow-2xl transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
