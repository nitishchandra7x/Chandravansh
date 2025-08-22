import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertMoodSchema,
  insertHabitSchema,
  insertHabitCompletionSchema,
  insertFitnessEntrySchema,
  insertQuizAttemptSchema,
  insertGameHistorySchema,
  insertFeedbackSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mood routes
  app.post('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moodData = insertMoodSchema.parse({ ...req.body, userId });
      const mood = await storage.createMood(moodData);
      res.json(mood);
    } catch (error) {
      console.error("Error creating mood:", error);
      res.status(500).json({ message: "Failed to create mood" });
    }
  });

  app.get('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const moods = await storage.getUserMoods(userId, limit);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching moods:", error);
      res.status(500).json({ message: "Failed to fetch moods" });
    }
  });

  app.get('/api/moods/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mood = await storage.getUserCurrentMood(userId);
      res.json(mood);
    } catch (error) {
      console.error("Error fetching current mood:", error);
      res.status(500).json({ message: "Failed to fetch current mood" });
    }
  });

  // Habit routes
  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitData = insertHabitSchema.parse({ ...req.body, userId });
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getUserHabits(userId);
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.put('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const habit = await storage.updateHabit(id, updates);
      res.json(habit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  app.delete('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHabit(id);
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  app.post('/api/habits/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: habitId } = req.params;
      const { date } = req.body;
      
      const completionData = insertHabitCompletionSchema.parse({
        habitId,
        userId,
        date: date || new Date().toISOString().split('T')[0],
      });
      
      await storage.toggleHabitCompletion(completionData);
      res.json({ message: "Habit completion toggled successfully" });
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  // Fitness routes
  app.post('/api/fitness', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fitnessData = insertFitnessEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createOrUpdateFitnessEntry(fitnessData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating fitness entry:", error);
      res.status(500).json({ message: "Failed to create fitness entry" });
    }
  });

  app.get('/api/fitness', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getUserFitnessEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching fitness entries:", error);
      res.status(500).json({ message: "Failed to fetch fitness entries" });
    }
  });

  app.get('/api/fitness/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const entry = await storage.getFitnessEntryByDate(userId, today);
      res.json(entry || { steps: 0, caloriesBurned: 0, workoutMinutes: 0 });
    } catch (error) {
      console.error("Error fetching today's fitness entry:", error);
      res.status(500).json({ message: "Failed to fetch today's fitness entry" });
    }
  });

  // Quiz routes
  app.get('/api/quiz/random', isAuthenticated, async (req: any, res) => {
    try {
      const quiz = await storage.getRandomQuiz();
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching random quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quiz/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = insertQuizAttemptSchema.parse({ ...req.body, userId });
      const attempt = await storage.createQuizAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });

  app.get('/api/quiz/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const attempts = await storage.getUserQuizAttempts(userId, limit);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  app.get('/api/quiz/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserQuizStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      res.status(500).json({ message: "Failed to fetch quiz stats" });
    }
  });

  // Game routes
  app.get('/api/game/:gameType/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameType } = req.params;
      const stats = await storage.getOrCreateGameStats(userId, gameType);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching game stats:", error);
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  app.post('/api/game/:gameType/result', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameType } = req.params;
      const { result, gameData } = req.body;
      
      const stats = await storage.updateGameStats(userId, gameType, result);
      
      const historyData = insertGameHistorySchema.parse({
        userId,
        gameType,
        result,
        gameData,
      });
      
      await storage.createGameHistory(historyData);
      
      res.json(stats);
    } catch (error) {
      console.error("Error updating game result:", error);
      res.status(500).json({ message: "Failed to update game result" });
    }
  });

  app.get('/api/game/:gameType/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameType } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await storage.getUserGameHistory(userId, gameType, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching game history:", error);
      res.status(500).json({ message: "Failed to fetch game history" });
    }
  });

  // Feedback route
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feedbackData = insertFeedbackSchema.parse({ ...req.body, userId });
      const feedback = await storage.createFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [currentMood, habits, todayFitness, quizStats] = await Promise.all([
        storage.getUserCurrentMood(userId),
        storage.getUserHabits(userId),
        storage.getFitnessEntryByDate(userId, new Date().toISOString().split('T')[0]),
        storage.getUserQuizStats(userId),
      ]);

      const longestStreak = habits.length > 0 
        ? Math.max(...habits.map(h => h.longestStreak || 0))
        : 0;

      res.json({
        currentMood: currentMood?.mood || 'neutral',
        longestStreak,
        todaySteps: todayFitness?.steps || 0,
        averageQuizScore: quizStats.averageScore,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
