import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, isLoggedIn } = useAuth();

  const navigation = [
    { name: "Trang chủ", href: "/", icon: "🏠" },
    { name: "Gia tộc", href: "/clans", icon: "👥" },
    { name: "Đăng ký", href: "/register", icon: "📝" },
    { name: "Xếp hạng", href: "/ranking", icon: "🏆" },
    { name: "Thông báo", href: "/announcements", icon: "📢" },
  ];

  const adminNavigation = [
    { name: "Quản trị", href: "/admin", icon: "⚙️", role: "admin" },
    { name: "Quản lý Clan", href: "/clan-management", icon: "👑", role: "clan_owner" },
  ];

  const shouldShowAdminItem = (item: { role: string }) => {
    if (!isLoggedIn || !user) return false;
    return user.role === item.role || user.role === "admin";
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location === item.href 
                    ? "bg-emerald-500 text-slate-900 hover:bg-emerald-600" 
                    : "text-white hover:bg-slate-800"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Button>
            </Link>
          ))}
          
          {adminNavigation.map((item) => 
            shouldShowAdminItem(item) ? (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location === item.href 
                      ? "bg-emerald-500 text-slate-900 hover:bg-emerald-600" 
                      : item.role === "admin" 
                        ? "text-red-400 hover:bg-slate-800" 
                        : "text-yellow-400 hover:bg-slate-800"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            ) : null
          )}
        </div>
      </div>
    </aside>
  );
}
