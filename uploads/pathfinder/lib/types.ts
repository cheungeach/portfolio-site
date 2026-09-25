// Client-safe types and helpers (no database import).
export type Mode = "skip" | "focus" | "assist" | "managed";
export type Reason = { code: "DL" | "MT" | "BT" | "EZ"; why: string };
export type Job = { id: number; org: string; title: string; type: string; url: string; deadline: string; description: string; direction_hint: string };
export type ReportJob = { id: number; job: Job; score: number; reasons: Reason[]; rationale: string; storyIds: number[]; mode: Mode | null; deadlineDays: number };
export type Story = { id: number; title: string; body: string; tags: string };
export type Direction = { id: number; name: string; hint: string; rank: number; resume_id: number | null };
export type Paragraph = { text: string; storyIds: number[] };
export type Application = { id: number; job: Job; mode: Mode; status: string; paragraphs: Paragraph[]; strategy: string[]; updated_at: string };
export const STATUSES = ["drafting", "ready", "submitted", "interview", "rejected", "offer"] as const;
export function daysUntil(iso: string) { return Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86400000); }
