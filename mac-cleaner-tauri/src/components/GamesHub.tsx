import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Gamepad2, Trophy, Play } from 'lucide-react';
import '../App.css';
import DinoGame from './DinoGame';
import TicTacToe from './TicTacToe';
// import MemoryMatch from './MemoryMatch';
import SnakeGame from './SnakeGame';

interface HighScore {
    game: string;
    score: number;
    date: string;
}

export default function GamesHub() {
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [highScores, setHighScores] = useState<HighScore[]>([]);

    useEffect(() => {
        fetchScores();
    }, [activeGame]);

    const fetchScores = async () => {
        try {
            const scores = await invoke<HighScore[]>('get_high_scores');
            setHighScores(scores);
        } catch (e) {
            console.error("Failed to load scores", e);
        }
    };

    const games = [
        { id: 'dino', name: 'Archive Runner', description: 'Jump over obstacles and survive.' },
        { id: 'tictactoe', name: 'Tic-Tac-Toe', description: 'Classic strategy game.' },
        { id: 'snake', name: 'Snake', description: 'Eat apples, grow long, don\'t crash.' },
        // { id: 'memory', name: 'Memory Match', description: 'Flip cards to find pairs.' },
    ];

    if (activeGame === 'dino') {
        return (
            <div>
                <button className="primary" onClick={() => setActiveGame(null)} style={{ marginBottom: 20 }}>
                    ← Back to Arcade
                </button>
                <DinoGame />
            </div>
        );
    }

    if (activeGame === 'tictactoe') {
        return (
            <div>
                <button className="primary" onClick={() => setActiveGame(null)} style={{ marginBottom: 20 }}>
                    ← Back to Arcade
                </button>
                <TicTacToe />
            </div>
        )
    }

    if (activeGame === 'snake') {
        return (
            <div>
                <button className="primary" onClick={() => setActiveGame(null)} style={{ marginBottom: 20 }}>
                    ← Back to Arcade
                </button>
                <SnakeGame />
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 2 }}>
                <h1>Arcade</h1>
                <div className="stat-grid">
                    {games.map(game => (
                        <div key={game.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, color: 'white' }}>
                                <Gamepad2 size={24} color="#9d50bb" /> {game.name}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{game.description}</p>
                            <button
                                className="primary"
                                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                                onClick={() => setActiveGame(game.id)}
                            >
                                <Play size={16} /> Play
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>
                        <Trophy size={20} color="#FFD700" /> Leaderboard
                    </div>
                    {highScores.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                            No scores yet. Play some games!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {highScores.sort((a, b) => b.score - a.score).slice(0, 10).map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 5 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{s.game}</span>
                                    <span style={{ fontWeight: 700, color: '#FFD700' }}>{s.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
