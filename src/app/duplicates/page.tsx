'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Copy, UploadCloud, CheckCircle, File } from 'lucide-react';

type DuplicateGroup = {
    id: string;
    size: number;
    files: {
        id: string;
        name: string;
        path: string;
        selected: boolean;
    }[];
};

export default function DuplicatesPage() {
    const [dragging, setDragging] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [groups, setGroups] = useState<DuplicateGroup[]>([]);
    const [cleaned, setCleaned] = useState(false);
    const [scanned, setScanned] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        startScan();
    };

    const startScan = async () => {
        setScanning(true);
        setCleaned(false);
        try {
            const res = await fetch('/api/duplicates', {
                method: 'POST',
                body: JSON.stringify({ action: 'scan' })
            });
            const data = await res.json();
            if (data.success) {
                setGroups(data.duplicates || []);
                setScanned(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
        }
    };

    const handleClean = async () => {
        const filesToDelete = groups.flatMap(g => g.files.filter(f => f.selected).map(f => f.path));

        if (filesToDelete.length === 0) return;

        await fetch('/api/duplicates', {
            method: 'POST',
            body: JSON.stringify({ action: 'clean', filesToDelete })
        });
        setCleaned(true);
        setGroups([]);
    };

    const toggleFile = (groupId: string, fileId: string) => {
        setGroups(groups.map(g => {
            if (g.id !== groupId) return g;
            return {
                ...g,
                files: g.files.map(f => f.id === fileId ? { ...f, selected: !f.selected } : f)
            };
        }));
    };

    const totalSelected = groups.reduce((acc, group) => {
        const selectedCount = group.files.filter(f => f.selected).length;
        return acc + (selectedCount * group.size);
    }, 0);

    const formatSize = (bytes: number) => {
        if (bytes > 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Duplicate Finder</h1>
                <p className={styles.subtitle}>Find and remove identical files to free up space.</p>
            </header>

            {!scanned && !scanning && !cleaned && (
                <div
                    className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className={styles.dropIconBg}>
                        <UploadCloud size={48} className={styles.dropIcon} />
                    </div>
                    <h2>Drag Folders Here</h2>
                    <p>or click to scan your Downloads folder</p>
                    <button className={styles.scanBtn} onClick={startScan}>Scan Downloads</button>
                </div>
            )}

            {scanning && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Scanning files and comparing hashes...</p>
                </div>
            )}

            {cleaned && (
                <div className={styles.successState}>
                    <CheckCircle size={64} className={styles.successIcon} />
                    <h2>Duplicates Removed!</h2>
                    <button className={styles.scanBtn} onClick={() => { setCleaned(false); setScanned(false); }}>Scan Again</button>
                </div>
            )}

            {scanned && !cleaned && (
                <div className={styles.results}>
                    <div className={styles.summaryBar}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Duplicates Found</span>
                            <span className={styles.statValue}>{groups.length} Groups</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Selected to Clean</span>
                            <span className={styles.statValue}>{formatSize(totalSelected)}</span>
                        </div>
                        <button className={styles.cleanBtn} onClick={handleClean} disabled={totalSelected === 0}>
                            Remove Selected
                        </button>
                    </div>

                    <div className={styles.list}>
                        {groups.length === 0 ? (
                            <div className={styles.empty}>No duplicates found in Downloads.</div>
                        ) : groups.map(group => (
                            <div key={group.id} className={styles.group}>
                                <div className={styles.groupHeader}>
                                    <span>{group.files[0].name}</span>
                                    <span className={styles.groupSize}>{formatSize(group.size)} each</span>
                                </div>
                                {group.files.map(file => (
                                    <div key={file.id} className={styles.fileItem}>
                                        <input
                                            type="checkbox"
                                            checked={file.selected}
                                            onChange={() => toggleFile(group.id, file.id)}
                                            className={styles.checkbox}
                                        />
                                        <File size={16} className={styles.fileIcon} />
                                        <div className={styles.filePath}>{file.path}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
