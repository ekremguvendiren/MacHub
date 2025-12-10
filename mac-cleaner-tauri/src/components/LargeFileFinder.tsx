import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileSearch, Trash2, CheckCircle, Loader2 } from 'lucide-react';

interface LargeFile {
    path: string;
    size: number;
}

export default function LargeFileFinder() {
    const [files, setFiles] = useState<LargeFile[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);

    const scan = async () => {
        setScanning(true);
        setFiles([]);
        try {
            const data = await invoke<LargeFile[]>('find_large_files');
            setFiles(data);
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
            setScanned(true);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const result = bytes / (k * k * k);
        return `${result.toFixed(2)} GB`;
    };

    return (
        <div className="card">
            <h2>Large File Finder</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Find files larger than 1GB in your user folders.
            </p>

            {!scanning && !scanned && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <button className="primary" onClick={scan}>
                        <FileSearch size={16} /> Start Scan
                    </button>
                </div>
            )}

            {scanning && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent-primary)' }}>
                    <Loader2 className="spin" size={32} />
                    <div style={{ marginTop: 10 }}>Scanning...</div>
                </div>
            )}

            {scanned && !scanning && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <span style={{ fontWeight: 600 }}>Found {files.length} Files</span>
                        <button className="text-button" onClick={scan} style={{ fontSize: 12 }}>Rescan</button>
                    </div>

                    {files.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--success-color)', padding: 20 }}>
                            <CheckCircle size={24} style={{ marginBottom: 10 }} />
                            <div>No huge files found! Great job.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                            {files.map((file, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 10,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6
                                }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{formatBytes(file.size)}</div>
                                        <div title={file.path} style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                                            {file.path}
                                        </div>
                                    </div>
                                    <button className="danger-text" onClick={() => {/* Delete logic */ }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
