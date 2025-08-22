import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, TrendingUp, Brain, Gamepad2, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold">
                <span className="text-orange-500">Chandra</span>
                <span className="text-green-600">vansh</span>
              </h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-sm font-medium text-gray-700">Made by Nitish Chandra</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Life with{" "}
              <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                Chandravansh
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your complete wellness and productivity companion. Track moods, build habits, 
              stay fit, challenge your mind, and achieve your goals with our beautifully designed app.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                data-testid="button-start-journey"
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 text-lg"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to help you live your best life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Mood Tracking</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Monitor your emotional well-being with intuitive mood tracking and AI-powered insights.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Emoji-based mood selection</li>
                  <li>• Visual mood timeline</li>
                  <li>• AI guidance & support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-600">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Habit Building</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create lasting positive changes with our powerful habit tracking system.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Custom habit creation</li>
                  <li>• Streak monitoring</li>
                  <li>• Progress visualization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Fitness Tracking</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Stay active and healthy with comprehensive fitness monitoring tools.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Steps & calorie tracking</li>
                  <li>• Workout logging</li>
                  <li>• Progress charts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Daily Quizzes</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Challenge your mind and expand your knowledge with engaging daily quizzes.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Multiple-choice questions</li>
                  <li>• Score tracking</li>
                  <li>• Knowledge categories</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <Gamepad2 className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Mind Games</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Exercise your brain with strategic games like our advanced Tic Tac Toe.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• AI opponent</li>
                  <li>• Game statistics</li>
                  <li>• Skill improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <Star className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Premium Features</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Unlock advanced analytics, AI coaching, and exclusive content.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Advanced AI avatars</li>
                  <li>• Detailed analytics</li>
                  <li>• Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who are already building better habits and living healthier lives.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            data-testid="button-join-now"
          >
            Join Chandravansh Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h3 className="text-xl font-bold">
              <span className="text-orange-500">Chandra</span>
              <span className="text-green-600">vansh</span>
            </h3>
          </div>
          <p className="text-gray-400 mb-4">
            Made with ❤️ by Nitish Chandra 🇮🇳
          </p>
          <p className="text-gray-500 text-sm">
            Empowering lives through technology and wellness
          </p>
        </div>
      </footer>
    </div>
  );
}
