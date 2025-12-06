'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Copy, Folder, Image, FileText, Check } from 'lucide-react';

export default function DuplicatesPage() {
    const [stage, setStage] = useState<'upload' | 'scanning' | 'results'>('upload');

    // Mock results: Group of duplicates
    const duplicates = [
        {
            group: 1,
            size: '12 MB',
            files: [
                { id: 1, name: 'Presentation.key', path: '/Documents/Work', date: '2 days ago', original: true },
                { id: 2, name: 'Presentation (1).key', path: '/Downloads', date: 'Yesterday', original: false },
            ]
        },
        {
            group: 2,
            size: '4.5 MB',
            files: [
                { id: 3, name: 'Profile_Pic.jpg', path: '/Pictures', date: '1 month ago', original: true },
                { id: 4, name: 'Profile_Pic_Copy.jpg', path: '/Desktop', date: '2 weeks ago', original: false },
                { id: 5, name: 'IMG_4021.jpg', path: '/Downloads', date: 'Today', original: false },
            ]
        }
    ];

    const handleScan = () => {
        setStage('scanning');
        setTimeout(() => {
            setStage('results');
        }, 2000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Duplicate Finder</h1>
                </div>
                <p className={styles.subtitle}>Find and remove identical files to recover space.</p>
            </header>

            {stage === 'upload' && (
                <div className={styles.dropZone} onClick={handleScan}>
                    <div className={styles.dropIconBg}>
                        <Copy size={48} className={styles.dropIcon} />
                    </div>
                    <h3 className={styles.dropTitle}>Drag folders here to scan</h3>
                    <p className={styles.dropSub}>or click to select</p>
                </div>
            )}

            {stage === 'scanning' && (
                <div className={styles.scanning}>
                    <div className={styles.spinner}></div>
                    <p>Comparing file hashes...</p>
                </div>
            )}

            {stage === 'results' && (
                <div className={styles.results}>
                    <div className={styles.list}>
                        {duplicates.map(grp => (
                            <div key={grp.group} className={styles.group}>
                                <div className={styles.groupHeader}>
                                    <span className={styles.groupTitle}>Duplicate Group #{grp.group}</span>
                                    <span className={styles.groupSize}>{grp.size}</span>
                                </div>
                                <div className={styles.groupFiles}>
                                    {grp.files.map(file => (
                                        <div key={file.id} className={`${styles.fileItem} ${file.original ? styles.original : ''}`}>
                                            <div className={styles.fileIcon}>
                                                {file.name.endsWith('jpg') ? <Image size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileName}>{file.name}</div>
                                                <div className={styles.filePath}>{file.path}</div>
                                            </div>
                                            <div className={styles.fileMeta}>
                                                <span>{file.date}</span>
                                                {file.original ? (
                                                    <span className={styles.originalBadge}>Original</span>
                                                ) : (
                                                    <label className={styles.checkWrapper}>
                                                        <input type="checkbox" defaultChecked />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.cleanBtn} onClick={() => alert('Cleaning duplicates...')}>
                            Remove Selected
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
