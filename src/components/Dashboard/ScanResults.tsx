import React from 'react';
import styles from './ScanResults.module.css';

interface ScanResultsProps {
    junkSize: string;
    itemCount: number;
    onClean: () => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({ junkSize, itemCount, onClean }) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Scan Complete</h2>
            <div className={styles.result}>
                <span className={styles.number}>{junkSize}</span>
                <span className={styles.label}>Junk Found</span>
            </div>
            <p className={styles.details}>
                We found {itemCount} items that can be safely removed to reclaim space.
            </p>
            <button className={styles.cleanButton} onClick={onClean}>
                Clean Now
            </button>
        </div>
    );
};

export default ScanResults;
