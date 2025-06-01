import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, JoinRequest } from "@/types";

interface ClanStats {
  memberCount: number;
  pendingRequests: number;
  weeklyActivity: number;
}

export default function ClanManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not clan owner or admin
  if (!user || (user.role !== "clan_owner" && user.role !== "admin")) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  const { data: requestsData, isLoading: requestsLoading } = useQuery<{
    success: boolean;
    requests: JoinRequest[];
  }>({
    queryKey: ["/api/join-requests"],
  });

  const { data: membersData } = useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["/api/admin/users"],
    enabled: user.role === "admin",
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest("POST", `/api/join-requests/${requestId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã duyệt đơn xin gia nhập",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể duyệt đơn xin gia nhập",
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: number; message: string }) => {
      const response = await apiRequest("POST", `/api/join-requests/${requestId}/reject`, { message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã từ chối đơn xin gia nhập",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/join-requests"] });
      setRejectReason("");
      setSelectedRequest(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối đơn xin gia nhập",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (requestId: number) => {
    approveRequestMutation.mutate(requestId);
  };

  const handleReject = (request: JoinRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
  };

  const confirmReject = () => {
    if (!selectedRequest) return;
    
    if (!rejectReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }

    rejectRequestMutation.mutate({
      requestId: selectedRequest.id,
      message: rejectReason.trim(),
    });
  };

  const viewApplication = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowApplicationModal(true);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requests = requestsData?.requests || [];
  const pendingRequests = requests.filter(r => r.status === "pending");
  
  // Mock stats for demo - in production these would come from API
  const stats: ClanStats = {
    memberCount: membersData?.users?.filter(u => u.clan_id === user.clan_id && u.status === "accepted").length || 0,
    pendingRequests: pendingRequests.length,
    weeklyActivity: 89,
  };

  const clanMembers = membersData?.users?.filter(u => u.clan_id === user.clan_id && u.status === "accepted") || [];
  
  const filteredMembers = clanMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.discord_id && member.discord_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Quản lý gia tộc</h2>
      
      {/* Clan Management Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Thành viên</p>
                <p className="text-2xl font-bold text-white">{stats.memberCount}</p>
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
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingRequests}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hoạt động tuần</p>
                <p className="text-2xl font-bold text-green-400">{stats.weeklyActivity}%</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6 text-white">Đơn xin gia nhập chờ duyệt</h3>
          
          {requestsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Không có đơn nào đang chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-emerald-500 text-slate-900">
                        {request.user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{request.user?.name || "Unknown User"}</p>
                      <p className="text-sm text-gray-400">
                        Discord: {request.user?.discord_id || "N/A"}
                      </p>
                      <p className="text-sm text-gray-400">
                        Tuổi: {request.user?.age || "N/A"} • Gửi {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => viewApplication(request)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveRequestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Duyệt
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      disabled={rejectRequestMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Members */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Thành viên hiện tại</h3>
            <Input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-white">Thành viên</th>
                  <th className="text-left py-3 px-4 text-white">Vai trò</th>
                  <th className="text-left py-3 px-4 text-white">Ngày gia nhập</th>
                  <th className="text-left py-3 px-4 text-white">Điểm</th>
                  <th className="text-left py-3 px-4 text-white">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-emerald-500 text-slate-900">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.discord_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {member.role === "admin" && (
                        <Badge className="bg-red-500 text-white">Admin</Badge>
                      )}
                      {member.role === "clan_owner" && (
                        <Badge className="bg-yellow-500 text-slate-900">Chủ clan</Badge>
                      )}
                      {member.role === "member" && (
                        <Badge variant="secondary">Thành viên</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold">{member.score || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                          ✏️
                        </Button>
                        {member.role !== "clan_owner" && member.role !== "admin" && (
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                            ❌
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchTerm ? "Không tìm thấy thành viên nào" : "Chưa có thành viên nào"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn xin gia nhập</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && selectedRequest.user && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-emerald-500 text-slate-900 text-xl">
                    {selectedRequest.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRequest.user.name}</h3>
                  <p className="text-gray-400">{selectedRequest.user.discord_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Tuổi</Label>
                  <p className="text-white">{selectedRequest.user.age || "Chưa cung cấp"}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Số điện thoại</Label>
                  <p className="text-white">{selectedRequest.user.phone || "Chưa cung cấp"}</p>
                </div>
              </div>

              {selectedRequest.user.bio && (
                <div>
                  <Label className="text-gray-400">Tiểu sử nhân vật</Label>
                  <p className="text-white mt-1">{selectedRequest.user.bio}</p>
                </div>
              )}

              {selectedRequest.user.reason && (
                <div>
                  <Label className="text-gray-400">Lý do muốn gia nhập</Label>
                  <p className="text-white mt-1">{selectedRequest.user.reason}</p>
                </div>
              )}

              <div>
                <Label className="text-gray-400">Ngày gửi đơn</Label>
                <p className="text-white">{formatDate(selectedRequest.created_at)}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => setShowApplicationModal(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setShowApplicationModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Duyệt
                </Button>
                <Button
                  onClick={() => {
                    setShowApplicationModal(false);
                    handleReject(selectedRequest);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={selectedRequest !== null && !showApplicationModal} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Từ chối đơn xin gia nhập</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Lý do từ chối *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối đơn xin gia nhập..."
                required
                rows={4}
                className="bg-slate-800 border-slate-600 text-white resize-none"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setSelectedRequest(null)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmReject}
                disabled={rejectRequestMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectRequestMutation.isPending ? "Đang xử lý..." : "Từ chối"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
