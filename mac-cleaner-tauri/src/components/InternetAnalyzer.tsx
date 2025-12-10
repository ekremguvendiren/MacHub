import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Wifi, Download, Loader2, Gamepad2, Video } from 'lucide-react';

interface PingResult {
    host: string;
    avg_latency_ms: number;
    packet_loss_percent: number;
}

export default function InternetAnalyzer() {
    const [pingResult, setPingResult] = useState<PingResult | null>(null);
    const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Suitability
    const [suitability, setSuitability] = useState<{ gaming: boolean, video: boolean, streaming: boolean } | null>(null);

    const startTest = async () => {
        setLoading(true);
        setPingResult(null);
        setDownloadSpeed(null);
        setSuitability(null);

        try {
            // 1. Measure Download Speed (Frontend approximation)
            // Fetch a random image from Unsplash or similar that is approx 1-2MB.
            // Or use a dedicated speedtest file. Let's use a 5MB test file from generic placeholder or similar.
            // Using a cloudflare CDN endpoint or similar is best.
            // For now, let's just fetch a fairly large image (e.g. 2MB)
            const startTime = performance.now();
            const response = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg?random=' + Math.random());
            const blob = await response.blob();
            const endTime = performance.now();

            const sizeInBits = blob.size * 8;
            const durationInSeconds = (endTime - startTime) / 1000;
            const bps = sizeInBits / durationInSeconds;
            const mbps = bps / (1024 * 1024);
            setDownloadSpeed(mbps);

            // 2. Measure Ping (Backend)
            const p = await invoke<PingResult>('measure_ping', { host: 'google.com' });
            setPingResult(p);

            // 3. Calculate Suitability
            const gaming = p.avg_latency_ms < 50 && p.packet_loss_percent < 1;
            const video = mbps > 2; // > 2 Mbps for HD calls roughly
            const streaming = mbps > 25; // > 25 Mbps for 4K
            setSuitability({ gaming, video, streaming });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Internet Analyzer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Check network performance and suitability.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Download Speed</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#30D158' }}>
                        {downloadSpeed ? downloadSpeed.toFixed(1) : '-'} <span style={{ fontSize: 12 }}>Mbps</span>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Ping (Latency)</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0A84FF' }}>
                        {pingResult ? pingResult.avg_latency_ms.toFixed(0) : '-'} <span style={{ fontSize: 12 }}>ms</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--accent-primary)' }}>
                    <Loader2 className="spin" size={24} />
                    <div style={{ marginTop: 5, fontSize: 12 }}>Running tests...</div>
                </div>
            )}

            {!loading && suitability && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Gamepad2 size={14} /> Online Gaming</span>
                        {suitability.gaming ?
                            <span style={{ color: '#30D158', fontWeight: 600 }}>Excellent</span> :
                            <span style={{ color: '#FF9F0A' }}>Fair / Poor</span>
                        }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Video size={14} /> Video Calls</span>
                        {suitability.video ?
                            <span style={{ color: '#30D158', fontWeight: 600 }}>Smooth</span> :
                            <span style={{ color: '#FF453A' }}>Poor</span>
                        }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> 4K Streaming</span>
                        {suitability.streaming ?
                            <span style={{ color: '#30D158', fontWeight: 600 }}>Ready</span> :
                            <span style={{ color: '#FF9F0A' }}>Buffering likely</span>
                        }
                    </div>
                </div>
            )}

            {!loading && (
                <button className="primary" onClick={startTest} style={{ width: '100%', marginTop: 20 }}>
                    <Wifi size={16} /> Run Speed Test
                </button>
            )}
        </div>
    );
}
