import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClanSchema, insertJoinRequestSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    next();
  };

  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (!req.session?.user || req.session.user.role !== role) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }
    next();
  };

  // Mock Discord OAuth (simplified for development)
  app.post("/api/auth/discord", async (req, res) => {
    try {
      const { discordId, username } = req.body;
      
      let user = await storage.getUserByDiscordId(discordId);
      if (!user) {
        user = await storage.createUser({
          name: username,
          discord_id: discordId,
          role: "member",
          status: "accepted",
        });
      }

      req.session.user = user;
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/me", (req, res) => {
    if (req.session?.user) {
      res.json({ 
        loggedIn: true, 
        user: req.session.user 
      });
    } else {
      res.json({ loggedIn: false });
    }
  });

  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Create join request
      if (userData.clan_id) {
        await storage.createJoinRequest({
          user_id: user.id,
          clan_id: userData.clan_id,
          status: "pending",
          message: userData.reason || "",
        });
      }

      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  // Clans
  app.get("/api/clans", async (req, res) => {
    try {
      const clans = await storage.getAllClans();
      const clansWithMembers = await Promise.all(
        clans.map(async (clan) => {
          const members = await storage.getClanMembers(clan.id);
          return { ...clan, memberCount: members.length };
        })
      );
      res.json({ success: true, clans: clansWithMembers });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch clans" });
    }
  });

  app.get("/api/clan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clan = await storage.getClan(id);
      if (!clan) {
        return res.status(404).json({ success: false, error: "Clan not found" });
      }

      const members = await storage.getClanMembers(id);
      const announcements = await storage.getAnnouncementsByClan(id);
      
      res.json({ success: true, clan, members, announcements });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch clan details" });
    }
  });

  app.post("/api/clan", requireAuth, async (req, res) => {
    try {
      const clanData = insertClanSchema.parse({
        ...req.body,
        owner_id: req.session.user.id,
      });
      
      const clan = await storage.createClan(clanData);
      
      // Update user to clan_owner role and assign to clan
      await storage.updateUser(req.session.user.id, {
        role: "clan_owner",
        clan_id: clan.id,
      });

      res.json({ success: true, clan });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create clan" 
      });
    }
  });

  // Join Requests
  app.get("/api/join-requests", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      let requests;

      if (user.role === "clan_owner" && user.clan_id) {
        requests = await storage.getJoinRequestsByClan(user.clan_id);
        // Get user details for each request
        const requestsWithUsers = await Promise.all(
          requests.map(async (request) => {
            const requestUser = await storage.getUser(request.user_id);
            return { ...request, user: requestUser };
          })
        );
        res.json({ success: true, requests: requestsWithUsers });
      } else {
        res.json({ success: true, requests: [] });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch join requests" });
    }
  });

  app.post("/api/join-requests/:id/approve", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getJoinRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ success: false, error: "Request not found" });
      }

      // Update request status
      await storage.updateJoinRequest(requestId, { status: "accepted" });
      
      // Update user status and clan assignment
      await storage.updateUser(request.user_id, {
        status: "accepted",
        clan_id: request.clan_id,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to approve request" });
    }
  });

  app.post("/api/join-requests/:id/reject", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { message } = req.body;
      
      await storage.updateJoinRequest(requestId, { 
        status: "rejected",
        message: message || "Request rejected"
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to reject request" });
    }
  });

  // Announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      const announcementsWithAuthor = await Promise.all(
        announcements.map(async (announcement) => {
          const author = announcement.author_id 
            ? await storage.getUser(announcement.author_id)
            : null;
          return { ...announcement, author };
        })
      );
      res.json({ success: true, announcements: announcementsWithAuthor });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        author_id: req.session.user.id,
        clan_id: req.session.user.clan_id,
      });
      
      const announcement = await storage.createAnnouncement(announcementData);
      res.json({ success: true, announcement });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create announcement" 
      });
    }
  });

  // Rankings
  app.get("/api/ranking", async (req, res) => {
    try {
      const clans = await storage.getAllClans();
      const users = await storage.getAllUsers();

      // Clan rankings by member count
      const clanRankings = await Promise.all(
        clans.map(async (clan) => {
          const members = await storage.getClanMembers(clan.id);
          return {
            ...clan,
            memberCount: members.length,
            totalScore: members.reduce((sum, member) => sum + (member.score || 0), 0),
          };
        })
      );
      clanRankings.sort((a, b) => b.memberCount - a.memberCount);

      // Member rankings by score
      const memberRankings = users
        .filter(user => user.status === "accepted")
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);

      res.json({ success: true, clanRankings, memberRankings });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch rankings" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireRole("admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/role", requireRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      const user = await storage.updateUser(userId, { role });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/clans/:id", requireRole("admin"), async (req, res) => {
    try {
      const clanId = parseInt(req.params.id);
      const success = await storage.deleteClan(clanId);
      
      if (!success) {
        return res.status(404).json({ success: false, error: "Clan not found" });
      }

      // Update users who were in this clan
      const users = await storage.getAllUsers();
      for (const user of users) {
        if (user.clan_id === clanId) {
          await storage.updateUser(user.id, { clan_id: null, role: "member" });
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete clan" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const clans = await storage.getAllClans();
      const joinRequests = await storage.getJoinRequestsByClan(0); // Get all pending requests
      
      const stats = {
        totalUsers: users.length,
        totalClans: clans.length,
        activeUsers: users.filter(u => u.status === "accepted").length,
        pendingRequests: joinRequests.filter(r => r.status === "pending").length,
      };

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
