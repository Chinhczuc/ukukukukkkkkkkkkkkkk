import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Clan } from "@/types";

interface RegisterFormData {
  name: string;
  phone: string;
  discord_id: string;
  age: number;
  bio: string;
  reason: string;
  clan_id: number;
  avatar: File | null;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    phone: "",
    discord_id: "",
    age: 18,
    bio: "",
    reason: "",
    clan_id: 0,
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clansData } = useQuery<{ success: boolean; clans: Clan[] }>({
    queryKey: ["/api/clans"],
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "avatar">) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng ký thành công!",
          description: "Đơn đăng ký của bạn đã được gửi. Chờ duyệt từ gia tộc.",
        });
        // Reset form
        setFormData({
          name: "",
          phone: "",
          discord_id: "",
          age: 18,
          bio: "",
          reason: "",
          clan_id: 0,
          avatar: null,
        });
        setPreviewUrl("");
        setAcceptTerms(false);
        queryClient.invalidateQueries({ queryKey: ["/api/join-requests"] });
      } else {
        throw new Error(data.error || "Đăng ký thất bại");
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi đăng ký",
        description: error instanceof Error ? error.message : "Đăng ký thất bại",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.discord_id || !formData.clan_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Lỗi",
        description: "Bạn phải đồng ý với quy định RP",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      clan_id: Number(formData.clan_id),
    };
    delete (submitData as any).avatar;

    registerMutation.mutate(submitData);
  };

  const handleChange = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clans = clansData?.clans || [];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Đăng ký gia nhập gia tộc
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-white">Họ tên RP *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="John Doe"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+84 xxx xxx xxx"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="discord_id" className="text-white">Discord ID *</Label>
                <Input
                  id="discord_id"
                  value={formData.discord_id}
                  onChange={(e) => handleChange("discord_id", e.target.value)}
                  required
                  placeholder="username#1234"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-white">Tuổi *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", parseInt(e.target.value) || 18)}
                  required
                  min="16"
                  max="80"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clan_id" className="text-white">Chọn gia tộc muốn gia nhập *</Label>
              <select
                id="clan_id"
                value={formData.clan_id}
                onChange={(e) => handleChange("clan_id", parseInt(e.target.value) || 0)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white"
              >
                <option value="">-- Chọn gia tộc --</option>
                {clans.map((clan) => (
                  <option key={clan.id} value={clan.id}>
                    {clan.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="bio" className="text-white">Tiểu sử nhân vật</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                placeholder="Hãy kể về quá khứ và tính cách của nhân vật bạn..."
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            <div>
              <Label htmlFor="reason" className="text-white">Lý do muốn gia nhập</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                rows={3}
                placeholder="Tại sao bạn muốn gia nhập gia tộc này?"
                className="bg-slate-700 border-slate-600 text-white resize-none"
              />
            </div>

            <div>
              <Label htmlFor="avatar" className="text-white">Ảnh đại diện</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("avatar")?.click()}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Chọn ảnh
                </Button>
                {previewUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
              />
              <Label htmlFor="terms" className="text-white">
                Tôi đồng ý với{" "}
                <a href="#" className="text-emerald-400 hover:underline">
                  quy định RP
                </a>{" "}
                và cam kết tuân thủ *
              </Label>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {registerMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Gửi đơn đăng ký"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
