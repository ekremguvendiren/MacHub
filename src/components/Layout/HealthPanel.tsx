'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Battery } from 'lucide-react';
import styles from './HealthPanel.module.css';

const HealthPanel = () => {
    const [stats, setStats] = useState({
        cpu: 12,
        ram: 45,
        battery: 100
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Mock fluctuating stats
            setStats(prev => ({
                cpu: Math.max(5, Math.min(100, prev.cpu + (Math.random() * 10 - 5))),
                ram: Math.max(20, Math.min(90, prev.ram + (Math.random() * 4 - 2))),
                battery: 98 // Static for now
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.panel}>
            <div className={styles.item}>
                <Cpu size={14} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>CPU</span>
                    <span className={styles.value}>{Math.round(stats.cpu)}%</span>
                </div>
                <div className={styles.bar}>
                    <div className={styles.fill} style={{ width: `${stats.cpu}%` }} />
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.item}>
                <Activity size={14} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>RAM</span>
                    <span className={styles.value}>{Math.round(stats.ram)}%</span>
                </div>
                <div className={styles.bar}>
                    <div className={styles.fill} style={{ width: `${stats.ram}%` }} />
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.item}>
                <Battery size={14} className={styles.icon} />
                <div className={styles.info}>
                    <span className={styles.label}>Bat</span>
                    <span className={styles.value}>{stats.battery}%</span>
                </div>
            </div>
        </div>
    );
};

export default HealthPanel;
