import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Clan } from "@/types";

interface ClanCardProps {
  clan: Clan;
  onClick?: () => void;
}

export function ClanCard({ clan, onClick }: ClanCardProps) {
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

  return (
    <Card className="bg-slate-800 border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
      <div 
        className={`h-32 bg-gradient-to-r ${getBannerGradient(clan.id)} rounded-t-lg flex items-center justify-center`}
        onClick={onClick}
      >
        <span className="text-4xl">{getBannerEmoji(clan.id)}</span>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{clan.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>{clan.memberCount || 0} thành viên</span>
          </div>
        </div>
        
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {clan.description || "Chưa có mô tả"}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-emerald-500 text-slate-900">
            Đang tuyển
          </Badge>
          <Button 
            size="sm" 
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900"
            onClick={onClick}
          >
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
