import { users, clans, join_requests, announcements, type User, type InsertUser, type Clan, type InsertClan, type JoinRequest, type InsertJoinRequest, type Announcement, type InsertAnnouncement } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Clans
  getClan(id: number): Promise<Clan | undefined>;
  getAllClans(): Promise<Clan[]>;
  createClan(clan: InsertClan): Promise<Clan>;
  updateClan(id: number, updates: Partial<Clan>): Promise<Clan | undefined>;
  deleteClan(id: number): Promise<boolean>;
  getClanMembers(clanId: number): Promise<User[]>;
  
  // Join Requests
  getJoinRequest(id: number): Promise<JoinRequest | undefined>;
  getJoinRequestsByClan(clanId: number): Promise<JoinRequest[]>;
  getJoinRequestsByUser(userId: number): Promise<JoinRequest[]>;
  createJoinRequest(request: InsertJoinRequest): Promise<JoinRequest>;
  updateJoinRequest(id: number, updates: Partial<JoinRequest>): Promise<JoinRequest | undefined>;
  deleteJoinRequest(id: number): Promise<boolean>;
  
  // Announcements
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByClan(clanId: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clans: Map<number, Clan>;
  private joinRequests: Map<number, JoinRequest>;
  private announcements: Map<number, Announcement>;
  private currentUserId: number;
  private currentClanId: number;
  private currentJoinRequestId: number;
  private currentAnnouncementId: number;

  constructor() {
    this.users = new Map();
    this.clans = new Map();
    this.joinRequests = new Map();
    this.announcements = new Map();
    this.currentUserId = 1;
    this.currentClanId = 1;
    this.currentJoinRequestId = 1;
    this.currentAnnouncementId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      name: "Admin User",
      phone: null,
      discord_id: "admin#1234",
      age: 30,
      bio: "System Administrator",
      reason: null,
      clan_id: null,
      avatar: null,
      role: "admin",
      status: "accepted",
      score: 0,
      created_at: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample clans
    const clan1: Clan = {
      id: this.currentClanId++,
      name: "Los Santos Mafia",
      description: "Gia tộc uy tín nhất thành phố, chuyên về kinh doanh và bảo vệ lãnh thổ.",
      banner: null,
      owner_id: null,
      created_at: new Date(),
    };
    this.clans.set(clan1.id, clan1);

    const clan2: Clan = {
      id: this.currentClanId++,
      name: "Grove Street Family",
      description: "Gia tộc truyền thống với lịch sử lâu đời, tập trung vào tình đồng đội.",
      banner: null,
      owner_id: null,
      created_at: new Date(),
    };
    this.clans.set(clan2.id, clan2);

    const clan3: Clan = {
      id: this.currentClanId++,
      name: "Ballas Gang",
      description: "Tổ chức bí mật với các hoạt động đa dạng trên khắp San Andreas.",
      banner: null,
      owner_id: null,
      created_at: new Date(),
    };
    this.clans.set(clan3.id, clan3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.discord_id === discordId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      created_at: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Clan methods
  async getClan(id: number): Promise<Clan | undefined> {
    return this.clans.get(id);
  }

  async getAllClans(): Promise<Clan[]> {
    return Array.from(this.clans.values());
  }

  async createClan(insertClan: InsertClan): Promise<Clan> {
    const id = this.currentClanId++;
    const clan: Clan = {
      ...insertClan,
      id,
      created_at: new Date(),
    };
    this.clans.set(id, clan);
    return clan;
  }

  async updateClan(id: number, updates: Partial<Clan>): Promise<Clan | undefined> {
    const clan = this.clans.get(id);
    if (!clan) return undefined;
    
    const updatedClan = { ...clan, ...updates };
    this.clans.set(id, updatedClan);
    return updatedClan;
  }

  async deleteClan(id: number): Promise<boolean> {
    return this.clans.delete(id);
  }

  async getClanMembers(clanId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      user => user.clan_id === clanId && user.status === "accepted"
    );
  }

  // Join Request methods
  async getJoinRequest(id: number): Promise<JoinRequest | undefined> {
    return this.joinRequests.get(id);
  }

  async getJoinRequestsByClan(clanId: number): Promise<JoinRequest[]> {
    return Array.from(this.joinRequests.values()).filter(
      request => request.clan_id === clanId
    );
  }

  async getJoinRequestsByUser(userId: number): Promise<JoinRequest[]> {
    return Array.from(this.joinRequests.values()).filter(
      request => request.user_id === userId
    );
  }

  async createJoinRequest(insertRequest: InsertJoinRequest): Promise<JoinRequest> {
    const id = this.currentJoinRequestId++;
    const request: JoinRequest = {
      ...insertRequest,
      id,
      created_at: new Date(),
    };
    this.joinRequests.set(id, request);
    return request;
  }

  async updateJoinRequest(id: number, updates: Partial<JoinRequest>): Promise<JoinRequest | undefined> {
    const request = this.joinRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.joinRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteJoinRequest(id: number): Promise<boolean> {
    return this.joinRequests.delete(id);
  }

  // Announcement methods
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async getAnnouncementsByClan(clanId: number): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(announcement => announcement.clan_id === clanId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      created_at: new Date(),
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement = { ...announcement, ...updates };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
}

export const storage = new MemStorage();
