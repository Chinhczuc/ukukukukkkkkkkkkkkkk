import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogin = () => {
    // Simulate Discord login - in production this would redirect to Discord OAuth
    const mockUser = {
      discordId: "user#1234",
      username: "Test User"
    };
    // For demo purposes, we'll simulate the login
    console.log("Discord login would happen here");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-400 rounded-lg flex items-center justify-center font-bold text-slate-900">
              GTA
            </div>
            <Link href="/">
              <h1 className="text-xl font-bold text-white cursor-pointer">Family Manager</h1>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                className="text-white"
              >
                Trang chủ
              </Button>
            </Link>
            <Link href="/clans">
              <Button 
                variant={location === "/clans" ? "default" : "ghost"} 
                className="text-white"
              >
                Gia tộc
              </Button>
            </Link>
            <Link href="/ranking">
              <Button 
                variant={location === "/ranking" ? "default" : "ghost"} 
                className="text-white"
              >
                Xếp hạng
              </Button>
            </Link>
            <Link href="/announcements">
              <Button 
                variant={location === "/announcements" ? "default" : "ghost"} 
                className="text-white"
              >
                Thông báo
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn && user ? (
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-500 text-slate-900">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-slate-400">{user.role}</div>
              </div>
              <Button onClick={() => logout()} variant="outline" size="sm">
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700">
              <span className="mr-2">🎮</span>
              Đăng nhập Discord
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
