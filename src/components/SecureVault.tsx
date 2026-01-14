import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Lock as LockIcon, Unlock, EyeOff, Plus, Key, Fingerprint } from 'lucide-react';

interface VaultEntry {
    id: String;
    service: String;
    username: String;
    password_encrypted: String;
    created_at: String;
}

export default function SecureVault() {
    const [locked, setLocked] = useState(true);
    const [masterPassword, setMasterPassword] = useState('');
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [viewingPasswordId, setViewingPasswordId] = useState<string | null>(null);
    const [decryptedPassword, setDecryptedPassword] = useState<string>('');

    // New Entry State
    const [showAdd, setShowAdd] = useState(false);
    const [newService, setNewService] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState('');

    const refreshEntries = async () => {
        try {
            const ex = await invoke<VaultEntry[]>('get_vault_entries');
            setEntries(ex);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        refreshEntries();
    }, []);

    const handleUnlock = async () => {
        // For this prototype, we just verify if we can decrypt a test value or just trust the master password is correct for future decrypts.
        // In a real app, we'd hash and compare against a stored hash.
        // Here, we just set state to unlocked. 
        // Ideally: invoke('verify_master_password', { password: masterPassword })

        // Let's assume unlocked if master password is not empty for now (simplified)
        if (masterPassword.length > 0) {
            setLocked(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newService || !newUsername || !newPassword) return;

        try {
            // Encrypt locally or via backend? 
            // We'll use the backend 'derive_key_and_encrypt' we added.
            const encrypted = await invoke<string>('derive_key_and_encrypt', {
                plaintext: newPassword,
                masterPassword
            });

            const entry = {
                id: crypto.randomUUID(),
                service: newService,
                username: newUsername,
                password_encrypted: encrypted,
                created_at: new Date().toISOString()
            };

            await invoke('save_vault_entry', { entry });
            setNewService('');
            setNewUsername('');
            setNewPassword('');
            setShowAdd(false);
            refreshEntries();
        } catch (e: any) {
            setErrorMsg('Failed to save: ' + e);
        }
    };

    const revealPassword = async (entry: any) => {
        if (viewingPasswordId === entry.id) {
            setViewingPasswordId(null);
            setDecryptedPassword('');
            return;
        }

        try {
            // Trigger Touch ID
            const bioSuccess = await invoke<boolean>('authenticate_biometric', {
                reason: "Scan fingerprint to reveal password"
            });

            if (bioSuccess) {
                // Decrypt
                const decrypted = await invoke<string>('decrypt_value', {
                    encryptedVal: entry.password_encrypted,
                    masterPassword // In a real app we might cache the key in memory after unlock, but here we reuse MP
                });
                setDecryptedPassword(decrypted);
                setViewingPasswordId(entry.id);
            } else {
                setErrorMsg("Biometric authentication failed");
            }
        } catch (e: any) {
            // Fallback to asking master password again? We have it in state if unlocked. 
            // If bio failed, maybe we trust the MP in state? 
            // Strategy: If Bio fails, require re-entry of MP?
            // For now, let's just show error.
            console.error(e);
            setErrorMsg("Authentication failed: " + e);
        }
    };

    if (locked) {
        return (
            <div className="card" style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ padding: 15, background: 'rgba(255, 59, 48, 0.1)', borderRadius: '50%', display: 'inline-block' }}>
                        <LockIcon size={40} color="#ff3b30" />
                    </div>
                </div>
                <h2>Vault Locked</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Enter Master Password to access.</p>

                <input
                    type="password"
                    placeholder="Master Password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', marginBottom: 15 }}
                />

                <button className="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleUnlock}>
                    <Unlock size={18} style={{ marginRight: 8 }} /> Unlock Vault
                </button>
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: 8, background: 'rgba(10, 132, 255, 0.1)', borderRadius: 8 }}>
                        <Key size={24} color="#0a84ff" />
                    </div>
                    <h2 style={{ margin: 0 }}>Secure Vault</h2>
                </div>
                <button className="secondary" onClick={() => setLocked(true)}>
                    <LockIcon size={16} style={{ marginRight: 6 }} /> Lock
                </button>
            </div>

            {errorMsg && (
                <div style={{ padding: 10, background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', borderRadius: 8, marginBottom: 15, fontSize: 13 }}>
                    {errorMsg}
                    <button onClick={() => setErrorMsg('')} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {!showAdd ? (
                <button className="primary" onClick={() => setShowAdd(true)} style={{ width: '100%', marginBottom: 20, justifyContent: 'center' }}>
                    <Plus size={18} style={{ marginRight: 8 }} /> Add New Password
                </button>
            ) : (
                <div style={{ background: 'var(--bg-secondary)', padding: 15, borderRadius: 12, marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0 }}>New Entry</h3>
                    <input
                        placeholder="Service (e.g. Google)"
                        value={newService} onChange={e => setNewService(e.target.value)}
                        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: 'none' }}
                    />
                    <input
                        placeholder="Username"
                        value={newUsername} onChange={e => setNewUsername(e.target.value)}
                        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: 'none' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="primary" onClick={handleAddEntry}>Save</button>
                        <button className="secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entries.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>No passwords saved yet.</div>}

                {entries.map((entry: any) => (
                    <div key={entry.id} style={{ background: 'var(--bg-secondary)', padding: 15, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 16 }}>{entry.service}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{entry.username}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
                                {viewingPasswordId === entry.id ? decryptedPassword : '••••••••••••'}
                            </div>
                            <button
                                className="secondary"
                                onClick={() => revealPassword(entry)}
                                title="Reveal Password"
                            >
                                {viewingPasswordId === entry.id ? <EyeOff size={16} /> : <Fingerprint size={16} color="var(--accent-primary)" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
