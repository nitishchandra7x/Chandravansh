import { useEffect } from 'react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-saffron via-white to-patriot">
      <div className="text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-glow drop-shadow-lg">
          Chandravansh
        </h1>
        <p className="text-lg md:text-xl text-white font-medium drop-shadow-md">
          Made by Nitish Chandra 🇮🇳
        </p>
        <div className="mt-6 animate-bounce">
          <div className="text-white text-3xl">🪷</div>
        </div>
      </div>
    </div>
  );
}
