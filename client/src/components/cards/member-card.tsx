import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/types";

interface MemberCardProps {
  member: User;
  rank?: number;
  showClan?: boolean;
}

export function MemberCard({ member, rank, showClan = false }: MemberCardProps) {
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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-slate-900";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
    return "bg-slate-600 text-white";
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {rank && (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankBadge(rank)}`}>
              {rank}
            </div>
          )}
          
          <Avatar>
            <AvatarFallback className="bg-emerald-500 text-slate-900">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <p className="font-semibold text-white">{member.name}</p>
            {showClan && member.clan_id && (
              <p className="text-sm text-slate-400">Gia tộc #{member.clan_id}</p>
            )}
          </div>
          
          <div className="text-right">
            {member.score !== undefined && (
              <p className="font-bold text-emerald-400">{member.score}</p>
            )}
            <p className="text-sm text-slate-400">điểm</p>
          </div>
          
          {getRoleBadge(member.role)}
        </div>
      </CardContent>
    </Card>
  );
}
