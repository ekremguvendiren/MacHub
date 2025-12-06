'use client';

import React, { useEffect, useState } from 'react';
import styles from './HealthPanel.module.css';
import { Cpu, Zap, Battery } from 'lucide-react';

export default function HealthPanel() {
    const [stats, setStats] = useState({
        cpu: 0,
        ram: { used: 0, total: 16 },
        battery: { percent: 100 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/health');
                const data = await res.json();
                if (data.success) {
                    setStats({
                        cpu: Math.round(data.data.cpu),
                        ram: {
                            used: data.data.ram.active / (1024 * 1024 * 1024), // Convert to GB
                            total: data.data.ram.total / (1024 * 1024 * 1024)
                        },
                        battery: { percent: data.data.battery.percent }
                    });
                }
            } catch (e) {
                console.error('Health fetch failed', e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.panel}>
            <div className={styles.item}>
                <Cpu size={16} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>CPU</span>
                    <span className={styles.value}>{stats.cpu}%</span>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.item}>
                <Zap size={16} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>RAM</span>
                    <span className={styles.value}>
                        {stats.ram.used.toFixed(1)} <span className={styles.unit}>/ {stats.ram.total.toFixed(0)} GB</span>
                    </span>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.item}>
                <Battery size={16} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>Battery</span>
                    <span className={styles.value}>{stats.battery.percent}%</span>
                </div>
            </div>
        </div>
    );
}
