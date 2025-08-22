import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description: string;
  currentStreak: number;
  longestStreak: number;
}

export default function HabitTracker() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
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

  const createHabitMutation = useMutation({
    mutationFn: async (habitData: { name: string; description: string }) => {
      const response = await apiRequest('POST', '/api/habits', habitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Habit Created!",
        description: "Your new habit has been added successfully.",
      });
      setShowAddModal(false);
      resetForm();
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
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, ...habitData }: { id: string; name: string; description: string }) => {
      const response = await apiRequest('PUT', `/api/habits/${id}`, habitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit Updated!",
        description: "Your habit has been updated successfully.",
      });
      setEditingHabit(null);
      resetForm();
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
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/habits/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Habit Deleted!",
        description: "Your habit has been deleted successfully.",
      });
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
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date?: string }) => {
      const response = await apiRequest('POST', `/api/habits/${habitId}/toggle`, { date });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Habit Updated!",
        description: "Habit completion status updated.",
      });
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
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setHabitName('');
    setHabitDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    if (editingHabit) {
      updateHabitMutation.mutate({
        id: editingHabit.id,
        name: habitName,
        description: habitDescription,
      });
    } else {
      createHabitMutation.mutate({
        name: habitName,
        description: habitDescription,
      });
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setHabitDescription(habit.description);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingHabit(null);
    resetForm();
  };

  const handleToggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    toggleHabitMutation.mutate({ habitId, date: today });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Habit Tracker 🎯</h2>
          <p className="text-gray-600">Build consistency, one day at a time</p>
        </div>
        <Dialog open={showAddModal || !!editingHabit} onOpenChange={(open) => !open && handleCancel()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-saffron text-white hover:bg-saffron-dark"
              data-testid="button-add-habit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
                <Input
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  data-testid="input-habit-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={habitDescription}
                  onChange={(e) => setHabitDescription(e.target.value)}
                  placeholder="Describe your habit..."
                  rows={3}
                  data-testid="textarea-habit-description"
                />
              </div>
              <DialogFooter className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel-habit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-saffron text-white hover:bg-saffron-dark"
                  disabled={createHabitMutation.isPending || updateHabitMutation.isPending}
                  data-testid="button-save-habit"
                >
                  {editingHabit ? 'Update Habit' : 'Add Habit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet!</h3>
            <p className="text-gray-600 mb-4">Start building better habits by adding your first one.</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-saffron text-white hover:bg-saffron-dark"
              data-testid="button-add-first-habit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id} className="card-hover" data-testid={`card-habit-${habit.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-gray-600 text-sm">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(habit)}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid={`button-edit-habit-${habit.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHabitMutation.mutate(habit.id)}
                      className="text-gray-400 hover:text-red-600"
                      data-testid={`button-delete-habit-${habit.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Streak</span>
                    <span className="text-lg font-bold text-saffron" data-testid={`text-streak-${habit.id}`}>
                      {habit.currentStreak} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="habit-streak h-2 rounded-full" 
                      style={{ width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Best streak: {habit.longestStreak} days
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today</span>
                  <Switch
                    checked={false} // This would need to be determined by checking today's completions
                    onCheckedChange={() => handleToggleHabit(habit.id)}
                    className="data-[state=checked]:bg-saffron"
                    data-testid={`switch-habit-${habit.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
