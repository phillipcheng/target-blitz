import { useState, useEffect, useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Safe haptic feedback (works on iOS, gracefully fails on web)
const hapticFeedback = async (style = 'medium') => {
  try {
    if (style === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (style === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch (e) {
    // Haptics not available (web browser)
  }
};

export default function ShootingGame() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('targetBlitzHighScore') || '0');
    } catch {
      return 0;
    }
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState([]);
  const [shots, setShots] = useState([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const gameAreaRef = useRef(null);
  const targetIdRef = useRef(0);

  // Save high score
  useEffect(() => {
    try {
      localStorage.setItem('targetBlitzHighScore', highScore.toString());
    } catch {
      // localStorage not available
    }
  }, [highScore]);

  // Spawn targets
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnTarget = () => {
      const id = targetIdRef.current++;
      const size = Math.random() > 0.7 ? 40 : Math.random() > 0.4 ? 55 : 70;
      const points = size === 40 ? 30 : size === 55 ? 20 : 10;
      const speed = 2000 + Math.random() * 2000;
      
      const newTarget = {
        id,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 70,
        size,
        points,
        speed,
        createdAt: Date.now(),
        type: Math.random() > 0.85 ? 'bonus' : 'normal'
      };

      setTargets(prev => [...prev, newTarget]);

      // Auto-remove after speed duration
      setTimeout(() => {
        setTargets(prev => {
          const target = prev.find(t => t.id === id);
          if (target) {
            setCombo(0);
          }
          return prev.filter(t => t.id !== id);
        });
      }, speed);
    };

    const interval = setInterval(spawnTarget, 800);
    spawnTarget();

    return () => clearInterval(interval);
  }, [gameState]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          setHighScore(h => Math.max(h, score));
          hapticFeedback('heavy');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score]);

  const handleShoot = useCallback((e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Add shot effect
    const shotId = Date.now();
    setShots(prev => [...prev, { id: shotId, x, y }]);
    setTimeout(() => setShots(prev => prev.filter(s => s.id !== shotId)), 200);

    // Check for hits
    let hitTarget = null;
    setTargets(prev => {
      for (const target of prev) {
        const targetCenterX = target.x;
        const targetCenterY = target.y;
        const distance = Math.sqrt(
          Math.pow(x - targetCenterX, 2) + Math.pow(y - targetCenterY, 2)
        );
        
        const hitRadius = (target.size / rect.width) * 100 * 1.2;
        
        if (distance < hitRadius) {
          hitTarget = target;
          break;
        }
      }
      
      if (hitTarget) {
        return prev.filter(t => t.id !== hitTarget.id);
      }
      return prev;
    });

    if (hitTarget) {
      hapticFeedback(hitTarget.type === 'bonus' ? 'heavy' : 'medium');
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboMultiplier = Math.min(newCombo, 5);
      const points = hitTarget.points * comboMultiplier * (hitTarget.type === 'bonus' ? 3 : 1);
      setScore(prev => prev + points);
      
      if (newCombo >= 3) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 500);
      }
    } else {
      hapticFeedback('light');
      setCombo(0);
    }
  }, [gameState, combo]);

  const startGame = () => {
    hapticFeedback('medium');
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
    targetIdRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 select-none safe-area-inset">
      {gameState === 'menu' && (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">🎯</h1>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            Target Blitz
          </h1>
          <p className="text-gray-300 mb-8 max-w-xs mx-auto">
            Tap targets to score points! Smaller targets = more points. Build combos for multipliers!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform"
          >
            START GAME
          </button>
          {highScore > 0 && (
            <p className="mt-6 text-yellow-400 font-semibold">
              🏆 High Score: {highScore}
            </p>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-lg">
          {/* HUD */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="bg-black/40 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-gray-400 text-sm">SCORE</span>
              <p className="text-white text-2xl font-bold">{score}</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur rounded-xl px-4 py-2 text-center">
              <span className="text-gray-400 text-sm">COMBO</span>
              <p className="text-yellow-400 text-2xl font-bold">x{Math.min(combo, 5)}</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-gray-400 text-sm">TIME</span>
              <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </p>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            onClick={handleShoot}
            onTouchStart={handleShoot}
            className="relative w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl cursor-crosshair"
            style={{ touchAction: 'none' }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${(i + 1) * 16.6}%` }} />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute h-full w-px bg-white" style={{ left: `${(i + 1) * 16.6}%` }} />
              ))}
            </div>

            {/* Combo indicator */}
            {showCombo && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-yellow-400 animate-ping pointer-events-none z-20">
                x{Math.min(combo, 5)}
              </div>
            )}

            {/* Targets */}
            {targets.map(target => (
              <div
                key={target.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  animation: 'pulse 0.5s ease-in-out infinite alternate'
                }}
              >
                <div
                  className={`rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                    target.type === 'bonus' 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50' 
                      : 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/50'
                  }`}
                  style={{
                    width: target.size,
                    height: target.size,
                    fontSize: target.size / 3
                  }}
                >
                  <div className="absolute inset-2 rounded-full border-2 border-white/30" />
                  <div className="absolute inset-4 rounded-full bg-white/20" />
                  {target.type === 'bonus' ? '⭐' : target.points}
                </div>
              </div>
            ))}

            {/* Shot effects */}
            {shots.map(shot => (
              <div
                key={shot.id}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
              >
                <div className="w-full h-full rounded-full bg-white/80 animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center text-lg">💥</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            {score}
          </p>
          <p className="text-gray-400 mb-6">points</p>
          
          {score >= highScore && score > 0 && (
            <p className="text-yellow-400 text-xl font-bold mb-6 animate-bounce">
              🎉 New High Score! 🎉
            </p>
          )}
          
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform mb-4"
          >
            PLAY AGAIN
          </button>
          
          <button
            onClick={() => setGameState('menu')}
            className="block mx-auto px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Main Menu
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, -50%) scale(1.1); }
        }
        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      `}</style>
    </div>
  );
}
