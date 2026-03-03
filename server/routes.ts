import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeaderboardEntrySchema, type QuizLevel } from "@shared/schema";
import { getAIChatResponse, generateInstantQuiz, isOpenAIConfigured } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  // Get single subject
  app.get("/api/subjects/:subjectId", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.subjectId);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subject" });
    }
  });

  // Get chapters for a subject
  app.get("/api/subjects/:subjectId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChaptersBySubject(req.params.subjectId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  // Get single chapter
  app.get("/api/chapters/:chapterId", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  // Get chapter content
  app.get("/api/chapters/:chapterId/content", async (req, res) => {
    try {
      const content = await storage.getChapterContent(req.params.chapterId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get quiz (legacy)
  app.get("/api/chapters/:chapterId/quiz", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.chapterId);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  // Get level-based quiz
  app.get("/api/chapters/:chapterId/level-quiz", async (req, res) => {
    try {
      const quiz = await storage.getLevelBasedQuiz(req.params.chapterId);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch level-based quiz" });
    }
  });

  // Get flashcards
  app.get("/api/chapters/:chapterId/flashcards", async (req, res) => {
    try {
      const flashcards = await storage.getFlashcards(req.params.chapterId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  // Get leaderboard for a chapter
  app.get("/api/leaderboard/:chapterId", async (req, res) => {
    try {
      const level = req.query.level as QuizLevel | undefined;
      const entries = await storage.getLeaderboard(req.params.chapterId, level);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get top performers across all quizzes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const entries = await storage.getTopPerformers(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top performers" });
    }
  });

  // Submit a leaderboard entry
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const parseResult = insertLeaderboardEntrySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid data", details: parseResult.error.errors });
      }
      const entry = await storage.addLeaderboardEntry(parseResult.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  // Check if AI is configured
  app.get("/api/ai/status", (req, res) => {
    res.json({ configured: isOpenAIConfigured() });
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!isOpenAIConfigured()) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "Please add your OpenAI API key to enable AI chat features."
        });
      }

      const { message, chapterId, chapterName, subjectName, conversationHistory } = req.body;
      
      if (!message || !chapterId || !chapterName || !subjectName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const response = await getAIChatResponse({
        message,
        chapterId,
        chapterName,
        subjectName,
        conversationHistory: conversationHistory || []
      });

      res.json({ response });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      const errorMessage = error?.message?.includes("Invalid OpenAI API key") 
        ? "The OpenAI API key appears to be invalid. Please check your API key in the Secrets tab."
        : "Failed to get AI response. Please try again.";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Generate instant quiz
  app.post("/api/ai/quiz", async (req, res) => {
    try {
      if (!isOpenAIConfigured()) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "Please add your OpenAI API key to enable instant quiz generation."
        });
      }

      const { chapterId, chapterName, subjectName, topic, count } = req.body;
      
      if (!chapterId || !chapterName || !subjectName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const questions = await generateInstantQuiz({
        chapterId,
        chapterName,
        subjectName,
        topic,
        count: count || 10
      });

      res.json({ questions });
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      const errorMessage = error?.message?.includes("Invalid OpenAI API key") 
        ? "The OpenAI API key appears to be invalid. Please check your API key in the Secrets tab."
        : "Failed to generate quiz. Please try again.";
      res.status(500).json({ error: errorMessage });
    }
  });

  return httpServer;
}
