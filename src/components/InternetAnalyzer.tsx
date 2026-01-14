import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Loader2, Activity, Router, AlertTriangle, CheckCircle } from 'lucide-react';

interface NetworkResult {
    date: string;
    download_speed: number;
    ping_latency: number;
    jitter: number;
    packet_loss: number;
    gateway_latency: number;
    score: number;
}

export default function InternetAnalyzer() {
    const [view, setView] = useState<'scan' | 'history'>('scan');
    const [loading, setLoading] = useState(false);

    // Live Data
    const [points, setPoints] = useState<number[]>([]);
    const [currentStep, setCurrentStep] = useState('');

    // Final Results
    const [lastResult, setLastResult] = useState<NetworkResult | null>(null);
    const [gatewayIP, setGatewayIP] = useState<string>('');
    const [history, setHistory] = useState<NetworkResult[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const h = await invoke<NetworkResult[]>('get_network_history');
            setHistory(h.reverse());
        } catch (e) {
            console.error(e);
        }
    };

    const runDiagnostics = async () => {
        setLoading(true);
        setPoints([]);
        setLastResult(null);

        try {
            // 1. Gateway Check
            setCurrentStep('Locating Gateway...');
            let gateway = '192.168.1.1';
            try {
                gateway = await invoke<string>('get_default_gateway');
                setGatewayIP(gateway);
            } catch (e) {
                console.warn('Gateway finding failed', e);
            }

            // 2. Local Ping Test (Gateway Latency)
            setCurrentStep('Testing Local Network Stability...');
            let gwSum = 0;
            let gwCount = 0;
            for (let i = 0; i < 5; i++) {
                const ms = await invoke<number>('ping_single', { host: gateway });
                if (ms > 0) {
                    gwSum += ms;
                    gwCount++;
                }
            }
            const avgGwLatency = gwCount > 0 ? gwSum / gwCount : 999;

            // 3. Internet Stability (Jitter/Loss) - The "Real Time Graph" part
            setCurrentStep('Measuring Internet Stability...');
            const TOTAL_PINGS = 15;
            const livePoints: number[] = [];
            let lostPackets = 0;
            let validPings: number[] = [];

            for (let i = 0; i < TOTAL_PINGS; i++) {
                const ms = await invoke<number>('ping_single', { host: '8.8.8.8' });
                // If -1, it's a timeout (loss)
                if (ms < 0) {
                    lostPackets++;
                    livePoints.push(0);
                } else {
                    validPings.push(ms);
                    livePoints.push(ms);
                }
                setPoints([...livePoints]); // Update graph live
            }

            // Calculate Metrics
            const avgPing = validPings.length > 0
                ? validPings.reduce((a, b) => a + b, 0) / validPings.length
                : 0;

            // Calc Jitter (StdDev)
            let jitter = 0;
            if (validPings.length > 1) {
                const variance = validPings.reduce((sum, val) => sum + Math.pow(val - avgPing, 2), 0) / validPings.length;
                jitter = Math.sqrt(variance);
            }

            const packetLoss = (lostPackets / TOTAL_PINGS) * 100;

            // 4. Download Speed
            setCurrentStep('Testing Bandwidth...');
            const startTime = performance.now();
            const response = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg?random=' + Math.random());
            const blob = await response.blob();
            const endTime = performance.now();
            const mbps = (blob.size * 8) / ((endTime - startTime) / 1000) / (1024 * 1024);

            // 5. Score Calculation
            let s = 100;
            if (avgPing > 50) s -= 10;
            if (avgPing > 100) s -= 20;
            if (jitter > 5) s -= 10;
            if (jitter > 20) s -= 20;
            if (packetLoss > 0) s -= 30;
            if (avgGwLatency > 15) s -= 10; // Router issue
            if (s < 0) s = 0;

            const res: NetworkResult = {
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                download_speed: parseFloat(mbps.toFixed(1)),
                ping_latency: parseFloat(avgPing.toFixed(1)),
                jitter: parseFloat(jitter.toFixed(1)),
                packet_loss: parseFloat(packetLoss.toFixed(1)),
                gateway_latency: parseFloat(avgGwLatency.toFixed(1)),
                score: s
            };

            setLastResult(res);
            await invoke('save_network_history', { result: res });
            loadHistory();

        } catch (e) {
            console.error(e);
            setCurrentStep('Error: ' + e);
        } finally {
            setLoading(false);
            setCurrentStep('');
        }
    };

    const getAdvice = (res: NetworkResult) => {
        const advice = [];
        if (res.gateway_latency > 15) advice.push("High router latency. Try restarting your modem/router.");
        if (res.packet_loss > 0) advice.push("Packet loss detected. Check cables or Wi-Fi signal interference.");
        if (res.jitter > 15) advice.push("Unstable connection (High Jitter). Not ideal for competitive gaming.");
        if (res.download_speed < 10) advice.push("Low bandwidth. Limit other downloads during streaming.");
        if (advice.length === 0) advice.push("Your connection is excellent! Perfect for Gaming & 4K.");
        return advice;
    };

    // Simple Line Chart SVG
    const Chart = ({ data }: { data: number[] }) => {
        if (data.length === 0) return null;
        const max = Math.max(...data, 100);
        const h = 60;
        const w = 300;
        const pts = data.map((val, i) => {
            const x = (i / (data.length - 1 || 1)) * w;
            const y = h - (val / max) * h;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div style={{ height: h, width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <polyline fill="none" stroke="#0A84FF" strokeWidth="2" points={pts} />
                </svg>
            </div>
        );
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h2>Net DiagnostiX</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className={view === 'scan' ? 'active' : ''} onClick={() => setView('scan')} style={{ padding: '5px 10px', fontSize: 12 }}>Scan</button>
                    <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')} style={{ padding: '5px 10px', fontSize: 12 }}>History</button>
                </div>
            </div>

            {view === 'scan' && (
                <>
                    {!loading && !lastResult && (
                        <div style={{ textAlign: 'center', padding: 30 }}>
                            <Router size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: 15 }} />
                            <p>Analyze Bandwidth, Jitter, Loss, and Router Latency.</p>
                            <button className="primary" onClick={runDiagnostics} style={{ marginTop: 15 }}>
                                <Activity size={16} /> Start Diagnostics
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                                <span>{currentStep}</span>
                                <Loader2 className="spin" size={16} />
                            </div>
                            <Chart data={points} />
                            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-secondary)', marginTop: 5 }}>Live Latency Feed</div>
                        </div>
                    )}

                    {lastResult && !loading && (
                        <div>
                            {/* Score Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20, background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10 }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: '50%',
                                    background: lastResult.score > 80 ? '#30D158' : lastResult.score > 50 ? '#FF9F0A' : '#FF453A',
                                    color: 'black', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                                }}>
                                    {lastResult.score}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 16 }}>Network Stability Index</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Based on Jitter, Loss & Ping</div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                                <div className="stat-item" style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                                    <div className="stat-label">Download</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, color: '#30D158' }}>{lastResult.download_speed} <span style={{ fontSize: 12 }}>Mbps</span></div>
                                </div>
                                <div className="stat-item" style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                                    <div className="stat-label">Jitter</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, color: lastResult.jitter < 10 ? '#30D158' : '#FF453A' }}>{lastResult.jitter} <span style={{ fontSize: 12 }}>ms</span></div>
                                </div>
                                <div className="stat-item" style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                                    <div className="stat-label">Avg Ping</div>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>{lastResult.ping_latency} <span style={{ fontSize: 12 }}>ms</span></div>
                                </div>
                                <div className="stat-item" style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                                    <div className="stat-label">Gateway ({gatewayIP})</div>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>{lastResult.gateway_latency} <span style={{ fontSize: 12 }}>ms</span></div>
                                </div>
                            </div>

                            {/* Advice */}
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: 14, marginBottom: 10 }}>Analysis & Advice</h3>
                                {getAdvice(lastResult).map((tip, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 13 }}>
                                        {tip.includes('excellent') ? <CheckCircle size={16} color="#30D158" /> : <AlertTriangle size={16} color="#FF9F0A" />}
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="secondary" onClick={runDiagnostics} style={{ width: '100%' }}>Run Again</button>
                        </div>
                    )}
                </>
            )}

            {view === 'history' && (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: 5 }}>Date</th>
                                <th style={{ padding: 5 }}>Down</th>
                                <th style={{ padding: 5 }}>Ping</th>
                                <th style={{ padding: 5 }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((h, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 5 }}>{h.date.split(' ')[0]}</td>
                                    <td style={{ padding: 5 }}>{h.download_speed}</td>
                                    <td style={{ padding: 5 }}>{h.ping_latency}</td>
                                    <td style={{ padding: 5, color: h.score > 80 ? '#30D158' : '#FF9F0A' }}>{h.score}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>No history yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
