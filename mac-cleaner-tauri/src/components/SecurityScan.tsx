import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ShieldAlert, Loader2, ScanSearch, ShieldCheck } from 'lucide-react';

interface SecurityResult {
    file_path: string;
    threat: string;
}

export default function SecurityScan() {
    const [results, setResults] = useState<SecurityResult[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);

    const scan = async () => {
        setScanning(true);
        setResults([]);
        try {
            const data = await invoke<SecurityResult[]>('perform_security_scan');
            setResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
            setScanned(true);
        }
    };

    return (
        <div className="card">
            <h2>Security Scan</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Quick check for known malicious signatures in Downloads.
            </p>

            {!scanning && !scanned && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <button className="primary" onClick={scan}>
                        <ScanSearch size={16} /> Scan Now
                    </button>
                </div>
            )}

            {scanning && (
                <div style={{ textAlign: 'center', padding: 40, color: '#FF9F0A' }}>
                    <Loader2 className="spin" size={32} />
                    <div style={{ marginTop: 10 }}>Scanning files...</div>
                </div>
            )}

            {scanned && !scanning && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <span style={{ fontWeight: 600 }}>Scan Complete</span>
                        <button className="text-button" onClick={scan} style={{ fontSize: 12 }}>Rescan</button>
                    </div>

                    {results.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--success-color)', padding: 20 }}>
                            <ShieldCheck size={32} style={{ marginBottom: 10 }} />
                            <div style={{ fontWeight: 'bold' }}>No Threats Found</div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>Your system appears safe.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                            {results.map((res, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: 10,
                                    border: '1px solid rgba(255,59,48,0.3)',
                                    background: 'rgba(255,59,48,0.05)',
                                    borderRadius: 6
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-color)', fontWeight: 600 }}>
                                        <ShieldAlert size={16} /> Threat Detected
                                    </div>
                                    <div style={{ marginTop: 5, fontSize: 13 }}>{res.threat}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, wordBreak: 'break-all' }}>
                                        {res.file_path}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
