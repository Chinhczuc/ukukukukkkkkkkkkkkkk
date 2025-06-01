import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClanCard } from "@/components/cards/clan-card";
import { ClanDetailModal } from "@/components/modals/clan-detail-modal";
import { CreateClanModal } from "@/components/modals/create-clan-modal";
import { useAuth } from "@/hooks/use-auth";
import type { Clan } from "@/types";

interface ClansResponse {
  success: boolean;
  clans: Clan[];
}

export default function Clans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const { data, isLoading } = useQuery<ClansResponse>({
    queryKey: ["/api/clans"],
  });

  const clans = data?.clans || [];
  
  const filteredClans = clans.filter(clan =>
    clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (clan.description && clan.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canCreateClan = isLoggedIn && (user?.role === "admin" || user?.role === "clan_owner");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Danh sách Gia tộc</h2>
        {canCreateClan && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            + Tạo gia tộc mới
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm gia tộc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
              <option>Tất cả gia tộc</option>
              <option>Đang tuyển thành viên</option>
              <option>Hoạt động cao</option>
              <option>Mới tạo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Clans Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClans.map((clan) => (
              <ClanCard
                key={clan.id}
                clan={clan}
                onClick={() => setSelectedClanId(clan.id)}
              />
            ))}
          </div>

          {filteredClans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {searchTerm ? "Không tìm thấy gia tộc nào phù hợp" : "Chưa có gia tộc nào"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {filteredClans.length > 9 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            <Button variant="outline" size="sm">‹</Button>
            <Button size="sm" className="bg-emerald-500 text-slate-900">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">›</Button>
          </nav>
        </div>
      )}

      {/* Modals */}
      <ClanDetailModal
        open={selectedClanId !== null}
        onOpenChange={(open) => !open && setSelectedClanId(null)}
        clanId={selectedClanId}
      />

      <CreateClanModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
