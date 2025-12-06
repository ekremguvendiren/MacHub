import React from 'react';
import styles from './DiskUsageChart.module.css';

interface DiskUsageChartProps {
    used: number; // GB
    total: number; // GB
}

const DiskUsageChart: React.FC<DiskUsageChartProps> = ({ used, total }) => {
    const percentage = (used / total) * 100;
    const strokeDasharray = 2 * Math.PI * 90; // r=90
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
        <div className={styles.container}>
            <svg width="240" height="240" viewBox="0 0 240 240" className={styles.chart}>
                <circle
                    cx="120"
                    cy="120"
                    r="90"
                    stroke="var(--color-border)"
                    strokeWidth="12"
                    fill="none"
                />
                <circle
                    cx="120"
                    cy="120"
                    r="90"
                    stroke="var(--color-accent)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={styles.progress}
                />
            </svg>
            <div className={styles.label}>
                <span className={styles.percentage}>{Math.round(percentage)}%</span>
                <span className={styles.text}>Used</span>
            </div>
        </div>
    );
};

export default DiskUsageChart;
