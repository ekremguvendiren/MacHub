'use client';

import React, { useState } from 'react';
import BrowserSection from '@/components/BrowserData/BrowserSection';
import styles from './page.module.css';

type BrowserDataType = {
    cache: boolean;
    history: boolean;
    cookies: boolean;
    downloads: boolean;
};

export default function BrowserDataPage() {
    const [browsers, setBrowsers] = useState<{ [key: string]: BrowserDataType }>({
        'Safari': { cache: true, history: false, cookies: false, downloads: false },
        'Google Chrome': { cache: true, history: true, cookies: false, downloads: true },
        'Firefox': { cache: false, history: false, cookies: false, downloads: false },
    });

    const handleToggle = (browserName: string, key: keyof BrowserDataType) => {
        setBrowsers(prev => ({
            ...prev,
            [browserName]: {
                ...prev[browserName],
                [key]: !prev[browserName][key]
            }
        }));
    };

    const handleClean = () => {
        alert('Cleaning browser data...');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Browser Data</h1>
                <p className={styles.subtitle}>Select the data you want to remove from your browsers.</p>
            </header>

            <div className={styles.list}>
                {Object.entries(browsers).map(([name, data]) => (
                    <BrowserSection
                        key={name}
                        name={name}
                        data={data}
                        onToggle={(key) => handleToggle(name, key)}
                    />
                ))}
            </div>

            <div className={styles.footer}>
                <button className={styles.cleanButton} onClick={handleClean}>
                    Clean Selected Items
                </button>
            </div>
        </div>
    );
}
