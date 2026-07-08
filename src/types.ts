export interface UserProfile {
  name: string;
  avatar: string;
  passwordEnabled: boolean;
  password?: string;
  quote: string;
}

export interface CalendarAnnotation {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  updatedAt: string; // YYYY-MM-DD
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string; // YYYY-MM-DD
  category: string;
}

export interface Habit {
  id: string;
  name: string;
  daysCompleted: string[]; // List of YYYY-MM-DD strings when completed
  streak: number;
  createdAt: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetDate: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  completed: boolean;
  description?: string;
  term?: string;
  isNumeric?: boolean;
  currentCount?: number;
  targetCount?: number;
}

export interface SocialUsage {
  instagram: number; // in minutes
  tiktok: number;
  whatsapp: number;
  x: number;
}

export interface AppUsageRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  apps: Record<string, number>; // minutes per app, e.g. { instagram: 120, tiktok: 90, ... }
}

export interface BlockedAppConfig {
  appId: string;
  isBlocked: boolean;
  blockDurationMinutes?: number; // duration of blocking in minutes
  blockedUntil?: string; // ISO string timestamp when it will be unlocked automatically
}
