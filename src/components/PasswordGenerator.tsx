import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, RefreshCw, Check, ShieldCheck } from 'lucide-react';

export default function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = async () => {
        try {
            const pwd = await invoke<string>('generate_secure_password', {
                length,
                uppercase: useUpper,
                lowercase: useLower,
                numbers: useNumbers,
                symbols: useSymbols,
            });
            setPassword(pwd);
            setCopied(false);
        } catch (e) {
            console.error(e);
        }
    };

    const copyToClipboard = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ padding: 8, background: 'rgba(48, 209, 88, 0.1)', borderRadius: 8 }}>
                    <ShieldCheck size={24} color="#30d158" />
                </div>
                <h2 style={{ margin: 0 }}>Secure Password Generator</h2>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 20, color: password ? 'var(--text-primary)' : 'var(--text-disabled)', wordBreak: 'break-all' }}>
                    {password || 'Click Generate'}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="secondary" onClick={generatePassword} title="Regenerate">
                        <RefreshCw size={18} />
                    </button>
                    <button className="primary" onClick={copyToClipboard} disabled={!password}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span>Length: {length}</span>
                    </label>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />
                        Generic Uppercase (A-Z)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />
                        Lowercase (a-z)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
                        Numbers (0-9)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
                        Symbols (!@#$)
                    </label>
                </div>

                <button className="primary" style={{ marginTop: 10, padding: 12, justifyContent: 'center' }} onClick={generatePassword}>
                    Generate Secure Password
                </button>
            </div>
        </div>
    );
}
