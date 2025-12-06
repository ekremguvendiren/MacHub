'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { AppWindow, Trash2, HardDrive, Clock } from 'lucide-react';

type AppItem = {
    id: string;
    name: string;
    path: string;
    icon: string;
    size: string;
    lastUsed: string;
    selected: boolean;
};

export default function UninstallerPage() {
    const [apps, setApps] = useState<AppItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleaned, setCleaned] = useState(false);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/apps');
            const data = await res.json();
            if (data.success) {
                setApps(data.apps || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUninstall = async () => {
        const selectedApps = apps.filter(a => a.selected);
        if (selectedApps.length === 0) return;

        await fetch('/api/apps', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', apps: selectedApps })
        });

        setCleaned(true);
        setTimeout(() => {
            setCleaned(false);
            fetchApps();
        }, 2000);
    };

    const toggleApp = (id: string) => {
        setApps(apps.map(app => app.id === id ? { ...app, selected: !app.selected } : app));
    };

    const selectedCount = apps.filter(a => a.selected).length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>App Uninstaller</h1>
                <p className={styles.subtitle}>Remove unwanted applications and their leftovers.</p>
            </header>

            <div className={styles.content}>
                <div className={styles.listHeader}>
                    <div className={styles.colName}>Name</div>
                    <div className={styles.colSize}>Size</div>
                    <div className={styles.colLastUsed}>Last Used</div>
                </div>

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.loading}>Scanning Applications...</div>
                    ) : cleaned ? (
                        <div className={styles.success}>Apps Uninstalled Successfully!</div>
                    ) : apps.length === 0 ? (
                        <div className={styles.loading}>No apps found in standard locations.</div>
                    ) : (
                        apps.map(app => (
                            <div key={app.id} className={`${styles.item} ${app.selected ? styles.selected : ''}`} onClick={() => toggleApp(app.id)}>
                                <input
                                    type="checkbox"
                                    checked={app.selected}
                                    onChange={() => toggleApp(app.id)}
                                    className={styles.checkbox}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className={styles.appIcon}>
                                    <AppWindow size={24} />
                                </div>
                                <div className={styles.appName}>
                                    <div className={styles.name}>{app.name}</div>
                                    <div className={styles.path}>{app.path}</div>
                                </div>
                                <div className={styles.appSize}>{app.size}</div>
                                <div className={styles.appLastUsed}>{app.lastUsed}</div>
                            </div>
                        ))
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.summary}>
                        <span>{selectedCount}</span> apps selected
                    </div>
                    <button
                        className={styles.uninstallBtn}
                        onClick={handleUninstall}
                        disabled={selectedCount === 0 || loading || cleaned}
                    >
                        {cleaned ? 'Done' : 'Uninstall'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
