import { z } from "zod";

// Exam types
export type ExamType = "JEE" | "NEET";
export type ClassLevel = "11" | "12";
export type WeightageLevel = "high" | "medium" | "low";
export type DifficultyLevel = "easy" | "medium" | "advanced";
export type QuizLevel = "beginner" | "medium" | "tough";

// Subject Schema
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  exams: ExamType[];
  totalChapters: number;
  completedChapters: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  classLevel: ClassLevel;
  weightage: WeightageLevel;
  order: number;
  isCompleted: boolean;
  progress: number;
}

export interface ChapterContent {
  id: string;
  chapterId: string;
  concepts: ContentBlock[];
  definitions: ContentBlock[];
  formulas: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  title: string;
  content: string;
  type: "concept" | "definition" | "formula";
}

export interface KeyHighlight {
  id: string;
  chapterId: string;
  content: string;
  type: "important" | "formula" | "trap" | "tip";
  examRelevance: ExamType[];
}

export interface VideoOverview {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  type: "mcq" | "numerical" | "assertion-reason";
}

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
}

export interface LevelBasedQuiz {
  id: string;
  chapterId: string;
  title: string;
  levels: {
    beginner: QuizQuestion[];
    medium: QuizQuestion[];
    tough: QuizQuestion[];
  };
  timeLimitPerLevel: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  completedAt: string;
}

export interface Flashcard {
  id: string;
  chapterId: string;
  front: string;
  back: string;
  type: "definition" | "formula" | "reaction" | "concept";
  difficulty: DifficultyLevel;
}

export interface AudioOverview {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  chapterId: string;
  level: QuizLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
}

export interface LeaderboardStats {
  totalAttempts: number;
  averageScore: number;
  topPerformers: LeaderboardEntry[];
}

// Insert schemas
export const insertSubjectSchema = z.object({
  name: z.string().min(1),
  icon: z.string(),
  color: z.string(),
  exams: z.array(z.enum(["JEE", "NEET"])),
  totalChapters: z.number(),
  completedChapters: z.number().default(0),
});

export const insertChapterSchema = z.object({
  subjectId: z.string(),
  name: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
  weightage: z.enum(["high", "medium", "low"]),
  order: z.number(),
  isCompleted: z.boolean().default(false),
  progress: z.number().default(0),
});

export const insertQuizAnswerSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.number(),
  })),
});

export const insertLeaderboardEntrySchema = z.object({
  username: z.string().min(1).max(20),
  chapterId: z.string(),
  level: z.enum(["beginner", "medium", "tough"]),
  score: z.number().min(0),
  totalQuestions: z.number().min(1),
  timeTaken: z.number().min(0),
});

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;

// Keep existing user schema
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
