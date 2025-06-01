import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MemberCard } from "@/components/cards/member-card";
import type { Clan, User } from "@/types";

interface RankingResponse {
  success: boolean;
  clanRankings: (Clan & { memberCount: number; totalScore: number })[];
  memberRankings: User[];
}

export default function Ranking() {
  const { data, isLoading } = useQuery<RankingResponse>({
    queryKey: ["/api/ranking"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { clanRankings = [], memberRankings = [] } = data || {};

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-slate-900";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
    return "bg-slate-600 text-white";
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Bảng xếp hạng</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clan Rankings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
              <span className="mr-2">🏆</span>
              Top Gia tộc
            </h3>
            <div className="space-y-4">
              {clanRankings.map((clan, index) => (
                <div key={clan.id} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankBadge(index + 1)}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{clan.name}</p>
                    <p className="text-sm text-gray-400">{clan.memberCount} thành viên</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{clan.totalScore}</p>
                    <p className="text-sm text-gray-400">điểm</p>
                  </div>
                </div>
              ))}
              {clanRankings.length === 0 && (
                <p className="text-gray-400 text-center py-8">Chưa có dữ liệu xếp hạng gia tộc</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Rankings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
              <span className="mr-2">⭐</span>
              Top Thành viên
            </h3>
            <div className="space-y-4">
              {memberRankings.map((member, index) => (
                <div key={member.id} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankBadge(index + 1)}`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-gray-400">Gia tộc #{member.clan_id || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{member.score}</p>
                    <p className="text-sm text-gray-400">điểm</p>
                  </div>
                </div>
              ))}
              {memberRankings.length === 0 && (
                <p className="text-gray-400 text-center py-8">Chưa có dữ liệu xếp hạng thành viên</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Criteria */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Tiêu chí xếp hạng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Gia tộc</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Số lượng thành viên hoạt động</li>
                <li>• Điểm hoạt động tổng cộng</li>
                <li>• Tỷ lệ tham gia sự kiện</li>
                <li>• Thời gian tồn tại</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Thành viên</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Thời gian online</li>
                <li>• Tham gia hoạt động gia tộc</li>
                <li>• Đóng góp cho cộng đồng</li>
                <li>• Tuân thủ quy định RP</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
