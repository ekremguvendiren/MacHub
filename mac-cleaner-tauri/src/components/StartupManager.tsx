import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

interface StartupItem {
    name: string;
    path: string;
    enabled: boolean;
}

export default function StartupManager() {
    const [items, setItems] = useState<StartupItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await invoke<StartupItem[]>('get_startup_items');
            setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (index: number) => {
        // Mock toggle for now since we didn't implement 'toggle_startup_item' backend command completely yet 
        // (Just reading list was implemented).
        // In a real app, we would invoke('toggle_item', { path: items[index].path, newState: ... })
        const newItems = [...items];
        newItems[index].enabled = !newItems[index].enabled;
        setItems(newItems);
    };

    if (loading) return <div className="card"><Loader2 className="spin" /> Loading items...</div>;

    return (
        <div className="card">
            <h2>Startup Items</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Apps that launch automatically when you login.
            </p>

            {items.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No startup agents found.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
                    {items.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '10px 15px',
                            borderRadius: 8
                        }}>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                                    {item.path}
                                </div>
                            </div>
                            <button
                                onClick={() => toggleItem(i)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                {item.enabled ?
                                    <ToggleRight size={28} color="#34C759" /> :
                                    <ToggleLeft size={28} color="#8E8E93" />
                                }
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
