import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AuthUser, User } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: authData, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { discordId: string; username: string }) => {
      const response = await apiRequest("POST", "/api/auth/discord", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
  });

  return {
    user: authData?.user,
    isLoggedIn: authData?.loggedIn || false,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
