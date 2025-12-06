'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Puzzle, Monitor, Settings } from 'lucide-react';

export default function ExtensionsPage() {
    const [extensions, setExtensions] = useState([
        { id: 1, name: 'AdBlock Pro', type: 'Safari Extension', icon: Puzzle, enabled: true },
        { id: 2, name: 'Grammarly', type: 'Chrome Extension', icon: Puzzle, enabled: true },
        { id: 3, name: 'Aerial', type: 'Screensaver', icon: Monitor, enabled: true },
        { id: 4, name: 'Adobe Flash Player', type: 'System Plugin', icon: Settings, enabled: false }, // Legacy example
        { id: 5, name: 'QuickLook JSON', type: 'QuickLook', icon: Monitor, enabled: true },
    ]);

    const toggleExtension = (id: number) => {
        setExtensions(extensions.map(ext => ext.id === id ? { ...ext, enabled: !ext.enabled } : ext));
    };

    const removeExtension = (id: number) => {
        if (confirm('Are you sure you want to remove this extension?')) {
            setExtensions(extensions.filter(ext => ext.id !== id));
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Extensions</h1>
                <p className={styles.subtitle}>Manage browser extensions, plugins, and screensavers.</p>
            </header>

            <div className={styles.list}>
                {extensions.map(ext => {
                    const Icon = ext.icon;
                    return (
                        <div key={ext.id} className={styles.item}>
                            <div className={styles.iconArea}>
                                <Icon size={24} className={styles.icon} />
                            </div>
                            <div className={styles.info}>
                                <div className={styles.name}>{ext.name}</div>
                                <div className={styles.type}>{ext.type}</div>
                            </div>
                            <div className={styles.actions}>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={ext.enabled}
                                        onChange={() => toggleExtension(ext.id)}
                                    />
                                    <span className={styles.slider} />
                                </label>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeExtension(ext.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
