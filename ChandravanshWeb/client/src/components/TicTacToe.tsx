import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { RotateCcw, Trophy, Target, Users } from 'lucide-react';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

interface GameHistory {
  id: string;
  result: string;
  playedAt: string;
}

type Board = (string | null)[];
type GameResult = 'win' | 'loss' | 'draw' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [gameMessage, setGameMessage] = useState("Your turn! Make your move.");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameStats } = useQuery<GameStats>({
    queryKey: ['/api/game/tictactoe/stats'],
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

  const { data: gameHistory = [] } = useQuery<GameHistory[]>({
    queryKey: ['/api/game/tictactoe/history'],
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

  const saveGameMutation = useMutation({
    mutationFn: async (data: { result: string; gameData: any }) => {
      const response = await apiRequest('POST', '/api/game/tictactoe/result', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game/tictactoe/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game/tictactoe/history'] });
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
        description: "Failed to save game result. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check for winner
  const checkWinner = (squares: Board): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (squares: Board): boolean => {
    return squares.every(square => square !== null);
  };

  // Advanced AI using minimax algorithm
  const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(squares);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(squares)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Get best move for AI
  const getBestMove = (squares: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  // Make AI move
  const makeAIMove = (currentBoard: Board) => {
    const bestMove = getBestMove([...currentBoard]);
    if (bestMove !== -1) {
      const newBoard = [...currentBoard];
      newBoard[bestMove] = 'O';
      setBoard(newBoard);
      
      const winner = checkWinner(newBoard);
      if (winner) {
        setGameResult('loss');
        setGameMessage("AI wins! Better luck next time.");
        saveGameMutation.mutate({
          result: 'loss',
          gameData: { board: newBoard, winner: 'O' }
        });
      } else if (isBoardFull(newBoard)) {
        setGameResult('draw');
        setGameMessage("It's a draw! Great game!");
        saveGameMutation.mutate({
          result: 'draw',
          gameData: { board: newBoard, winner: null }
        });
      } else {
        setIsPlayerTurn(true);
        setGameMessage("Your turn! Make your move.");
      }
    }
  };

  // Handle player move
  const makeMove = (index: number) => {
    if (board[index] || gameResult || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    setGameMessage("AI is thinking...");

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameResult('win');
      setGameMessage("Congratulations! You win!");
      saveGameMutation.mutate({
        result: 'win',
        gameData: { board: newBoard, winner: 'X' }
      });
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameResult('draw');
      setGameMessage("It's a draw! Great game!");
      saveGameMutation.mutate({
        result: 'draw',
        gameData: { board: newBoard, winner: null }
      });
      return;
    }

    // AI move after a short delay for better UX
    setTimeout(() => {
      makeAIMove(newBoard);
    }, 500);
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameResult(null);
    setGameMessage("Your turn! Make your move.");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    
    return date.toLocaleDateString();
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-600';
      case 'loss': return 'text-red-600';
      case 'draw': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'Win';
      case 'loss': return 'Loss';
      case 'draw': return 'Draw';
      default: return result;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tic Tac Toe 🎮</h2>
        <p className="text-gray-600">Challenge the AI in this classic strategy game</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-green-600 mr-2" />
              <div className="text-3xl font-bold text-green-600">{gameStats?.wins || 0}</div>
            </div>
            <p className="text-gray-600">Wins</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-red-600 mr-2" />
              <div className="text-3xl font-bold text-red-600">{gameStats?.losses || 0}</div>
            </div>
            <p className="text-gray-600">Losses</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-yellow-600 mr-2" />
              <div className="text-3xl font-bold text-yellow-600">{gameStats?.draws || 0}</div>
            </div>
            <p className="text-gray-600">Draws</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Interface */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-900">
              Current Player: <span className={isPlayerTurn ? "text-saffron" : "text-patriot"}>
                {isPlayerTurn ? "You (X)" : "AI (O)"}
              </span>
            </div>
            <Button
              onClick={resetGame}
              variant="outline"
              className="hover:bg-gray-50"
              data-testid="button-reset-game"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Game
            </Button>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            {board.map((cell, index) => (
              <Button
                key={index}
                onClick={() => makeMove(index)}
                variant="outline"
                className={`aspect-square text-4xl font-bold border-2 transition-all hover:bg-gray-50 ${
                  cell === 'X' ? 'text-saffron' : cell === 'O' ? 'text-patriot' : ''
                }`}
                disabled={!!cell || gameResult !== null || !isPlayerTurn}
                data-testid={`button-cell-${index}`}
              >
                {cell}
              </Button>
            ))}
          </div>

          <div className="text-center text-lg font-medium text-gray-600" data-testid="text-game-message">
            {gameMessage}
          </div>

          {gameResult && (
            <div className="mt-6 text-center">
              <div className="text-6xl mb-4">
                {gameResult === 'win' ? '🎉' : gameResult === 'loss' ? '😔' : '🤝'}
              </div>
              <Button
                onClick={resetGame}
                className="bg-saffron text-white hover:bg-saffron-dark"
                data-testid="button-play-again"
              >
                Play Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game History */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Games</h3>
          {gameHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No games played yet. Start your first game above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gameHistory.map((game) => (
                <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">vs AI</p>
                    <p className="text-sm text-gray-500">{formatDate(game.playedAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getResultColor(game.result)}`}>
                      {getResultText(game.result)}
                    </div>
                    <div className="text-sm text-gray-500">X vs O</div>
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
