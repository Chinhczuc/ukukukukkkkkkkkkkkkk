import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@/types";

export default function Announcements() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as "normal" | "important" | "urgent",
  });

  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; announcements: Announcement[] }>({
    queryKey: ["/api/announcements"],
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã tạo thông báo thành công!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
        setFormData({ title: "", content: "", priority: "normal" });
        setShowCreateModal(false);
      } else {
        throw new Error(data.error || "Tạo thông báo thất bại");
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Tạo thông báo thất bại",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung thông báo",
        variant: "destructive",
      });
      return;
    }
    createAnnouncementMutation.mutate(formData);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500 text-white">KHẨN CẤP</Badge>;
      case "important":
        return <Badge className="bg-yellow-500 text-slate-900">QUAN TRỌNG</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">THÔNG THƯỜNG</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500";
      case "important":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffMs = now.getTime() - announcementDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return announcementDate.toLocaleDateString("vi-VN");
  };

  const announcements = data?.announcements || [];
  const canCreateAnnouncement = isLoggedIn && user && (user.role === "admin" || user.role === "clan_owner");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Thông báo</h2>
        {canCreateAnnouncement && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            + Tạo thông báo
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4">
        <Button className="bg-emerald-500 text-slate-900">Tất cả</Button>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          Gia tộc
        </Button>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          Hệ thống
        </Button>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          Quan trọng
        </Button>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`bg-slate-800 border-l-4 ${getPriorityColor(announcement.priority)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getPriorityBadge(announcement.priority)}
                      <span className="text-gray-400 text-sm">
                        {announcement.author?.name || "Hệ thống"}
                      </span>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-400 text-sm">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    {announcement.title && (
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {announcement.title}
                      </h3>
                    )}
                    <p className="text-gray-300">{announcement.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {announcement.author && (
                      <Avatar>
                        <AvatarFallback className="bg-emerald-500 text-slate-900">
                          {announcement.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      📌
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {announcements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Chưa có thông báo nào</p>
            </div>
          )}
        </div>
      )}

      {/* Load More */}
      {announcements.length > 10 && (
        <div className="text-center">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Xem thêm thông báo
          </Button>
        </div>
      )}

      {/* Create Announcement Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề thông báo</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề (tùy chọn)"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Nội dung thông báo *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Nhập nội dung thông báo"
                required
                rows={4}
                className="bg-slate-800 border-slate-600 text-white resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Mức độ ưu tiên</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white"
              >
                <option value="normal">Bình thường</option>
                <option value="important">Quan trọng</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={createAnnouncementMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {createAnnouncementMutation.isPending ? "Đang tạo..." : "Đăng thông báo"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
