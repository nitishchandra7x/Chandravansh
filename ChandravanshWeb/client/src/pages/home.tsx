import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import MoodTracker from '@/components/MoodTracker';
import HabitTracker from '@/components/HabitTracker';
import FitnessTracker from '@/components/FitnessTracker';
import DailyQuiz from '@/components/DailyQuiz';
import TicTacToe from '@/components/TicTacToe';
import UserProfile from '@/components/UserProfile';
import Splash from './splash';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Target, TrendingUp, Brain, Smile, Flame, Footprints, Trophy } from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';

type Section = 'dashboard' | 'mood' | 'habits' | 'fitness' | 'quiz' | 'game' | 'profile';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user && !showSplash,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-saffron"></div>
      </div>
    );
  }

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      angry: '😠',
      excited: '🤩',
      anxious: '😰',
      calm: '😌',
      grateful: '🙏'
    };
    return moodMap[mood] || '😐';
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 🌟</h2>
        <p className="text-gray-600">Here's your wellness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover border-l-4 border-l-saffron">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Mood</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-current-mood">
                  {getMoodEmoji(dashboardStats?.currentMood || 'neutral')} {dashboardStats?.currentMood || 'Neutral'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Smile className="text-yellow-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-patriot">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Habit Streak</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-habit-streak">
                  {dashboardStats?.longestStreak || 0} days
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Flame className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Steps</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-today-steps">
                  {dashboardStats?.todaySteps?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Footprints className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-quiz-score">
                  {dashboardStats?.averageQuizScore || 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Trophy className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentSection('mood')}
                className="h-20 bg-gradient-to-r from-saffron to-saffron-light text-white hover:shadow-lg transition-all flex-col space-y-2"
                data-testid="button-log-mood"
              >
                <Heart className="h-6 w-6" />
                <span className="font-medium">Log Mood</span>
              </Button>
              <Button
                onClick={() => setCurrentSection('habits')}
                className="h-20 bg-gradient-to-r from-patriot to-patriot-light text-white hover:shadow-lg transition-all flex-col space-y-2"
                data-testid="button-check-habits"
              >
                <Target className="h-6 w-6" />
                <span className="font-medium">Check Habits</span>
              </Button>
              <Button
                onClick={() => setCurrentSection('fitness')}
                className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all flex-col space-y-2"
                data-testid="button-log-workout"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-medium">Log Workout</span>
              </Button>
              <Button
                onClick={() => setCurrentSection('quiz')}
                className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all flex-col space-y-2"
                data-testid="button-take-quiz"
              >
                <Brain className="h-6 w-6" />
                <span className="font-medium">Take Quiz</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Chandravansh!</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Your complete wellness and productivity companion is ready to help you achieve your goals.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-saffron rounded-full"></div>
                  <span>Track your moods and get AI guidance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-patriot rounded-full"></div>
                  <span>Build lasting habits with streak tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Monitor your fitness and stay active</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Challenge your mind with daily quizzes</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'mood':
        return <MoodTracker />;
      case 'habits':
        return <HabitTracker />;
      case 'fitness':
        return <FitnessTracker />;
      case 'quiz':
        return <DailyQuiz />;
      case 'game':
        return <TicTacToe />;
      case 'profile':
        return <UserProfile />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        userName={user?.firstName || 'User'}
      />
      <main className="animate-slide-up">
        {renderContent()}
      </main>
    </div>
  );
}
