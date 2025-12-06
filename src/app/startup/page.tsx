'use client';

import React, { useState } from 'react';
import StartupItem from '@/components/Startup/StartupItem';
import styles from './page.module.css';

export default function StartupPage() {
    const [items, setItems] = useState([
        { id: 1, name: 'Google Chrome', description: 'Browser background update service', enabled: true },
        { id: 2, name: 'Spotify', description: 'Music streaming service', enabled: true },
        { id: 3, name: 'Adobe Creative Cloud', description: 'Checks for updates', enabled: false },
        { id: 4, name: 'Dropbox', description: 'File synchronization', enabled: true },
        { id: 5, name: 'Microsoft Teams', description: 'Collaboration tool', enabled: false },
    ]);

    const toggleItem = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Startup Items</h1>
                <p className={styles.subtitle}>Disable these apps to speed up your Mac's boot time.</p>
            </header>

            <div className={styles.list}>
                {items.map(item => (
                    <StartupItem
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        isEnabled={item.enabled}
                        onToggle={() => toggleItem(item.id)}
                    />
                ))}
            </div>
        </div>
    );
}
