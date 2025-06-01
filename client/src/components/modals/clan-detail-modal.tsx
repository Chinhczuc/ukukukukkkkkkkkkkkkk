import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Clan, User, Announcement } from "@/types";

interface ClanDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clanId: number | null;
}

interface ClanDetailResponse {
  success: boolean;
  clan: Clan;
  members: User[];
  announcements: Announcement[];
}

export function ClanDetailModal({ open, onOpenChange, clanId }: ClanDetailModalProps) {
  const { data, isLoading } = useQuery<ClanDetailResponse>({
    queryKey: [`/api/clan/${clanId}`],
    enabled: open && clanId !== null,
  });

  if (!open || !clanId) return null;

  const getBannerGradient = (id: number) => {
    const gradients = [
      "from-purple-600 to-blue-600",
      "from-green-600 to-teal-600", 
      "from-orange-600 to-red-600",
      "from-indigo-600 to-purple-600",
      "from-pink-600 to-rose-600",
    ];
    return gradients[id % gradients.length];
  };

  const getBannerEmoji = (id: number) => {
    const emojis = ["🏙️", "🏔️", "🏜️", "🌆", "🌊"];
    return emojis[id % emojis.length];
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case "clan_owner":
        return <Badge className="bg-yellow-500 text-slate-900">Chủ clan</Badge>;
      default:
        return <Badge variant="secondary">Thành viên</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data?.success || !data.clan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <div className="text-center py-8">
            <p className="text-red-400">Không thể tải thông tin gia tộc</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { clan, members, announcements } = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clan.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Clan Banner */}
          <div className={`w-full h-48 bg-gradient-to-r ${getBannerGradient(clan.id)} rounded-lg flex items-center justify-center`}>
            <span className="text-6xl">{getBannerEmoji(clan.id)}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Mô tả</h3>
                <p className="text-slate-300">
                  {clan.description || "Chưa có mô tả cho gia tộc này."}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Thành viên ({members.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {members.map((member) => (
                    <Card key={member.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-500 text-slate-900">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-white">{member.name}</p>
                            <p className="text-sm text-slate-400">
                              Gia nhập: {formatDate(member.created_at)}
                            </p>
                          </div>
                          {getRoleBadge(member.role)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-400">Tổng thành viên</p>
                      <p className="text-2xl font-bold text-emerald-400">{members.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-400">Hoạt động tuần này</p>
                      <p className="text-2xl font-bold text-purple-400">89%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-400">Xếp hạng</p>
                      <p className="text-2xl font-bold text-yellow-400">#1</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Xin gia nhập
              </Button>
            </div>
          </div>

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Thông báo gần đây</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {announcements.slice(0, 3).map((announcement) => (
                  <Card key={announcement.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-slate-300">{announcement.content}</p>
                      <p className="text-sm text-slate-500 mt-2">
                        {formatDate(announcement.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
