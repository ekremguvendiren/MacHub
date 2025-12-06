'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Package, Download, RefreshCw, Trash2, Terminal } from 'lucide-react';

export default function HomebrewPage() {
    const [packages, setPackages] = useState([
        { id: 1, name: 'wget', version: '1.21.3', latest: '1.21.4', type: 'Formula', outdated: true },
        { id: 2, name: 'node', version: '20.5.0', latest: '20.6.0', type: 'Formula', outdated: true },
        { id: 3, name: 'visual-studio-code', version: '1.81.0', latest: '1.82.0', type: 'Cask', outdated: true },
        { id: 4, name: 'google-chrome', version: '116.0.5845.110', latest: '116.0.5845.110', type: 'Cask', outdated: false },
        { id: 5, name: 'git', version: '2.41.0', latest: '2.41.0', type: 'Formula', outdated: false },
    ]);

    const [status, setStatus] = useState('');

    const handleUpdate = () => {
        setStatus('Updating Homebrew...');
        setTimeout(() => {
            setStatus('Homebrew Updated!');
            setTimeout(() => setStatus(''), 2000);
        }, 2000);
    };

    const handleUpgrade = () => {
        setStatus('Upgrading packages...');
        setTimeout(() => {
            setPackages(packages.map(p => ({ ...p, version: p.latest, outdated: false })));
            setStatus('Upgrade Complete!');
            setTimeout(() => setStatus(''), 2000);
        }, 2500);
    };

    const handleCleanup = () => {
        setStatus('Running cleanup...');
        setTimeout(() => {
            setStatus('Cleanup Complete! Freed 450MB.');
            setTimeout(() => setStatus(''), 2000);
        }, 1500);
    };

    const outdatedCount = packages.filter(p => p.outdated).length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Homebrew Manager</h1>
                    <span className={styles.badge}>
                        <Terminal size={14} style={{ marginRight: 4 }} />
                        /opt/homebrew
                    </span>
                </div>
                <p className={styles.subtitle}>Manage your command line tools and applications.</p>
            </header>

            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={handleUpdate}>
                    <RefreshCw size={18} /> Check for Updates
                </button>
                <button className={styles.actionBtn} onClick={handleUpgrade} disabled={outdatedCount === 0}>
                    <Download size={18} /> Upgrade All ({outdatedCount})
                </button>
                <button className={styles.actionBtn} onClick={handleCleanup}>
                    <Trash2 size={18} /> Cleanup
                </button>
            </div>

            {status && <div className={styles.statusBar}>{status}</div>}

            <div className={styles.listContainer}>
                <div className={styles.listHeader}>
                    <span>Name</span>
                    <span>Type</span>
                    <span>Current</span>
                    <span>Latest</span>
                    <span>Status</span>
                </div>
                <div className={styles.list}>
                    {packages.map(pkg => (
                        <div key={pkg.id} className={styles.item}>
                            <div className={styles.name}>
                                <Package size={16} className={styles.pkgIcon} />
                                {pkg.name}
                            </div>
                            <div className={styles.type}>
                                <span className={`${styles.typeBadge} ${pkg.type === 'Cask' ? styles.cask : styles.formula}`}>
                                    {pkg.type}
                                </span>
                            </div>
                            <div className={styles.version}>{pkg.version}</div>
                            <div className={styles.version}>{pkg.latest}</div>
                            <div className={styles.status}>
                                {pkg.outdated ? (
                                    <span className={styles.outdated}>Update Available</span>
                                ) : (
                                    <span className={styles.uptodate}>Up to date</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
