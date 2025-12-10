import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import '../App.css'; // Ensure we use the same vars

export default function DinoGame() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [dinoY, setDinoY] = useState(0); // 0 = ground
    const [obstacleX, setObstacleX] = useState(600); // Start off screen
    const [gameOver, setGameOver] = useState(false);

    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // Game constants
    const GRAVITY = 0.6;
    const JUMP_FORCE = 12;
    const SPEED = 5;

    // Refs for loop state to avoid closure staleness
    const stateRef = useRef({
        dinoY: 0,
        dinoVel: 0,
        obstacleX: 600,
        score: 0,
        isJumping: false
    });

    const jump = () => {
        if (stateRef.current.dinoY <= 0) { // Only jump if on ground
            stateRef.current.dinoVel = JUMP_FORCE;
            stateRef.current.isJumping = true;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!isPlaying && !gameOver) setIsPlaying(true);
                else if (gameOver) resetGame();
                else jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver]);

    const resetGame = () => {
        setGameOver(false);
        setIsPlaying(true);
        setScore(0);
        setDinoY(0);
        setObstacleX(600);
        stateRef.current = {
            dinoY: 0,
            dinoVel: 0,
            obstacleX: 600,
            score: 0,
            isJumping: false
        };
    };

    const gameLoop = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        // Not strictly used yet, assuming 60fps

        // Update Dino
        if (stateRef.current.dinoY > 0 || stateRef.current.isJumping) {
            stateRef.current.dinoY += stateRef.current.dinoVel;
            stateRef.current.dinoVel -= GRAVITY;

            if (stateRef.current.dinoY <= 0) {
                stateRef.current.dinoY = 0;
                stateRef.current.dinoVel = 0;
                stateRef.current.isJumping = false;
            }
        }

        // Update Obstacle
        stateRef.current.obstacleX -= SPEED;
        if (stateRef.current.obstacleX < -20) {
            stateRef.current.obstacleX = 600; // Reset
            stateRef.current.score += 1;
        }

        // Collision Detection
        // Dino: 40x40 roughly at (50, dinoY)
        // Obstacle: 20x40 at (obstacleX, 0)
        // Simple AABB
        const dinoLeft = 50;
        const dinoRight = 50 + 40;
        const dinoBottom = stateRef.current.dinoY;

        const obsLeft = stateRef.current.obstacleX;
        const obsRight = stateRef.current.obstacleX + 20;
        const obsTop = 40;

        if (
            dinoRight > obsLeft + 5 && // Tolerance
            dinoLeft < obsRight - 5 &&
            dinoBottom < obsTop - 5
        ) {
            setGameOver(true);
            setIsPlaying(false);
            return; // Stop loop
        }

        // Sync state for render
        setDinoY(stateRef.current.dinoY);
        setObstacleX(stateRef.current.obstacleX);
        setScore(stateRef.current.score);

        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        if (isPlaying && !gameOver) {
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, gameOver]);

    return (
        <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
            <h2>Archive Runner</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Press Space to Start/Jump
            </p>

            {/* Game Area */}
            <div
                style={{
                    width: '600px',
                    height: '150px',
                    margin: '0 auto',
                    background: '#111',
                    borderBottom: '2px solid #333',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px'
                }}
            >
                {/* Dino */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: `${dinoY}px`,
                        left: '50px',
                        width: '40px',
                        height: '40px',
                        background: 'var(--accent-gradient)',
                        borderRadius: '4px'
                    }}
                />

                {/* Obstacle */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: `${obstacleX}px`,
                        width: '20px',
                        height: '40px',
                        background: 'var(--danger-color)',
                        borderRadius: '2px'
                    }}
                />

                {/* Score */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', fontWeight: 'bold' }}>
                    {score}
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger-color)' }}>GAME OVER</span>
                        <button className="primary" onClick={resetGame}>
                            <RotateCcw size={16} /> Try Again
                        </button>
                    </div>
                )}

                {!isPlaying && !gameOver && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <button className="primary" onClick={() => setIsPlaying(true)}>
                            <Play size={16} /> Start
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
