'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Trash2, AlertCircle, FileText, Globe } from 'lucide-react';

export default function SystemJunkPage() {
    const [scanned, setScanned] = useState(false);
    const [cleaning, setCleaning] = useState(false);

    // Mock data
    const junkItems = [
        { id: 1, name: 'User Cache Files', size: '1.4 GB', icon: FileText, description: 'Application temporary files' },
        { id: 2, name: 'System Logs', size: '340 MB', icon: AlertCircle, description: 'System operation records' },
        { id: 3, name: 'Unused Languages', size: '820 MB', icon: Globe, description: 'Localization files for unknown languages' },
        { id: 4, name: 'Broken Preferences', size: '45 KB', icon: Trash2, description: 'Corrupted configuration files' },
    ];

    const handleScan = () => {
        // Simulate scan
        setTimeout(() => setScanned(true), 1500);
    };

    const handleClean = () => {
        setCleaning(true);
        setTimeout(() => {
            setCleaning(false);
            setScanned(false);
        }, 2000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Junk</h1>
                <p className={styles.subtitle}>Remove temporary files to reclaim disk space.</p>
            </header>

            {!scanned ? (
                <div className={styles.scanState}>
                    <div className={styles.scanIconBg}>
                        <Trash2 size={48} className={styles.scanIcon} />
                    </div>
                    <button className={styles.actionButton} onClick={handleScan}>
                        Scan for Junk
                    </button>
                </div>
            ) : (
                <div className={styles.results}>
                    <div className={styles.list}>
                        {junkItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.id} className={styles.item}>
                                    <div className={styles.itemIcon}>
                                        <Icon size={20} />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>{item.name}</div>
                                        <div className={styles.itemDesc}>{item.description}</div>
                                    </div>
                                    <div className={styles.itemSize}>{item.size}</div>
                                    <input type="checkbox" defaultChecked className={styles.check} />
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.summary}>
                            Total Found: <span>2.5 GB</span>
                        </div>
                        <button
                            className={styles.actionButton}
                            onClick={handleClean}
                            disabled={cleaning}
                        >
                            {cleaning ? 'Cleaning...' : 'Clean Selected'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
