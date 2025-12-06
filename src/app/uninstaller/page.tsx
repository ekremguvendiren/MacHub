'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Package, Trash2, HardDrive, AlertTriangle } from 'lucide-react';

export default function UninstallerPage() {
    const [apps, setApps] = useState([
        { id: 1, name: 'Adobe Photoshop 2024', size: '4.2 GB', lastUsed: '2 days ago', selected: false },
        { id: 2, name: 'Microsoft Word', size: '1.8 GB', lastUsed: '1 week ago', selected: false },
        { id: 3, name: 'Spotify', size: '450 MB', lastUsed: 'Yesterday', selected: false },
        { id: 4, name: 'Zoom', size: '280 MB', lastUsed: 'Today', selected: false },
        { id: 5, name: 'Old Game Demo', size: '12 GB', lastUsed: '2 years ago', selected: false },
    ]);

    const toggleSelect = (id: number) => {
        setApps(apps.map(app => app.id === id ? { ...app, selected: !app.selected } : app));
    };

    const selectedCount = apps.filter(a => a.selected).length;
    const selectedSize = apps
        .filter(a => a.selected)
        .reduce((acc, curr) => {
            // Mock math
            const val = parseFloat(curr.size);
            return acc + (curr.size.includes('GB') ? val * 1024 : val);
        }, 0);

    const displaySelectedSize = selectedSize > 1024
        ? `${(selectedSize / 1024).toFixed(1)} GB`
        : `${selectedSize.toFixed(0)} MB`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Uninstaller</h1>
                <p className={styles.subtitle}>Completely remove apps and their leftovers.</p>
            </header>

            <div className={styles.listContainer}>
                <div className={styles.listHeader}>
                    <span>Application</span>
                    <span>Last Used</span>
                    <span>Size</span>
                    <span>Action</span>
                </div>
                <div className={styles.list}>
                    {apps.map(app => (
                        <div key={app.id} className={`${styles.item} ${app.selected ? styles.selected : ''}`}>
                            <div className={styles.appInfo}>
                                <div className={styles.appIconPlaceholder} />
                                <span className={styles.appName}>{app.name}</span>
                            </div>
                            <div className={styles.meta}>{app.lastUsed}</div>
                            <div className={styles.meta}>{app.size}</div>
                            <div className={styles.action}>
                                <label className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        checked={app.selected}
                                        onChange={() => toggleSelect(app.id)}
                                    />
                                    <span className={styles.customCheckbox}></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.stats}>
                    <Package className={styles.statsIcon} size={20} />
                    <span>{selectedCount} apps selected ({displaySelectedSize})</span>
                </div>
                <button
                    className={styles.uninstallBtn}
                    disabled={selectedCount === 0}
                    onClick={() => alert(`Uninstalling ${selectedCount} apps...`)}
                >
                    {selectedCount > 0 ? `Uninstall ${selectedCount} Apps` : 'Select Apps'}
                </button>
            </div>
        </div>
    );
}
