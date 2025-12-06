'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Package, Download, RefreshCw, Trash2, Terminal } from 'lucide-react';

type BrewPackage = {
    name: string;
    version: string;
    latest: string;
    type: string;
    outdated: boolean;
};

export default function HomebrewPage() {
    const [packages, setPackages] = useState<BrewPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const fetchOutdated = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/homebrew', {
                method: 'POST',
                body: JSON.stringify({ command: 'outdated' })
            });
            const data = await res.json();
            if (data.success && data.packages) {
                setPackages(data.packages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutdated();
    }, []);

    const handleUpdate = async () => {
        setStatus('Updating Homebrew...');
        await fetch('/api/homebrew', { method: 'POST', body: JSON.stringify({ command: 'update' }) });
        setStatus('Homebrew Updated!');
        setTimeout(() => setStatus(''), 2000);
        fetchOutdated();
    };

    const handleUpgrade = async () => {
        setStatus('Upgrading packages...');
        await fetch('/api/homebrew', { method: 'POST', body: JSON.stringify({ command: 'upgrade' }) });
        setStatus('Upgrade Complete!');
        setTimeout(() => setStatus(''), 2000);
        fetchOutdated();
    };

    const handleCleanup = async () => {
        setStatus('Running cleanup...');
        await fetch('/api/homebrew', { method: 'POST', body: JSON.stringify({ command: 'cleanup' }) });
        setStatus('Cleanup Complete!');
        setTimeout(() => setStatus(''), 2000);
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
                <button className={styles.actionBtn} onClick={handleUpdate} disabled={!!status}>
                    <RefreshCw size={18} className={status ? styles.spin : ''} /> Check for Updates
                </button>
                <button className={styles.actionBtn} onClick={handleUpgrade} disabled={outdatedCount === 0 || !!status}>
                    <Download size={18} /> Upgrade All ({outdatedCount})
                </button>
                <button className={styles.actionBtn} onClick={handleCleanup} disabled={!!status}>
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
                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center' }}>Loading packages...</div>
                    ) : packages.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center' }}>No outdated packages found.</div>
                    ) : packages.map((pkg, idx) => (
                        <div key={idx} className={styles.item}>
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
