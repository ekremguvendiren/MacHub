import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Play, RotateCcw } from 'lucide-react';

export default function SnakeGame() {
    const CANVAS_SIZE = 400;
    const GRID_SIZE = 20;
    const SPEED = 100;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    // Direction handled by ref only
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const directionRef = useRef({ x: 0, y: 0 }); // Mutable ref for key press handling

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
                    if (!isPlaying) { setIsPlaying(true); }
                    break;
                case 'ArrowDown':
                    if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
                    if (!isPlaying) { setIsPlaying(true); }
                    break;
                case 'ArrowLeft':
                    if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
                    if (!isPlaying) { setIsPlaying(true); }
                    break;
                case 'ArrowRight':
                    if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
                    if (!isPlaying) { setIsPlaying(true); }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const moveSnake = () => {
            setSnake((prev) => {
                const newHead = {
                    x: prev[0].x + directionRef.current.x,
                    y: prev[0].y + directionRef.current.y,
                };

                // Collision with walls
                if (
                    newHead.x < 0 || newHead.x >= CANVAS_SIZE / GRID_SIZE ||
                    newHead.y < 0 || newHead.y >= CANVAS_SIZE / GRID_SIZE
                ) {
                    endGame();
                    return prev;
                }

                // Collision with self
                for (let cell of prev) {
                    if (cell.x === newHead.x && cell.y === newHead.y) {
                        endGame();
                        return prev;
                    }
                }

                const newSnake = [newHead, ...prev];
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(s => s + 10);
                    generateFood();
                } else {
                    newSnake.pop();
                }
                return newSnake;
            });
        };

        const gameInterval = setInterval(moveSnake, SPEED);
        return () => clearInterval(gameInterval);
    }, [isPlaying, gameOver, food]);

    const generateFood = () => {
        const max = CANVAS_SIZE / GRID_SIZE;
        setFood({
            x: Math.floor(Math.random() * max),
            y: Math.floor(Math.random() * max)
        });
    };

    const endGame = () => {
        setGameOver(true);
        setIsPlaying(false);
        invoke('save_high_score', { game: 'Snake', score }).catch(console.error);
    };

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setScore(0);
        setGameOver(false);
        setIsPlaying(false);
        directionRef.current = { x: 0, y: 0 };
        generateFood();
    };

    // Draw Logic
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Food
        ctx.fillStyle = '#FF453A';
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

        // Snake
        ctx.fillStyle = '#0A84FF';
        snake.forEach((cell) => {
            ctx.fillRect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });

    }, [snake, food]);

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Snake</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Use Arrow Keys to Move</p>

            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    style={{ border: '2px solid #333', borderRadius: 8 }}
                />
                {(gameOver || !isPlaying) && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                        {gameOver && <h3 style={{ color: 'var(--danger-color)', margin: 0 }}>Game Over</h3>}
                        <button className="primary" onClick={gameOver ? resetGame : () => setIsPlaying(true)}>
                            {gameOver ? <><RotateCcw size={16} /> Retry</> : <><Play size={16} /> Start</>}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
                Score: {score}
            </div>
        </div>
    );
}
