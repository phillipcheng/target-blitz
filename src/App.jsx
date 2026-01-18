import { useState, useEffect, useCallback, useRef } from 'react';

export default function ShootingGame() {
  const [gameState, setGameState] = useState('splash');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState([]);
  const [combo, setCombo] = useState(1);
  const [showHit, setShowHit] = useState(null);
  const targetIdRef = useRef(0);
  const comboTimerRef = useRef(null);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const timerRef = useRef(null);

  // Check if score goal is reached - pass level immediately
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (levelRef.current === 1 && score >= 5000) {
      // Go directly to level 2
      setScore(0);
      scoreRef.current = 0;
      setTimeLeft(20);
      setTargets([]);
      setCombo(1);
      setLevel(2);
      levelRef.current = 2;
      targetIdRef.current = 0;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    } else if (levelRef.current === 2 && score >= 7500) {
      // Go directly to level 3
      setScore(0);
      scoreRef.current = 0;
      setTimeLeft(15);
      setTargets([]);
      setCombo(1);
      setLevel(3);
      levelRef.current = 3;
      targetIdRef.current = 0;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    } else if (levelRef.current === 3 && score >= 10000) {
      setGameState('victory');
      setHighScore(h => Math.max(h, score));
    }
  }, [score, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    // Level 2 is harder, Level 3 is hardest
    const spawnRate = level === 1 ? 900 : level === 2 ? 600 : 400;
    const targetLifetime = level === 1 ? 2500 : level === 2 ? 1800 : 1200;

    const spawnTarget = () => {
      const id = targetIdRef.current++;
      const size = level === 1 
        ? (Math.random() > 0.7 ? 50 : Math.random() > 0.4 ? 65 : 80)
        : level === 2
        ? (Math.random() > 0.7 ? 40 : Math.random() > 0.4 ? 50 : 60)
        : (Math.random() > 0.7 ? 35 : Math.random() > 0.4 ? 45 : 55);
      const points = size <= 35 ? 35 : size <= 40 ? 30 : size <= 45 ? 25 : size <= 50 ? 20 : size <= 60 ? 15 : size <= 65 ? 12 : 10;
      
      setTargets(prev => [...prev, {
        id,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size,
        points,
        type: Math.random() > 0.85 ? 'bonus' : 'normal'
      }]);

      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== id));
      }, targetLifetime);
    };

    const interval = setInterval(spawnTarget, spawnRate);
    spawnTarget();
    return () => clearInterval(interval);
  }, [gameState, level]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (levelRef.current === 1) {
            if (scoreRef.current >= 5000) {
              // Should not happen - immediate pass
            } else {
              setGameState('gameOver');
              setHighScore(h => Math.max(h, scoreRef.current));
            }
          } else if (levelRef.current === 2) {
            if (scoreRef.current >= 7500) {
              // Should not happen - immediate pass
            } else {
              setGameState('gameOver');
              setHighScore(h => Math.max(h, scoreRef.current));
            }
          } else {
            if (scoreRef.current >= 10000) {
              setGameState('victory');
            } else {
              setGameState('gameOver');
            }
            setHighScore(h => Math.max(h, scoreRef.current));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  const hitTarget = (e, target) => {
    e.stopPropagation(); // Prevent miss detection
    setTargets(prev => prev.filter(t => t.id !== target.id));
    const newCombo = combo + 1;
    setCombo(newCombo);
    const multiplier = newCombo;
    const pts = target.points * multiplier * (target.type === 'bonus' ? 3 : 1);
    setScore(prev => {
      const newScore = prev + pts;
      scoreRef.current = newScore;
      return newScore;
    });
    setShowHit({ pts, x: target.x, y: target.y });
    setTimeout(() => setShowHit(null), 400);
    
    // Reset combo timer - Level 1: 3s, Level 2: 2s, Level 3: 1s
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    const comboTimeout = levelRef.current === 1 ? 3000 : levelRef.current === 2 ? 2000 : 1000;
    comboTimerRef.current = setTimeout(() => {
      setCombo(1);
    }, comboTimeout);
  };

  const startGame = () => {
    startLevel(1);
  };

  const startLevel = (lvl) => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(lvl === 1 ? 30 : lvl === 2 ? 20 : 15);
    setTargets([]);
    setCombo(1);
    setLevel(lvl);
    levelRef.current = lvl;
    targetIdRef.current = 0;
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  };

  const startNextLevel = () => {
    setGameState('playing');
    setTimeLeft(20);
    setTargets([]);
    setCombo(1);
    setLevel(2);
    levelRef.current = 2;
    targetIdRef.current = 0;
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {gameState === 'splash' && (
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎯</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            TARGET BLITZ
          </h1>
          <p className="text-gray-400 text-lg mb-8">The Ultimate Shooting Game</p>
          
          <button
            onClick={() => setGameState('menu')}
            className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-2xl font-bold rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform animate-pulse"
          >
            TAP TO START
          </button>
          
          <div className="mt-12 text-gray-500 text-sm">
            <p>🎯 Hit targets to score</p>
            <p>⭐ Bonus targets = 3x points</p>
            <p>🔥 Build combos for multipliers</p>
          </div>
        </div>
      )}

      {gameState === 'menu' && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
            Target Blitz
          </h1>
          
          <p className="text-gray-300 mb-4">Choose a Level:</p>
          
          <div className="flex flex-col gap-3 max-w-xs mx-auto mb-6">
            <button
              onClick={() => startLevel(1)}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              🟢 Level 1 <span className="text-sm font-normal">(5,000 pts / 30s)</span>
            </button>
            
            <button
              onClick={() => startLevel(2)}
              className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              🟡 Level 2 <span className="text-sm font-normal">(7,500 pts / 20s)</span>
            </button>
            
            <button
              onClick={() => startLevel(3)}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-lg font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              🔴 Level 3 <span className="text-sm font-normal">(10,000 pts / 15s)</span>
            </button>
          </div>
          
          {highScore > 0 && (
            <p className="mt-4 text-yellow-400 font-semibold">🏆 High Score: {highScore}</p>
          )}
          
          <button
            onClick={() => setGameState('splash')}
            className="mt-4 block mx-auto px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-black/50 rounded-xl px-4 py-2">
              <div className="text-gray-400 text-xs">LEVEL</div>
              <div className="text-purple-400 text-2xl font-bold">{level}</div>
            </div>
            <div className="bg-black/50 rounded-xl px-4 py-2">
              <div className="text-gray-400 text-xs">SCORE {level === 1 && <span className="text-yellow-400">/ 5000</span>}{level === 2 && <span className="text-yellow-400">/ 7500</span>}{level === 3 && <span className="text-yellow-400">/ 10000</span>}</div>
              <div className={`text-2xl font-bold ${(level === 1 && score >= 5000) || (level === 2 && score >= 7500) || (level === 3 && score >= 10000) ? 'text-green-400' : 'text-white'}`}>{score}</div>
            </div>
            <div className="bg-black/50 rounded-xl px-4 py-2">
              <div className="text-gray-400 text-xs">COMBO</div>
              <div className="text-yellow-400 text-2xl font-bold">x{combo}</div>
            </div>
            <div className="bg-black/50 rounded-xl px-4 py-2">
              <div className="text-gray-400 text-xs">TIME</div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</div>
            </div>
          </div>

          <div 
            className="relative w-full aspect-square bg-slate-800 rounded-3xl border-4 border-slate-600 overflow-hidden"
            onClick={() => setCombo(1)}
          >
            {/* Score popup */}
            {showHit && (
              <div 
                className="absolute text-2xl font-bold text-green-400 pointer-events-none z-20 animate-bounce"
                style={{ left: `${showHit.x}%`, top: `${showHit.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                +{showHit.pts}
              </div>
            )}

            {/* Targets - these are buttons you tap! */}
            {targets.map(target => (
              <button
                key={target.id}
                onClick={(e) => hitTarget(e, target)}
                className={`absolute rounded-full flex items-center justify-center font-bold text-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90 ${
                  target.type === 'bonus' 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                    : 'bg-gradient-to-br from-red-500 to-pink-600'
                }`}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: target.size,
                  height: target.size,
                  fontSize: target.size / 3
                }}
              >
                {target.type === 'bonus' ? '⭐' : target.points}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'levelComplete' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Level 1 Complete!</h2>
          <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
            {score}
          </p>
          <p className="text-gray-400 mb-6">points so far</p>
          
          <p className="text-yellow-400 text-lg mb-6">⚠️ Level 2 is harder: faster & smaller targets!</p>
          
          <button
            onClick={startNextLevel}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
          >
            START LEVEL 2
          </button>
          
          <button
            onClick={() => setGameState('menu')}
            className="block mx-auto px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Main Menu
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            {score}
          </p>
          <p className="text-gray-400 mb-2">points</p>
          
          {level === 1 && score < 5000 && (
            <p className="text-red-400 mb-4">Need 5,000 to pass Level 1</p>
          )}
          
          {level === 2 && score < 7500 && (
            <p className="text-red-400 mb-4">Need 7,500 to pass Level 2</p>
          )}
          
          {level === 3 && score < 10000 && (
            <p className="text-red-400 mb-4">Need 10,000 to pass Level 3</p>
          )}
          
          {score >= highScore && score > 0 && (
            <p className="text-yellow-400 text-xl font-bold mb-6">🎉 New High Score! 🎉</p>
          )}
          
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
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

      {gameState === 'victory' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">🎉 YOU WIN! 🎉</h2>
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
            {score}
          </p>
          <p className="text-gray-400 mb-6">points</p>
          
          {score >= highScore && score > 0 && (
            <p className="text-yellow-400 text-xl font-bold mb-6">🏆 New High Score! 🏆</p>
          )}
          
          <p className="text-green-400 text-lg mb-6">You beat all 3 levels!</p>
          
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
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
    </div>
  );
}
