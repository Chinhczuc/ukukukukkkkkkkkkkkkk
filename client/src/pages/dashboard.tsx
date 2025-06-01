import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface Stats {
  totalUsers: number;
  totalClans: number;
  activeUsers: number;
  pendingRequests: number;
}

export default function Dashboard() {
  const { isLoggedIn } = useAuth();
  
  const { data: statsData } = useQuery<{ success: boolean; stats: Stats }>({
    queryKey: ["/api/stats"],
  });

  const stats = statsData?.stats;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Hệ Thống Quản Lý Gia Tộc
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            GTA FiveM Roleplay - Quản lý thành viên, hoạt động, cấp bậc minh bạch
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Tham gia ngay
              </Button>
            </Link>
            <Link href="/clans">
              <Button variant="outline">
                Xem gia tộc
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Tổng gia tộc</p>
                <p className="text-3xl font-bold">{stats?.totalClans || 0}</p>
              </div>
              <div className="text-4xl">🏰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Thành viên</p>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Đơn chờ duyệt</p>
                <p className="text-3xl font-bold">{stats?.pendingRequests || 0}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Hoạt động</p>
                <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
              <span className="mr-2">🔥</span>
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">JD</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Có thành viên mới gia nhập hệ thống</p>
                  <p className="text-sm text-gray-400">Vài phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">AS</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Có gia tộc mới được tạo</p>
                  <p className="text-sm text-gray-400">1 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">MK</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Cập nhật thông báo mới</p>
                  <p className="text-sm text-gray-400">2 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
              <span className="mr-2">⚡</span>
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/register">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 p-4 h-auto flex-col">
                  <div className="text-2xl mb-2">📝</div>
                  <span className="font-semibold">Đăng ký gia nhập</span>
                </Button>
              </Link>
              
              {isLoggedIn && (
                <Button className="bg-purple-600 hover:bg-purple-700 p-4 h-auto flex-col">
                  <div className="text-2xl mb-2">🏰</div>
                  <span className="font-semibold">Tạo gia tộc</span>
                </Button>
              )}
              
              <Link href="/ranking">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 p-4 h-auto flex-col">
                  <div className="text-2xl mb-2">🏆</div>
                  <span className="font-semibold">Xem xếp hạng</span>
                </Button>
              </Link>
              
              <Link href="/announcements">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 p-4 h-auto flex-col">
                  <div className="text-2xl mb-2">📢</div>
                  <span className="font-semibold">Thông báo</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
