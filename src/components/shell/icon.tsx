"use client";

import {
  LayoutDashboard, Target, ClipboardCheck, LineChart, Banknote, Trophy, CalendarCheck,
  PlaneTakeoff, HandCoins, Receipt, FolderOpen, Wallet, LifeBuoy, MessageSquareWarning,
  User, Inbox, Users, UserPlus, GraduationCap, BadgeCheck, ArrowLeftRight, DoorOpen,
  Award, Headphones, ListChecks, Boxes, UtensilsCrossed, ShieldCheck, BarChart3,
  Megaphone, BookText, Contact, Building2, UserCog, SlidersHorizontal, Layers,
  GitBranch, FileStack, ScrollText, History, FileText, Activity, Sparkles, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Target, ClipboardCheck, LineChart, Banknote, Trophy, CalendarCheck,
  PlaneTakeoff, HandCoins, Receipt, FolderOpen, Wallet, LifeBuoy, MessageSquareWarning,
  User, Inbox, Users, UserPlus, GraduationCap, BadgeCheck, ArrowLeftRight, DoorOpen,
  Award, Headphones, ListChecks, Boxes, UtensilsCrossed, ShieldCheck, BarChart3,
  Megaphone, BookText, Contact, Building2, UserCog, SlidersHorizontal, Layers,
  GitBranch, FileStack, ScrollText, History, FileText, Activity, Sparkles,
};

export function NavIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && MAP[name]) || LayoutDashboard;
  return <Icon className={className} />;
}
