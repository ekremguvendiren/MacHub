'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Cpu, Zap } from 'lucide-react';

export default function RamPage() {
    const [memory, setMemory] = useState({
        used: 12.4, // GB
        total: 16, // GB
        cached: 3.2 // GB
    });
    const [optimizing, setOptimizing] = useState(false);

    const percentage = (memory.used / memory.total) * 100;

    const handleOptimize = () => {
        setOptimizing(true);
        setTimeout(() => {
            setMemory(prev => ({
                ...prev,
                used: prev.used - 2.1,
                cached: 1.1
            }));
            setOptimizing(false);
        }, 2000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>RAM Releaser</h1>
                <p className={styles.subtitle}>Free up inactive memory to boost performance.</p>
            </header>

            <div className={styles.content}>
                <div className={styles.graphContainer}>
                    <div className={styles.chart}>
                        <span className={styles.chartValue}>{Math.round(percentage)}%</span>
                        <span className={styles.chartLabel}>Memory Used</span>
                        <svg width="200" height="200" className={styles.svg}>
                            <circle cx="100" cy="100" r="90" strokeWidth="12" className={styles.bgCircle} />
                            <circle
                                cx="100"
                                cy="100"
                                r="90"
                                strokeWidth="12"
                                className={styles.fgCircle}
                                strokeDasharray={2 * Math.PI * 90}
                                strokeDashoffset={2 * Math.PI * 90 * ((100 - percentage) / 100)}
                            />
                        </svg>
                    </div>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Memory</span>
                            <span className={styles.statValue}>{memory.total} GB</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Used</span>
                            <span className={styles.statValue}>{memory.used.toFixed(1)} GB</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Cached Files</span>
                            <span className={styles.statValue}>{memory.cached.toFixed(1)} GB</span> // Target for cleanup
                        </div>
                    </div>
                </div>

                <button
                    className={styles.optimizeBtn}
                    onClick={handleOptimize}
                    disabled={optimizing}
                >
                    {optimizing ? (
                        <>
                            <Zap className={styles.btnIcon} size={18} /> Optimizing...
                        </>
                    ) : (
                        'Free Up RAM'
                    )}
                </button>
                {optimizing && <p className={styles.status}>Releasing inactive memory...</p>}
            </div>
        </div>
    );
}
