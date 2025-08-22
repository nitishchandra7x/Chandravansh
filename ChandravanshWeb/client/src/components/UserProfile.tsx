import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Save, Star, Coffee, Heart, Crown, Gift, Send, LogOut } from 'lucide-react';

export default function UserProfile() {
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: { rating: number; message: string }) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
      setRating(0);
      setFeedbackMessage('');
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
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitFeedbackMutation.mutate({ rating, message: feedbackMessage });
  };

  const handleDonationClick = (platform: string) => {
    toast({
      title: "Thank You!",
      description: `Redirecting to ${platform} for donation. This is a demo feature.`,
    });
  };

  const donationAmounts = [
    { amount: 50, label: 'Coffee', icon: Coffee },
    { amount: 100, label: 'Lunch', icon: Heart },
    { amount: 500, label: 'Supporter', icon: Star },
    { amount: 1000, label: 'Champion', icon: Crown },
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.email || 'User';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings ⚙️</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-saffron to-patriot rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span data-testid="text-user-initials">{getInitials(user?.firstName, user?.lastName)}</span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900" data-testid="text-user-name">
                {getFullName()}
              </h3>
              <p className="text-gray-600" data-testid="text-user-email">{user?.email || 'No email provided'}</p>
              <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input 
                value={user?.firstName || ''} 
                readOnly 
                className="bg-gray-50"
                data-testid="input-first-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input 
                value={user?.lastName || ''} 
                readOnly 
                className="bg-gray-50"
                data-testid="input-last-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input 
                value={user?.email || ''} 
                readOnly 
                className="bg-gray-50"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Input 
                value={user?.location || ''} 
                readOnly 
                placeholder="Not specified"
                className="bg-gray-50"
                data-testid="input-location"
              />
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Profile information is managed through your authentication provider.</p>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className="mb-8 bg-gradient-to-r from-saffron to-patriot text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Upgrade to Premium ⭐</h3>
              <p className="text-white/90 mb-4">Unlock advanced analytics, AI coaching, and more!</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Advanced AI Avatars
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Detailed Analytics
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Custom Habit Categories
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Priority Support
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">₹299</div>
              <div className="text-white/80 mb-4">/month</div>
              <Button
                onClick={() => handleDonationClick('Premium')}
                className="bg-white text-saffron hover:bg-gray-100 font-bold"
                data-testid="button-upgrade-premium"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Section */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Development 💝</h3>
          <p className="text-gray-600 mb-6">
            Help keep Chandravansh free and continuously improving for everyone!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {donationAmounts.map((donation) => {
              const IconComponent = donation.icon;
              return (
                <Button
                  key={donation.amount}
                  onClick={() => setSelectedDonationAmount(donation.amount)}
                  variant="outline"
                  className={`h-20 border-2 transition-all flex-col space-y-2 ${
                    selectedDonationAmount === donation.amount
                      ? 'border-saffron bg-saffron text-white'
                      : 'border-gray-200 hover:border-saffron'
                  }`}
                  data-testid={`button-donation-${donation.amount}`}
                >
                  <IconComponent className="h-6 w-6" />
                  <div>
                    <div className="text-lg font-bold">₹{donation.amount}</div>
                    <div className="text-sm">{donation.label}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => handleDonationClick('PayPal')}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              data-testid="button-donate-paypal"
            >
              <Gift className="h-4 w-4 mr-2" />
              Donate via PayPal
            </Button>
            <Button
              onClick={() => handleDonationClick('UPI')}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              data-testid="button-donate-upi"
            >
              <Gift className="h-4 w-4 mr-2" />
              Donate via UPI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Feedback 📝</h3>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    variant="ghost"
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                    data-testid={`button-rating-${star}`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
              <Textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Tell us what you think about Chandravansh..."
                rows={4}
                data-testid="textarea-feedback"
              />
            </div>
            <Button
              type="submit"
              className="bg-saffron text-white hover:bg-saffron-dark"
              disabled={submitFeedbackMutation.isPending}
              data-testid="button-submit-feedback"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h3>
          <p className="text-gray-600 mb-4">
            Need to sign out? You can always come back anytime.
          </p>
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            data-testid="button-logout-profile"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
