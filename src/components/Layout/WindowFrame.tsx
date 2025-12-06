import React from 'react';
import HealthPanel from './HealthPanel';
import styles from './WindowFrame.module.css';

interface WindowFrameProps {
    children: React.ReactNode;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
    return (
        <div className={styles.frame}>
            <div className={styles.trafficLights}>
                <div className={`${styles.light} ${styles.red}`} />
                <div className={`${styles.light} ${styles.yellow}`} />
                <div className={`${styles.light} ${styles.green}`} />
            </div>
            <HealthPanel />
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default WindowFrame;
