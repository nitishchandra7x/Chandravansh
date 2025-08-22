import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface Mood {
  id: string;
  mood: string;
  timestamp: string;
}

const moodOptions = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'border-yellow-500 hover:border-yellow-500 focus:border-yellow-500 focus:ring-yellow-200' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'border-blue-500 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-200' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'border-gray-500 hover:border-gray-500 focus:border-gray-500 focus:ring-gray-200' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-200' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: 'border-green-500 hover:border-green-500 focus:border-green-500 focus:ring-green-200' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'border-purple-500 hover:border-purple-500 focus:border-purple-500 focus:ring-purple-200' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'border-blue-400 hover:border-blue-400 focus:border-blue-400 focus:ring-blue-200' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'border-pink-500 hover:border-pink-500 focus:border-pink-500 focus:ring-pink-200' },
];

const getAIGuidance = (mood: string): string => {
  const guidance: Record<string, string> = {
    happy: "You're radiating positivity today! Channel this energy into achieving your goals and spreading joy to others around you.",
    sad: "It's okay to feel sad sometimes. Take some time for self-care, reach out to loved ones, or try gentle activities that bring you comfort.",
    neutral: "A balanced state of mind is valuable. Use this stability to focus on important tasks or plan for upcoming goals.",
    angry: "Take a deep breath and count to ten. Try some physical exercise or journaling to channel this energy positively.",
    excited: "Your enthusiasm is contagious! Use this high energy to tackle challenging projects or try something new you've been putting off.",
    anxious: "Practice deep breathing exercises. Break down overwhelming tasks into smaller steps and remember that you've overcome challenges before.",
    calm: "This peaceful state is perfect for meditation, creative activities, or making important decisions with clarity.",
    grateful: "Gratitude is powerful! Consider writing down three things you're thankful for or expressing appreciation to someone special.",
  };
  
  return guidance[mood] || "Take a moment to check in with yourself and practice mindfulness.";
};

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moods = [] } = useQuery<Mood[]>({
    queryKey: ['/api/moods'],
    queryParams: { limit: '10' },
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

  const createMoodMutation = useMutation({
    mutationFn: async (mood: string) => {
      const response = await apiRequest('POST', '/api/moods', { mood });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Mood Logged!",
        description: "Your mood has been recorded successfully.",
      });
      setSelectedMood('');
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
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    createMoodMutation.mutate(moodId);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getMoodColor = (mood: string) => {
    const option = moodOptions.find(opt => opt.id === mood);
    return option?.color || 'border-gray-300';
  };

  const getMoodEmoji = (mood: string) => {
    const option = moodOptions.find(opt => opt.id === mood);
    return option?.emoji || '😐';
  };

  const latestMood = moods[0];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How are you feeling? 💝</h2>
        <p className="text-gray-600">Track your emotions and see your mood patterns</p>
      </div>

      {/* Mood Selection */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Your Current Mood</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moodOptions.map((mood) => (
              <Button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                variant="outline"
                className={`h-24 mood-button border-2 border-gray-200 hover:scale-105 transition-all ${mood.color} flex-col space-y-2`}
                disabled={createMoodMutation.isPending}
                data-testid={`button-mood-${mood.id}`}
              >
                <div className="text-4xl">{mood.emoji}</div>
                <p className="font-medium text-gray-900">{mood.label}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Guidance */}
      {latestMood && (
        <Card className="mb-8 bg-gradient-to-r from-saffron to-patriot text-white">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">🧘‍♂️</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Guidance</h3>
                <p className="text-white/90" data-testid="text-ai-guidance">
                  {getAIGuidance(latestMood.mood)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Timeline */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Mood Timeline</h3>
          {moods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No mood entries yet. Start by selecting your current mood above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moods.map((mood) => (
                <div 
                  key={mood.id} 
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  data-testid={`mood-entry-${mood.id}`}
                >
                  <div className="text-2xl">{getMoodEmoji(mood.mood)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{mood.mood}</p>
                    <p className="text-sm text-gray-500">{formatDate(mood.timestamp)}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getMoodColor(mood.mood).replace('border-', 'bg-').replace('hover:', '').replace('focus:', '').split(' ')[0]}`}></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
