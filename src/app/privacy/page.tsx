'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Shield, Camera, Mic, Wifi, Lock } from 'lucide-react';

export default function PrivacyPage() {
    const [wifiNetworks, setWifiNetworks] = useState([
        { id: 1, ssid: 'Starbucks_Free_WiFi', lastConnected: '3 days ago' },
        { id: 2, ssid: 'Airport_Guest', lastConnected: '1 week ago' },
        { id: 3, ssid: 'Hotel_Lobby', lastConnected: '2 months ago' },
    ]);

    const [permissions, setPermissions] = useState([
        { id: 1, app: 'Zoom', access: 'Camera & Mic', time: 'Just now', icon: Camera },
        { id: 2, app: 'Google Chrome', access: 'Location', time: '1 hour ago', icon: Shield },
        { id: 3, app: 'Discord', access: 'Mic', time: 'Yesterday', icon: Mic },
    ]);

    const handleClearWifi = () => {
        if (confirm('Forget old WiFi networks?')) {
            setWifiNetworks([]);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Privacy Guard</h1>
                </div>
                <p className={styles.subtitle}>Monitor app permissions and manage sensitive data.</p>
            </header>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Access</h2>
                <div className={styles.card}>
                    {permissions.map(perm => {
                        const Icon = perm.icon;
                        return (
                            <div key={perm.id} className={styles.permItem}>
                                <div className={styles.permIconBg}>
                                    <Icon size={18} className={styles.permIcon} />
                                </div>
                                <div className={styles.permInfo}>
                                    <div className={styles.permApp}>{perm.app}</div>
                                    <div className={styles.permAccess}>Accessed {perm.access}</div>
                                </div>
                                <div className={styles.permTime}>{perm.time}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>WiFi History</h2>
                    <button
                        className={styles.clearBtn}
                        onClick={handleClearWifi}
                        disabled={wifiNetworks.length === 0}
                    >
                        Forget All ({wifiNetworks.length})
                    </button>
                </div>
                <div className={styles.card}>
                    {wifiNetworks.length > 0 ? (
                        wifiNetworks.map(net => (
                            <div key={net.id} className={styles.netItem}>
                                <Wifi size={18} className={styles.netIcon} />
                                <div className={styles.netInfo}>
                                    <div className={styles.netSsid}>{net.ssid}</div>
                                    <div className={styles.netTime}>Last connected: {net.lastConnected}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Lock size={24} />
                            <p>No old networks found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
