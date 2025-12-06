'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { Rocket, Trash, Play } from 'lucide-react';

export default function ArcadePage() {
    const [playing, setPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game state refs for loop
    const gameState = useRef({
        playerX: 250,
        bullets: [] as { x: number, y: number }[],
        enemies: [] as { x: number, y: number, type: number }[],
        score: 0,
        frames: 0
    });

    useEffect(() => {
        // Load high score
        const saved = localStorage.getItem('arcade_highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    useEffect(() => {
        if (!playing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        gameState.current = {
            playerX: canvas.width / 2,
            bullets: [],
            enemies: [],
            score: 0,
            frames: 0
        };
        setScore(0);
        setGameOver(false);

        let animationId: number;

        const loop = () => {
            gameState.current.frames++;

            // Update
            // Spawn enemies
            if (gameState.current.frames % 60 === 0) {
                gameState.current.enemies.push({
                    x: Math.random() * (canvas.width - 40),
                    y: -40,
                    type: Math.floor(Math.random() * 3)
                });
            }

            // Move bullets
            gameState.current.bullets.forEach(b => b.y -= 5);
            gameState.current.bullets = gameState.current.bullets.filter(b => b.y > -20);

            // Move enemies
            gameState.current.enemies.forEach(e => e.y += 2);

            // Collision detection
            gameState.current.bullets.forEach((b, bIdx) => {
                gameState.current.enemies.forEach((e, eIdx) => {
                    const dx = b.x - e.x;
                    const dy = b.y - e.y;
                    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                        // Hit
                        gameState.current.enemies.splice(eIdx, 1);
                        gameState.current.bullets.splice(bIdx, 1);
                        gameState.current.score += 10;
                        setScore(gameState.current.score);
                    }
                });
            });

            // Game Over check
            gameState.current.enemies.forEach(e => {
                if (e.y > canvas.height) {
                    setPlaying(false);
                    setGameOver(true);
                    endGame();
                }
            });

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Player
            ctx.fillStyle = '#007aff';
            ctx.fillRect(gameState.current.playerX - 20, canvas.height - 50, 40, 40);

            // Bullets
            ctx.fillStyle = '#ff3b30';
            gameState.current.bullets.forEach(b => {
                ctx.fillRect(b.x - 2, b.y, 4, 10);
            });

            // Enemies
            ctx.fillStyle = '#8e8e93';
            gameState.current.enemies.forEach(e => {
                ctx.fillRect(e.x, e.y, 30, 30);
            });

            if (playing) {
                animationId = requestAnimationFrame(loop);
            }
        };

        loop();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') gameState.current.playerX = Math.max(20, gameState.current.playerX - 20);
            if (e.key === 'ArrowRight') gameState.current.playerX = Math.min(canvas.width - 20, gameState.current.playerX + 20);
            if (e.key === ' ') {
                gameState.current.bullets.push({ x: gameState.current.playerX, y: canvas.height - 60 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [playing]);

    const endGame = () => {
        const currentScore = gameState.current.score;
        if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem('arcade_highscore', currentScore.toString());
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Arcade Cleanup</h1>
                <p className={styles.subtitle}>Blast away junk files to clean your mental cache!</p>
            </header>

            <div className={styles.gameArea}>
                <div className={styles.stats}>
                    <div className={styles.scoreBlock}>
                        <span>Score</span>
                        <span className={styles.scoreValue}>{score}</span>
                    </div>
                    <div className={styles.scoreBlock}>
                        <span>Best</span>
                        <span className={styles.scoreValue}>{highScore}</span>
                    </div>
                </div>

                <div className={styles.canvasContainer}>
                    <canvas ref={canvasRef} width={500} height={400} className={styles.canvas} />

                    {!playing && (
                        <div className={styles.overlay}>
                            {gameOver && <h2>Game Over!</h2>}
                            <button className={styles.playBtn} onClick={() => setPlaying(true)}>
                                <Play fill="currentColor" /> {gameOver ? 'Try Again' : 'Start Game'}
                            </button>
                            <p className={styles.instructions}>Use Arrows to Move, Space to Shoot</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
