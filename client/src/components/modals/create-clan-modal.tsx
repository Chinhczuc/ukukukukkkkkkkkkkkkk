import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateClanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClanModal({ open, onOpenChange }: CreateClanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    banner: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClanMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/clan", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Thành công",
          description: `Đã tạo gia tộc "${formData.name}" thành công!`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/clans"] });
        queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        setFormData({ name: "", description: "", banner: "" });
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Tạo gia tộc thất bại");
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Tạo gia tộc thất bại",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên gia tộc",
        variant: "destructive",
      });
      return;
    }
    createClanMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Tạo gia tộc mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên gia tộc *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập tên gia tộc"
              maxLength={32}
              required
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về gia tộc"
              maxLength={200}
              rows={3}
              className="bg-slate-800 border-slate-600 text-white resize-none"
            />
          </div>
          
          <div>
            <Label htmlFor="banner">Banner URL (tùy chọn)</Label>
            <Input
              id="banner"
              type="url"
              value={formData.banner}
              onChange={(e) => handleChange("banner", e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={createClanMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {createClanMutation.isPending ? "Đang tạo..." : "Tạo gia tộc"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
