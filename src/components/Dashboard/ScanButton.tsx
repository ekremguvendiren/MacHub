import React from 'react';
import styles from './ScanButton.module.css';

interface ScanButtonProps {
    onClick: () => void;
    scanning: boolean;
}

const ScanButton: React.FC<ScanButtonProps> = ({ onClick, scanning }) => {
    return (
        <button
            className={`${styles.button} ${scanning ? styles.scanning : ''}`}
            onClick={onClick}
            disabled={scanning}
        >
            {scanning ? 'Scanning...' : 'Start Smart Scan'}
        </button>
    );
};

export default ScanButton;
