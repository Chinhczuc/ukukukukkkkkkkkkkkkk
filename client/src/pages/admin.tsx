import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Clan } from "@/types";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  const { data: usersData } = useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "users",
  });

  const { data: clansData } = useQuery<{ success: boolean; clans: Clan[] }>({
    queryKey: ["/api/clans"],
    enabled: activeTab === "clans",
  });

  const { data: statsData } = useQuery<{ success: boolean; stats: any }>({
    queryKey: ["/api/stats"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật vai trò người dùng",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật vai trò người dùng",
        variant: "destructive",
      });
    },
  });

  const deleteClanMutation = useMutation({
    mutationFn: async (clanId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/clans/${clanId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa gia tộc",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clans"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa gia tộc",
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteClan = (clanId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa gia tộc này?")) {
      deleteClanMutation.mutate(clanId);
    }
  };

  const stats = statsData?.stats;
  const users = usersData?.users || [];
  const clans = clansData?.clans || [];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.discord_id && u.discord_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredClans = clans.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case "clan_owner":
        return <Badge className="bg-yellow-500 text-slate-900">Clan Owner</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500 text-white">Hoạt động</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-slate-900">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Quản trị hệ thống</h2>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng người dùng</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Đơn chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.pendingRequests || 0}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gia tộc</p>
                <p className="text-2xl font-bold text-blue-400">{stats?.totalClans || 0}</p>
              </div>
              <span className="text-2xl">🏰</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hoạt động</p>
                <p className="text-2xl font-bold text-green-400">{stats?.activeUsers || 0}</p>
              </div>
              <span className="text-2xl">🟢</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-4">
        <Button
          onClick={() => setActiveTab("users")}
          className={activeTab === "users" ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-white hover:bg-slate-600"}
        >
          Quản lý người dùng
        </Button>
        <Button
          onClick={() => setActiveTab("clans")}
          className={activeTab === "clans" ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-white hover:bg-slate-600"}
        >
          Quản lý gia tộc
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-slate-700 border-slate-600 text-white"
        />
      </div>

      {/* Users Management Tab */}
      {activeTab === "users" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-white">Danh sách người dùng</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-white">Người dùng</th>
                    <th className="text-left py-3 px-4 text-white">Discord</th>
                    <th className="text-left py-3 px-4 text-white">Vai trò</th>
                    <th className="text-left py-3 px-4 text-white">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-white">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-500 text-slate-900">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.discord_id || "N/A"}</td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                          className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
                        >
                          <option value="member">Member</option>
                          <option value="clan_owner">Clan Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                            ✏️
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                            🚫
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clans Management Tab */}
      {activeTab === "clans" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-white">Quản lý gia tộc</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-white">Gia tộc</th>
                    <th className="text-left py-3 px-4 text-white">Chủ sở hữu</th>
                    <th className="text-left py-3 px-4 text-white">Thành viên</th>
                    <th className="text-left py-3 px-4 text-white">Ngày tạo</th>
                    <th className="text-left py-3 px-4 text-white">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClans.map((clan) => (
                    <tr key={clan.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{clan.name}</td>
                      <td className="py-3 px-4 text-gray-400">#{clan.owner_id || "N/A"}</td>
                      <td className="py-3 px-4 text-gray-400">{(clan as any).memberCount || 0}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(clan.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                            ✏️
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            onClick={() => handleDeleteClan(clan.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
