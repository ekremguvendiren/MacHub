'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Trash2 } from 'lucide-react';

type JunkItem = {
    id: string;
    name: string;
    path: string;
    size: string;
    selected: boolean;
};

export default function JunkPage() {
    const [items, setItems] = useState<JunkItem[]>([]);
    const [scanning, setScanning] = useState(false);
    const [cleaned, setCleaned] = useState(false);

    const startScan = async () => {
        setScanning(true);
        setCleaned(false);
        try {
            const res = await fetch('/api/system/scan', {
                method: 'POST',
                body: JSON.stringify({ action: 'scan-junk' })
            });
            const data = await res.json();
            if (data.success) {
                setItems(data.items || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
        }
    };

    useEffect(() => {
        startScan();
    }, []);

    const handleClean = () => {
        // Only simulate clean for safety in this demo
        setCleaned(true);
        setItems([]);
    };

    const toggleItem = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
    };

    const totalSize = items.reduce((acc, curr) => {
        let val = parseFloat(curr.size);
        if (curr.size.includes('G')) val *= 1024;
        if (curr.size.includes('K')) val /= 1024;
        return acc + (curr.selected ? val : 0);
    }, 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Junk</h1>
                <p className={styles.subtitle}>Remove temporary files to reclaim space.</p>
            </header>

            {cleaned ? (
                <div className={styles.results}>
                    <h2>System Cleaned!</h2>
                    <button className={styles.scanBtn} onClick={startScan}>Scan Again</button>
                </div>
            ) : (
                <>
                    <div className={styles.scanArea}>
                        <div className={styles.meter}>
                            <span className={styles.meterValue}>{totalSize.toFixed(1)} MB</span>
                            <span className={styles.meterLabel}>Junk Found</span>
                        </div>
                        <button
                            className={styles.scanBtn}
                            onClick={handleClean}
                            disabled={items.length === 0 || scanning}
                        >
                            {scanning ? 'Scanning...' : 'Clean Junk'}
                        </button>
                    </div>

                    <div className={styles.list}>
                        {scanning ? (
                            <div style={{ padding: 20 }}>Scanning system caches...</div>
                        ) : items.length === 0 ? (
                            <div style={{ padding: 20 }}>No junk found.</div>
                        ) : items.map(item => (
                            <div key={item.id} className={styles.item}>
                                <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={() => toggleItem(item.id)}
                                    className={styles.checkbox}
                                />
                                <div className={styles.itemIcon}>
                                    <Trash2 size={18} />
                                </div>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemName}>{item.name}</div>
                                    <div className={styles.itemPath}>{item.path}</div>
                                </div>
                                <div className={styles.itemSize}>{item.size}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
