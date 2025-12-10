import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Download, Loader2, ExternalLink, Terminal } from 'lucide-react';

interface AppItem {
    name: string;
    id: string; // brew cask id
    icon: string; // url or lucide icon name
}

export default function BrewInstaller() {
    const [brewInstalled, setBrewInstalled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    const apps: AppItem[] = [
        { name: 'Google Chrome', id: 'google-chrome', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg' },
        { name: 'Visual Studio Code', id: 'visual-studio-code', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg' },
        { name: 'Spotify', id: 'spotify', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
        { name: 'VLC Media Player', id: 'vlc', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/VLC_Icon.svg' },
        { name: 'Slack', id: 'slack', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
    ];

    useEffect(() => {
        checkBrew();
    }, []);

    const checkBrew = async () => {
        try {
            const installed = await invoke<boolean>('check_brew_installed');
            setBrewInstalled(installed);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const installApp = async (appId: string, appName: string) => {
        setInstalling(appId);
        setStatusMsg(`Installing ${appName}... This may take a while.`);
        try {
            await invoke('install_brew_app', { app: appId });
            setStatusMsg(`Successfully installed ${appName}!`);
            setTimeout(() => setStatusMsg(''), 5000);
        } catch (e: any) {
            setStatusMsg(`Error installing ${appName}: ${e}`);
        } finally {
            setInstalling(null);
        }
    };

    const openBrewSite = async () => {
        await invoke('open_url', { url: 'https://brew.sh' });
    };

    if (loading) return <div className="card"><Loader2 className="spin" /> Checking configuration...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <div>
                    <h2>Brew App Store</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Easily install popular applications.
                    </p>
                </div>
                <button className="secondary" onClick={openBrewSite} style={{ display: 'flex', gap: 6 }}>
                    <ExternalLink size={16} /> Install Homebrew
                </button>
            </div>

            {!brewInstalled && (
                <div style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid #FF9F0A', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, color: '#FF9F0A', marginBottom: 5 }}>Homebrew not detected</div>
                    <div style={{ fontSize: 13, marginBottom: 10 }}>
                        Homebrew is required to install these apps.
                    </div>
                </div>
            )}

            {statusMsg && (
                <div style={{
                    background: 'rgba(10,132,255,0.1)',
                    border: '1px solid #0A84FF',
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 15,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    {installing ? <Loader2 className="spin" size={16} /> : <Terminal size={16} />}
                    <span style={{ fontSize: 13 }}>{statusMsg}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {apps.map(app => (
                    <div key={app.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'rgba(255,255,255,0.05)',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <img src={app.icon} alt={app.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{app.name}</div>
                        </div>
                        <button
                            className="text-button"
                            disabled={!brewInstalled || installing !== null}
                            onClick={() => installApp(app.id, app.name)}
                            style={{ opacity: (!brewInstalled || installing) ? 0.5 : 1 }}
                        >
                            {installing === app.id ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
