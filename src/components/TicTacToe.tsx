import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RotateCcw } from 'lucide-react';
import '../App.css';

export default function TicTacToe() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [scoreSaved, setScoreSaved] = useState(false);

    const calculateWinner = (squares: any[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (const [a, b, c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i: number) => {
        if (winner || board[i]) return;
        const newBoard = [...board];
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);

        const w = calculateWinner(newBoard);
        if (w) setWinner(w);
    };

    useEffect(() => {
        if (winner && !scoreSaved && winner === 'X') {
            // Assume Player is X. If X wins, save score? 
            // TicTacToe isn't really score based, maybe just +1 win?
            // Let's just save a dummy "100" points for winning?
            // invoke('save_high_score', { game: 'Tic-Tac-Toe', score: 100 });
            // Actually simpler:
            const save = async () => {
                try {
                    await invoke('save_high_score', { game: 'Tic-Tac-Toe', score: 100 });
                    setScoreSaved(true);
                } catch (e) { console.error(e) }
            };
            save();
        }
    }, [winner, scoreSaved]);

    const reset = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setXIsNext(true);
        setScoreSaved(false);
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Tic Tac Toe</h2>
            <div style={{ marginBottom: 15, fontSize: 18, fontWeight: 600, color: winner ? 'var(--success-color)' : 'white' }}>
                {winner ? `Winner: ${winner}` : `Next Player: ${xIsNext ? 'X' : 'O'}`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: 10 }}>
                {board.map((val, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        style={{
                            width: 100,
                            height: 100,
                            fontSize: 48,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: val === 'X' ? '#0A84FF' : '#FF453A',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {val}
                    </button>
                ))}
            </div>

            <button className="primary" onClick={reset} style={{ marginTop: 30 }}>
                <RotateCcw size={16} /> Reset Game
            </button>
        </div>
    );
}
