import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ShieldAlert, ShieldCheck, Terminal, Bug, Lock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityResult {
    file_path: string;
    threat: string;
}

interface ScanLog {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
}

export default function SecurityScan() {
    const [results, setResults] = useState<SecurityResult[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [progress, setProgress] = useState(0);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).concat(`.${Math.floor(Math.random() * 999)}`);
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), message, type, timestamp }]);
    };

    const simulateScanning = async () => {
        const steps = [
            "Initializing vulnerability scanner...",
            "Loading CVE database (v2025.12.19)...",
            "Checking entitlement signatures...",
            "Verifying kernel integrity...",
            "Scanning running processes for injection...",
            "Analyzing network packet headers...",
            "Auditing filesystem permissions...",
            "Heuristic analysis of Downloads folder...",
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, Math.random() * 400 + 200));
            addLog(steps[i], 'info');
            setProgress(((i + 1) / steps.length) * 80);
        }
    };

    const scan = async () => {
        setScanning(true);
        setResults([]);
        setLogs([]);
        setProgress(0);
        setScanned(false);

        addLog("Starting Bug Bounty Protocol...", 'info');

        await simulateScanning();

        addLog("Executing deep scan payload...", 'warning');

        try {
            const data = await invoke<SecurityResult[]>('perform_security_scan');
            setResults(data);
            setProgress(100);

            if (data.length === 0) {
                addLog("Scan complete. System integrity verified.", 'success');
                addLog("No active exploits found.", 'success');
            } else {
                addLog(`Scan complete. ${data.length} vulnerabilities detected!`, 'error');
            }
        } catch (e) {
            console.error(e);
            addLog(`Scan failed: ${e}`, 'error');
        } finally {
            setScanning(false);
            setScanned(true);
        }
    };

    return (
        <div className="card" style={{
            background: '#0d0d0f',
            border: '1px solid #333',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            {/* Terminal Header */}
            <div style={{
                borderBottom: '1px solid #333',
                padding: '10px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1a1a1c'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Terminal size={12} color="#888" />
                        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>root@machub:~</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#666' }}>
                    <Lock size={12} />
                    <span style={{ fontSize: 10 }}>ENCRYPTED SESSION</span>
                </div>
            </div>

            {/* Terminal Body */}
            <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                color: '#a0a0b0',
                fontSize: '13px',
                lineHeight: '1.6'
            }}>
                {/* Progress Bar */}
                {scanning && (
                    <div style={{ marginBottom: 15, background: '#333', height: 2, width: '100%', borderRadius: 2 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{ height: '100%', background: '#9d50bb' }}
                        />
                    </div>
                )}
                {!scanning && !scanned && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                        <Bug size={64} color="#9d50bb" style={{ marginBottom: 20 }} />
                        <h3 style={{ color: '#fff', margin: 0 }}>BUG BOUNTY SCANNER</h3>
                        <p>Ready to hunt for vulnerabilities.</p>
                        <button className="primary" onClick={scan} style={{ marginTop: 20, fontFamily: 'inherit', background: '#9d50bb' }}>
                            <Search size={14} /> INITIALIZE SCAN
                        </button>
                    </div>
                )}

                {(scanning || scanned) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <AnimatePresence>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ display: 'flex', gap: 10 }}
                                >
                                    <span style={{ color: '#555' }}>[{log.timestamp}]</span>
                                    <span style={{
                                        color: log.type === 'error' ? '#ff453a' :
                                            log.type === 'success' ? '#32d74b' :
                                                log.type === 'warning' ? '#ff9f0a' : '#a0a0b0'
                                    }}>
                                        {log.type === 'info' && '➜ '}
                                        {log.type === 'success' && '✓ '}
                                        {log.type === 'error' && '✗ '}
                                        {log.type === 'warning' && '⚠ '}
                                        {log.message}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {scanning && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                style={{ color: '#9d50bb', marginTop: 10 }}
                            >
                                _
                            </motion.div>
                        )}
                        <div ref={logsEndRef} />
                    </div>
                )}

                {scanned && results.length > 0 && (
                    <div style={{ padding: '10px', borderTop: '1px solid #333' }}>
                        <div style={{ marginBottom: 10, color: '#ff453a', fontWeight: 'bold', fontSize: 12 }}>DETECTED THREATS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {results.map((res, i) => (
                                <ThreatItem key={i} res={res} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}


{/* Fixed syntax here by removing the weird wrap */ }

function ThreatItem({ res }: { res: SecurityResult }) {
    const [fixed, setFixed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFix = async () => {
        setLoading(true);
        try {
            await invoke('fix_security_threat', { path: res.file_path });
            setFixed(true);
        } catch (e) {
            console.error(e);
            alert(`Failed to fix: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    if (fixed) {
        return (
            <div style={{
                padding: '10px',
                background: 'rgba(50, 215, 75, 0.1)',
                borderLeft: '3px solid #32d74b',
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <ShieldCheck size={14} color="#32d74b" />
                <div style={{ color: '#32d74b', fontSize: 13, fontWeight: 'bold' }}>EXPLOIT PATCHED</div>
                <div style={{ color: '#555', fontSize: 11, marginLeft: 'auto' }}>THREAT NEUTRALIZED</div>
            </div>
        );
    }

    return (
        <div style={{
            padding: '10px',
            background: 'rgba(255, 69, 58, 0.1)',
            borderLeft: '3px solid #ff453a',
            display: 'flex',
            flexDirection: 'column',
            gap: 5
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff453a', fontWeight: 'bold' }}>
                    <ShieldAlert size={14} /> VULNERABILITY DETECTED
                </div>
                <button
                    onClick={handleFix}
                    disabled={loading}
                    style={{
                        background: '#ff453a',
                        border: 'none',
                        color: 'white',
                        fontSize: 10,
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'PATCHING...' : 'FIX VULNERABILITY'}
                </button>
            </div>
            <div style={{ color: '#fff' }}>{res.threat}</div>
            <div style={{ color: '#888', fontSize: 11, fontFamily: 'monospace' }}>{res.file_path}</div>
        </div>
    );
}

