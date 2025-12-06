'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Trash, Mail, Image } from 'lucide-react';

export default function TrashPage() {
    const [bins, setBins] = useState([
        { id: 1, name: 'System Trash', icon: Trash, size: '850 MB', count: 124, cleaning: false },
        { id: 2, name: 'Mail Trash', icon: Mail, size: '120 MB', count: 45, cleaning: false },
        { id: 3, name: 'Photos Trash', icon: Image, size: '2.4 GB', count: 890, cleaning: false },
    ]);

    const handleEmpty = (id: number) => {
        setBins(bins.map(b => b.id === id ? { ...b, cleaning: true } : b));

        // Simulate cleaning
        setTimeout(() => {
            setBins(currentBins => currentBins.map(b =>
                b.id === id ? { ...b, cleaning: false, size: '0 KB', count: 0 } : b
            ));
        }, 1500);
    };

    const handleEmptyAll = () => {
        bins.forEach(b => {
            if (b.count > 0) handleEmpty(b.id);
        });
    };

    const totalSize = bins.reduce((acc, curr) => {
        // Mock parsing for demo
        if (curr.size.includes('GB')) return acc + parseFloat(curr.size) * 1024;
        if (curr.size.includes('MB')) return acc + parseFloat(curr.size);
        return acc;
    }, 0);

    const displayTotal = totalSize > 1024
        ? `${(totalSize / 1024).toFixed(1)} GB`
        : `${totalSize.toFixed(0)} MB`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Trash Bins</h1>
                <p className={styles.subtitle}>Empty all your trash bins at once.</p>
            </header>

            <div className={styles.hero}>
                <div className={styles.binIconBg}>
                    <Trash size={64} className={styles.binIcon} />
                </div>
                <div className={styles.totalSize}>{displayTotal}</div>
                <div className={styles.totalLabel}>Total Trash Size</div>

                <button className={styles.emptyAllBtn} onClick={handleEmptyAll} disabled={totalSize === 0}>
                    Empty All Bins
                </button>
            </div>

            <div className={styles.list}>
                {bins.map(bin => {
                    const Icon = bin.icon;
                    return (
                        <div key={bin.id} className={styles.item}>
                            <div className={styles.itemIcon}>
                                <Icon size={24} />
                            </div>
                            <div className={styles.itemInfo}>
                                <div className={styles.itemName}>{bin.name}</div>
                                <div className={styles.itemCount}>{bin.count} items</div>
                            </div>
                            <div className={styles.itemAction}>
                                <span className={styles.itemSize}>{bin.size}</span>
                                <button
                                    className={styles.emptyBtn}
                                    onClick={() => handleEmpty(bin.id)}
                                    disabled={bin.count === 0 || bin.cleaning}
                                >
                                    {bin.cleaning ? 'Emptying...' : 'Empty'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
