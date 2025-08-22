import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Footprints, Flame, Dumbbell, Save } from 'lucide-react';

interface FitnessEntry {
  id: string;
  steps: number;
  caloriesBurned: number;
  workoutMinutes: number;
  date: string;
}

export default function FitnessTracker() {
  const [steps, setSteps] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [workoutMinutes, setWorkoutMinutes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: todayFitness } = useQuery<FitnessEntry | null>({
    queryKey: ['/api/fitness/today'],
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

  const { data: fitnessHistory = [] } = useQuery<FitnessEntry[]>({
    queryKey: ['/api/fitness'],
    queryParams: { limit: '7' },
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

  const updateFitnessMutation = useMutation({
    mutationFn: async (data: { steps: number; caloriesBurned: number; workoutMinutes: number }) => {
      const response = await apiRequest('POST', '/api/fitness', {
        ...data,
        date: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fitness/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fitness'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Fitness Data Saved!",
        description: "Your fitness activity has been recorded successfully.",
      });
      setSteps('');
      setCaloriesBurned('');
      setWorkoutMinutes('');
    },
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
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save fitness data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stepsNum = parseInt(steps) || (todayFitness?.steps || 0);
    const caloriesNum = parseInt(caloriesBurned) || (todayFitness?.caloriesBurned || 0);
    const workoutNum = parseInt(workoutMinutes) || (todayFitness?.workoutMinutes || 0);

    updateFitnessMutation.mutate({
      steps: stepsNum,
      caloriesBurned: caloriesNum,
      workoutMinutes: workoutNum,
    });
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const currentSteps = todayFitness?.steps || 0;
  const currentCalories = todayFitness?.caloriesBurned || 0;
  const currentWorkout = todayFitness?.workoutMinutes || 0;

  // Goals
  const stepsGoal = 10000;
  const caloriesGoal = 500;
  const workoutGoal = 60;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fitness Tracker 💪</h2>
        <p className="text-gray-600">Monitor your physical wellness journey</p>
      </div>

      {/* Fitness Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Steps Today</h3>
              <Footprints className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-steps-today">
              {currentSteps.toLocaleString()}
            </p>
            <Progress 
              value={getProgressPercentage(currentSteps, stepsGoal)} 
              className="mb-2 h-2"
            />
            <p className="text-sm text-gray-600">Goal: {stepsGoal.toLocaleString()} steps</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Calories Burned</h3>
              <Flame className="text-red-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-calories-burned">
              {currentCalories}
            </p>
            <Progress 
              value={getProgressPercentage(currentCalories, caloriesGoal)} 
              className="mb-2 h-2"
            />
            <p className="text-sm text-gray-600">Goal: {caloriesGoal} calories</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Workout Minutes</h3>
              <Dumbbell className="text-green-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-workout-minutes">
              {currentWorkout}
            </p>
            <Progress 
              value={getProgressPercentage(currentWorkout, workoutGoal)} 
              className="mb-2 h-2"
            />
            <p className="text-sm text-gray-600">Goal: {workoutGoal} minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Input Form */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Log Today's Activity</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
              <Input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder={currentSteps ? currentSteps.toString() : "8,547"}
                data-testid="input-steps"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burned</label>
              <Input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                placeholder={currentCalories ? currentCalories.toString() : "342"}
                data-testid="input-calories"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workout Minutes</label>
              <Input
                type="number"
                value={workoutMinutes}
                onChange={(e) => setWorkoutMinutes(e.target.value)}
                placeholder={currentWorkout ? currentWorkout.toString() : "45"}
                data-testid="input-workout-minutes"
              />
            </div>
            <div className="md:col-span-3">
              <Button
                type="submit"
                className="bg-saffron text-white hover:bg-saffron-dark"
                disabled={updateFitnessMutation.isPending}
                data-testid="button-save-fitness"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Activity
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Progress</h3>
          {fitnessHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No fitness data yet. Start logging your activities above!</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between space-x-2">
              {fitnessHistory.reverse().map((entry, index) => {
                const maxSteps = Math.max(...fitnessHistory.map(e => e.steps || 0), stepsGoal);
                const height = Math.max(((entry.steps || 0) / maxSteps) * 100, 5);
                const isToday = entry.date === today;
                
                return (
                  <div key={entry.id} className="flex flex-col items-center space-y-2 flex-1">
                    <div 
                      className={`w-full ${isToday ? 'bg-saffron' : 'bg-blue-500'} rounded-t transition-all hover:opacity-80`}
                      style={{ height: `${height}%` }}
                      title={`${entry.steps || 0} steps`}
                    ></div>
                    <span className="text-xs text-gray-600">{formatDate(entry.date)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
