'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { File, Video, Image, Box, ArrowUpDown } from 'lucide-react';

type FileItem = {
    id: string;
    name: string;
    path: string;
    size: number;
    sizeStr: string;
    type: 'video' | 'image' | 'archive' | 'other';
    lastAccess: string;
};

export default function LargeFilesPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await fetch('/api/system/scan', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'scan-large' })
                });
                const data = await res.json();
                if (data.success) {
                    setFiles(data.files);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const [sortKey, setSortKey] = useState<keyof FileItem>('size');
    const [sortDesc, setSortDesc] = useState(true);

    const handleSort = (key: keyof FileItem) => {
        if (sortKey === key) {
            setSortDesc(!sortDesc);
        } else {
            setSortKey(key);
            setSortDesc(true);
        }
    };

    const sortedFiles = [...files].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video size={18} />;
            case 'image': return <Image size={18} />;
            case 'archive': return <Box size={18} />;
            default: return <File size={18} />;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Large & Old Files</h1>
                <p className={styles.subtitle}>Review and delete unused files larger than 50 MB.</p>
            </header>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className={styles.sortable}>
                                Name <ArrowUpDown size={12} />
                            </th>
                            <th onClick={() => handleSort('lastAccess')} className={styles.sortable}>
                                Last Accessed <ArrowUpDown size={12} />
                            </th>
                            <th onClick={() => handleSort('size')} className={styles.sortable}>
                                Size <ArrowUpDown size={12} />
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFiles.map(file => (
                            <tr key={file.id}>
                                <td className={styles.nameCell}>
                                    <div className={styles.fileIcon}>{getIcon(file.type)}</div>
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileName}>{file.name}</div>
                                        <div className={styles.filePath}>{file.path}</div>
                                    </div>
                                </td>
                                <td className={styles.dateCell}>{file.lastAccess}</td>
                                <td className={styles.sizeCell}>{file.sizeStr}</td>
                                <td>
                                    <button className={styles.deleteBtn} onClick={() => alert(`Deleting ${file.name}`)}>
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
