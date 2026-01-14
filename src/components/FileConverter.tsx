import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function FileConverter() {
    const [selectedFile, setSelectedFile] = useState<string>(''); // Path
    const [targetFormat, setTargetFormat] = useState<string>('png');
    const [converting, setConverting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // handleFileSelect removed as we use direct text input for now

    const convert = async () => {
        if (!selectedFile) return;
        setConverting(true);
        setError(null);
        setResult(null);

        try {
            const outPath = await invoke<string>('convert_image', {
                inputPath: selectedFile,
                format: targetFormat
            });
            setResult(outPath);
        } catch (e) {
            setError(String(e));
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="card">
            <h2>File Converter</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Convert images locally. Supports PNG, JPG, WEBP.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                {/* Input Step */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 10 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>1. Source File</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="text"
                            placeholder="/Users/username/Desktop/image.jpg"
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
                        />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 5 }}>
                        Paste the full absolute path to the image.
                    </div>
                </div>

                {/* Format Step */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 10 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>2. Target Format</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['png', 'jpg', 'webp'].map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => setTargetFormat(fmt)}
                                style={{
                                    flex: 1,
                                    background: targetFormat === fmt ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    color: targetFormat === fmt ? 'white' : 'var(--text-primary)',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    border: 'none'
                                }}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action */}
                <button
                    className="primary"
                    onClick={convert}
                    disabled={converting || !selectedFile}
                    style={{ justifyContent: 'center', marginTop: 10 }}
                >
                    {converting ? <Loader2 className="spin" /> : <ArrowRight />}
                    {converting ? 'Converting...' : 'Convert Image'}
                </button>

                {/* Result */}
                {result && (
                    <div style={{ background: 'rgba(48, 209, 88, 0.1)', border: '1px solid #30D158', padding: 15, borderRadius: 10, marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <CheckCircle color="#30D158" size={20} />
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, color: '#30D158' }}>Success!</div>
                            <div style={{ fontSize: 12, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Saved to: {result}</div>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ background: 'rgba(255, 69, 58, 0.1)', border: '1px solid #FF453A', padding: 15, borderRadius: 10, marginTop: 10 }}>
                        <div style={{ fontWeight: 600, color: '#FF453A' }}>Error</div>
                        <div style={{ fontSize: 13 }}>{error}</div>
                    </div>
                )}

            </div>
        </div>
    );
}
