import React from 'react';
import styles from './StartupItem.module.css';

interface StartupItemProps {
    name: string;
    description: string;
    icon?: React.ReactNode;
    isEnabled: boolean;
    onToggle: () => void;
}

const StartupItem: React.FC<StartupItemProps> = ({ name, description, isEnabled, onToggle }) => {
    return (
        <div className={styles.container}>
            <div className={styles.iconArea}>
                {/* Placeholder for app icon */}
                <div className={styles.iconPlaceholder} />
            </div>
            <div className={styles.info}>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.description}>{description}</p>
            </div>
            <label className={styles.switch}>
                <input type="checkbox" checked={isEnabled} onChange={onToggle} />
                <span className={styles.slider} />
            </label>
        </div>
    );
};

export default StartupItem;
