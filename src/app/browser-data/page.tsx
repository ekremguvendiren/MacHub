'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Globe, Trash2, Shield, Lock } from 'lucide-react';
import BrowserSection from '@/components/BrowserData/BrowserSection';

type BrowserState = {
    chrome: { cache: boolean; history: boolean; cookies: boolean };
    safari: { cache: boolean; history: boolean; cookies: boolean };
};

export default function BrowserDataPage() {
    const [selected, setSelected] = useState<BrowserState>({
        chrome: { cache: true, history: true, cookies: false },
        safari: { cache: true, history: true, cookies: false }
    });
    const [cleaning, setCleaning] = useState(false);
    const [cleaned, setCleaned] = useState(false);

    const handleToggle = (browser: keyof BrowserState, type: keyof BrowserState['chrome']) => {
        setSelected({
            ...selected,
            [browser]: { ...selected[browser], [type]: !selected[browser][type] }
        });
    };

    const handleClean = async () => {
        setCleaning(true);
        try {
            await fetch('/api/browser', {
                method: 'POST',
                body: JSON.stringify({ browsers: selected })
            });
            setCleaned(true);
            setTimeout(() => setCleaned(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setCleaning(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Browser Data</h1>
                <p className={styles.subtitle}>Protect your privacy by clearing browser traces.</p>
            </header>

            <div className={styles.grid}>
                <BrowserSection
                    name="Google Chrome"
                    icon="/chrome.svg"
                    data={selected.chrome}
                    onToggle={(type) => handleToggle('chrome', type)}
                />
                <BrowserSection
                    name="Safari"
                    icon="/safari.svg"
                    data={selected.safari}
                    onToggle={(type) => handleToggle('safari', type)}
                />
            </div>

            <footer className={styles.footer}>
                <button
                    className={styles.cleanBtn}
                    onClick={handleClean}
                    disabled={cleaning || cleaned}
                >
                    {cleaning ? 'Cleaning...' : cleaned ? 'Cleaned!' : 'Clean Selected Data'}
                </button>
            </footer>
        </div>
    );
}
