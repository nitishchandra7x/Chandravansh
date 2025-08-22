import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Brain, Flame } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface QuizStats {
  averageScore: number;
  totalQuizzes: number;
  streak: number;
}

export default function DailyQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quiz } = useQuery<Quiz>({
    queryKey: ['/api/quiz/random'],
    enabled: quizStarted,
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

  const { data: quizStats } = useQuery<QuizStats>({
    queryKey: ['/api/quiz/stats'],
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

  const { data: quizHistory = [] } = useQuery<QuizAttempt[]>({
    queryKey: ['/api/quiz/attempts'],
    queryParams: { limit: '5' },
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

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { quizId: string; score: number; totalQuestions: number; answers: number[] }) => {
      const response = await apiRequest('POST', '/api/quiz/attempt', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quiz/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz/attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Quiz Complete!",
        description: "Your quiz results have been saved.",
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
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const previousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const finishQuiz = () => {
    if (!quiz) return;
    
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        score++;
      }
    });

    submitQuizMutation.mutate({
      quizId: quiz.id,
      score,
      totalQuestions: quiz.questions.length,
      answers: selectedAnswers,
    });

    setShowResults(true);
  };

  const retakeQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    queryClient.invalidateQueries({ queryKey: ['/api/quiz/random'] });
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

  const calculateScore = () => {
    if (!quiz) return { score: 0, percentage: 0 };
    
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        score++;
      }
    });
    
    return {
      score,
      percentage: Math.round((score / quiz.questions.length) * 100),
    };
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const { score, percentage } = calculateScore();

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Quiz 🧠</h2>
          <p className="text-gray-600">Challenge your mind with today's questions</p>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-saffron mr-2" />
                <div className="text-3xl font-bold text-saffron">{quizStats?.averageScore || 0}%</div>
              </div>
              <p className="text-gray-600">Average Score</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-8 w-8 text-patriot mr-2" />
                <div className="text-3xl font-bold text-patriot">{quizStats?.streak || 0}</div>
              </div>
              <p className="text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-8 w-8 text-purple-600 mr-2" />
                <div className="text-3xl font-bold text-purple-600">{quizStats?.totalQuizzes || 0}</div>
              </div>
              <p className="text-gray-600">Total Quizzes</p>
            </CardContent>
          </Card>
        </div>

        {/* Start Quiz */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for Today's Challenge?</h3>
            <p className="text-gray-600 mb-6">
              Test your knowledge with 5 carefully selected questions covering various topics.
            </p>
            <Button
              onClick={startQuiz}
              className="bg-saffron text-white hover:bg-saffron-dark text-lg px-8 py-4"
              data-testid="button-start-quiz"
            >
              <Brain className="h-5 w-5 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Quiz History */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Scores</h3>
            {quizHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No quiz attempts yet. Take your first quiz above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizHistory.map((attempt) => (
                  <div key={attempt.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Daily Quiz</p>
                      <p className="text-sm text-gray-500">{formatDate(attempt.completedAt)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-saffron">
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && quiz) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
            <p className="text-lg text-gray-600 mb-6">
              Your score: <span className="font-bold text-saffron text-2xl">{score}/{quiz.questions.length}</span>
            </p>
            <div className="text-3xl font-bold text-saffron mb-6">{percentage}%</div>
            
            {percentage >= 80 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">Excellent! You're doing great! 🌟</p>
              </div>
            )}
            
            {percentage >= 60 && percentage < 80 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">Good job! Keep practicing to improve! 💪</p>
              </div>
            )}
            
            {percentage < 60 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">Keep learning! Every attempt makes you smarter! 📚</p>
              </div>
            )}
            
            <Button
              onClick={retakeQuiz}
              className="bg-saffron text-white hover:bg-saffron-dark"
              data-testid="button-retake-quiz"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                Score: {score}/{quiz.questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6" data-testid="text-current-question">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  variant="outline"
                  className={`w-full p-4 text-left border-2 transition-colors ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-saffron bg-saffron text-white'
                      : 'border-gray-200 hover:border-saffron'
                  }`}
                  data-testid={`button-answer-${index}`}
                >
                  <span className="font-medium mr-4">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={previousQuestion}
                variant="outline"
                disabled={currentQuestionIndex === 0}
                data-testid="button-previous-question"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={finishQuiz}
                  className="bg-saffron text-white hover:bg-saffron-dark"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  data-testid="button-finish-quiz"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Finish Quiz
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="bg-saffron text-white hover:bg-saffron-dark"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  data-testid="button-next-question"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
