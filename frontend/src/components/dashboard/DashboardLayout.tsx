import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Calendar,
  Image,
  Settings,
  Users,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronRight
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "superadmin" | "admin";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  // Sidebar state is redundant on mobile with bottom nav, but keeping for tablet/desktop consistency if needed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Events", href: "/dashboard/events" },
    { icon: Image, label: "Photos", href: "/dashboard/photos" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const superAdminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin" },
    { icon: Calendar, label: "All Events", href: "/super-admin/events" },
    { icon: Users, label: "Photographers", href: "/super-admin/photographers" },
    { icon: CreditCard, label: "Revenue", href: "/super-admin/revenue" },
    { icon: Settings, label: "Settings", href: "/super-admin/settings" },
  ];

  const navItems = userRole === "superadmin" ? superAdminNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Top Bar (Logo Only) */}
      <header className="lg:hidden bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="font-display font-semibold text-primary">DM</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {/* Sidebar (Hidden on Mobile, Visible on Desktop) */}
        <aside className={`
          hidden lg:block fixed inset-y-0 left-0 z-40
          w-64 bg-primary text-primary-foreground border-r border-primary-light/20
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center px-6 py-5 border-b border-border">
              <Logo />
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
                  <span className="font-display font-semibold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-body font-medium text-white text-sm truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="font-body text-xs text-white/70 capitalize truncate">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all ${isActive
                      ? "bg-secondary text-secondary-foreground shadow-lg font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10"
                asChild
              >
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 w-full rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay removed as Sidebar is hidden on mobile */}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] lg:min-h-screen pb-20 lg:pb-0 lg:pl-64">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden pb-safe">
          <nav className="flex justify-around items-center px-1 py-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-full ${isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                  <span className="text-[10px] font-medium font-body">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
