import {
  users,
  moods,
  habits,
  habitCompletions,
  fitnessEntries,
  quizzes,
  quizAttempts,
  gameStats,
  gameHistory,
  feedback,
  type User,
  type UpsertUser,
  type InsertMood,
  type Mood,
  type InsertHabit,
  type Habit,
  type InsertHabitCompletion,
  type HabitCompletion,
  type InsertFitnessEntry,
  type FitnessEntry,
  type Quiz,
  type InsertQuizAttempt,
  type QuizAttempt,
  type InsertGameStats,
  type GameStats,
  type InsertGameHistory,
  type GameHistory,
  type InsertFeedback,
  type Feedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Mood operations
  createMood(mood: InsertMood): Promise<Mood>;
  getUserMoods(userId: string, limit?: number): Promise<Mood[]>;
  getUserCurrentMood(userId: string): Promise<Mood | undefined>;

  // Habit operations
  createHabit(habit: InsertHabit): Promise<Habit>;
  getUserHabits(userId: string): Promise<Habit[]>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;
  toggleHabitCompletion(completion: InsertHabitCompletion): Promise<void>;
  getHabitCompletions(habitId: string, date: string): Promise<HabitCompletion[]>;
  updateHabitStreaks(habitId: string): Promise<void>;

  // Fitness operations
  createOrUpdateFitnessEntry(entry: InsertFitnessEntry): Promise<FitnessEntry>;
  getUserFitnessEntries(userId: string, limit?: number): Promise<FitnessEntry[]>;
  getFitnessEntryByDate(userId: string, date: string): Promise<FitnessEntry | undefined>;

  // Quiz operations
  getRandomQuiz(): Promise<Quiz | undefined>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string, limit?: number): Promise<QuizAttempt[]>;
  getUserQuizStats(userId: string): Promise<{ averageScore: number; totalQuizzes: number; streak: number }>;

  // Game operations
  getOrCreateGameStats(userId: string, gameType: string): Promise<GameStats>;
  updateGameStats(userId: string, gameType: string, result: 'win' | 'loss' | 'draw'): Promise<GameStats>;
  createGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  getUserGameHistory(userId: string, gameType: string, limit?: number): Promise<GameHistory[]>;

  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Mood operations
  async createMood(mood: InsertMood): Promise<Mood> {
    const [newMood] = await db.insert(moods).values(mood).returning();
    return newMood;
  }

  async getUserMoods(userId: string, limit = 10): Promise<Mood[]> {
    return await db
      .select()
      .from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.timestamp))
      .limit(limit);
  }

  async getUserCurrentMood(userId: string): Promise<Mood | undefined> {
    const [mood] = await db
      .select()
      .from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.timestamp))
      .limit(1);
    return mood;
  }

  // Habit operations
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(habits).values(habit).returning();
    return newHabit;
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(desc(habits.createdAt));
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    const [updatedHabit] = await db
      .update(habits)
      .set(updates)
      .where(eq(habits.id, id))
      .returning();
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async toggleHabitCompletion(completion: InsertHabitCompletion): Promise<void> {
    const existing = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, completion.habitId),
          eq(habitCompletions.date, completion.date)
        )
      );

    if (existing.length > 0) {
      await db
        .delete(habitCompletions)
        .where(eq(habitCompletions.id, existing[0].id));
    } else {
      await db.insert(habitCompletions).values(completion);
    }

    await this.updateHabitStreaks(completion.habitId);
  }

  async getHabitCompletions(habitId: string, date: string): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.date, date)
        )
      );
  }

  async updateHabitStreaks(habitId: string): Promise<void> {
    const completions = await db
      .select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, habitId))
      .orderBy(desc(habitCompletions.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Calculate current streak
    for (let i = 0; i < completions.length; i++) {
      const completion = completions[i];
      if (i === 0 && (completion.date === today || completion.date === yesterday)) {
        currentStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(completions[i - 1].date);
        const currDate = new Date(completion.date);
        const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (const completion of completions) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Reset if there's a gap (this is simplified logic)
      const nextIndex = completions.indexOf(completion) + 1;
      if (nextIndex < completions.length) {
        const nextCompletion = completions[nextIndex];
        const currDate = new Date(completion.date);
        const nextDate = new Date(nextCompletion.date);
        const diffTime = Math.abs(currDate.getTime() - nextDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          tempStreak = 0;
        }
      }
    }

    await db
      .update(habits)
      .set({
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
      })
      .where(eq(habits.id, habitId));
  }

  // Fitness operations
  async createOrUpdateFitnessEntry(entry: InsertFitnessEntry): Promise<FitnessEntry> {
    const existing = await db
      .select()
      .from(fitnessEntries)
      .where(
        and(
          eq(fitnessEntries.userId, entry.userId),
          eq(fitnessEntries.date, entry.date)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(fitnessEntries)
        .set(entry)
        .where(eq(fitnessEntries.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db.insert(fitnessEntries).values(entry).returning();
      return newEntry;
    }
  }

  async getUserFitnessEntries(userId: string, limit = 30): Promise<FitnessEntry[]> {
    return await db
      .select()
      .from(fitnessEntries)
      .where(eq(fitnessEntries.userId, userId))
      .orderBy(desc(fitnessEntries.date))
      .limit(limit);
  }

  async getFitnessEntryByDate(userId: string, date: string): Promise<FitnessEntry | undefined> {
    const [entry] = await db
      .select()
      .from(fitnessEntries)
      .where(
        and(
          eq(fitnessEntries.userId, userId),
          eq(fitnessEntries.date, date)
        )
      );
    return entry;
  }

  // Quiz operations
  async getRandomQuiz(): Promise<Quiz | undefined> {
    try {
      // Get all available quizzes
      const availableQuizzes = await db.select().from(quizzes);
      
      if (availableQuizzes.length === 0) {
        return undefined;
      }

      // Select a random quiz category
      const randomQuizIndex = Math.floor(Math.random() * availableQuizzes.length);
      const selectedQuiz = availableQuizzes[randomQuizIndex];

      // Get all questions from the selected quiz
      const allQuestions = selectedQuiz.questions as any[];
      
      if (!allQuestions || allQuestions.length === 0) {
        return undefined;
      }

      // Shuffle questions and take 5 random ones
      const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
      const randomQuestions = shuffledQuestions.slice(0, 5);

      return {
        id: selectedQuiz.id,
        title: selectedQuiz.title,
        questions: randomQuestions,
        createdAt: selectedQuiz.createdAt,
      };
    } catch (error) {
      console.error('Error fetching random quiz:', error);
      return undefined;
    }
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserQuizAttempts(userId: string, limit = 10): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(limit);
  }

  async getUserQuizStats(userId: string): Promise<{ averageScore: number; totalQuizzes: number; streak: number }> {
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));

    const totalQuizzes = attempts.length;
    const averageScore = totalQuizzes > 0 
      ? Math.round((attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions), 0) / totalQuizzes) * 100)
      : 0;

    // Calculate streak (simplified - consecutive days with quizzes)
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < attempts.length; i++) {
      const attemptDate = new Date(attempts[i].completedAt!).toDateString();
      if (i === 0) {
        if (attemptDate === today || attemptDate === new Date(Date.now() - 86400000).toDateString()) {
          streak = 1;
        }
      } else {
        const prevDate = new Date(attempts[i - 1].completedAt!);
        const currDate = new Date(attempts[i].completedAt!);
        const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return { averageScore, totalQuizzes, streak };
  }

  // Game operations
  async getOrCreateGameStats(userId: string, gameType: string): Promise<GameStats> {
    const [existing] = await db
      .select()
      .from(gameStats)
      .where(
        and(
          eq(gameStats.userId, userId),
          eq(gameStats.gameType, gameType)
        )
      );

    if (existing) {
      return existing;
    }

    const [newStats] = await db
      .insert(gameStats)
      .values({
        userId,
        gameType,
        wins: 0,
        losses: 0,
        draws: 0,
      })
      .returning();
    
    return newStats;
  }

  async updateGameStats(userId: string, gameType: string, result: 'win' | 'loss' | 'draw'): Promise<GameStats> {
    const stats = await this.getOrCreateGameStats(userId, gameType);
    
    const updates: Partial<GameStats> = {
      updatedAt: new Date(),
    };

    if (result === 'win') {
      updates.wins = (stats.wins || 0) + 1;
    } else if (result === 'loss') {
      updates.losses = (stats.losses || 0) + 1;
    } else {
      updates.draws = (stats.draws || 0) + 1;
    }

    const [updated] = await db
      .update(gameStats)
      .set(updates)
      .where(eq(gameStats.id, stats.id))
      .returning();
    
    return updated;
  }

  async createGameHistory(history: InsertGameHistory): Promise<GameHistory> {
    const [newHistory] = await db.insert(gameHistory).values(history).returning();
    return newHistory;
  }

  async getUserGameHistory(userId: string, gameType: string, limit = 10): Promise<GameHistory[]> {
    return await db
      .select()
      .from(gameHistory)
      .where(
        and(
          eq(gameHistory.userId, userId),
          eq(gameHistory.gameType, gameType)
        )
      )
      .orderBy(desc(gameHistory.playedAt))
      .limit(limit);
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }
}

export const storage = new DatabaseStorage();
