import React from 'react';
import styles from './BrowserSection.module.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BrowserSectionProps {
    name: string;
    icon?: React.ReactNode;
    data: {
        cache: boolean;
        history: boolean;
        cookies: boolean;
        downloads: boolean;
    };
    onToggle: (key: keyof BrowserSectionProps['data']) => void;
}

const BrowserSection: React.FC<BrowserSectionProps> = ({ name, data, onToggle }) => {
    const [expanded, setExpanded] = React.useState(true);

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setExpanded(!expanded)}>
                <div className={styles.titleInfo}>
                    {/* Placeholder Icon */}
                    <div className={styles.iconPlaceholder} />
                    <h3 className={styles.name}>{name}</h3>
                </div>
                {expanded ? <ChevronUp size={20} className={styles.chevron} /> : <ChevronDown size={20} className={styles.chevron} />}
            </div>

            {expanded && (
                <div className={styles.options}>
                    <label className={styles.option}>
                        <input
                            type="checkbox"
                            checked={data.cache}
                            onChange={() => onToggle('cache')}
                        />
                        <span>Cache</span>
                    </label>
                    <label className={styles.option}>
                        <input
                            type="checkbox"
                            checked={data.history}
                            onChange={() => onToggle('history')}
                        />
                        <span>History</span>
                    </label>
                    <label className={styles.option}>
                        <input
                            type="checkbox"
                            checked={data.cookies}
                            onChange={() => onToggle('cookies')}
                        />
                        <span>Cookies</span>
                    </label>
                    <label className={styles.option}>
                        <input
                            type="checkbox"
                            checked={data.downloads}
                            onChange={() => onToggle('downloads')}
                        />
                        <span>Downloads</span>
                    </label>
                </div>
            )}
        </div>
    );
};

export default BrowserSection;
