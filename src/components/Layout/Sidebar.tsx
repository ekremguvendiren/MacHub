'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Gauge,
    Trash2,
    Files,
    Globe,
    Eraser,
    AppWindow,
    Puzzle,
    Zap,
    Cpu,
    Coffee,
    Copy,
    Shield,
    Terminal,
    Rocket
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();

    const menuGroups = [
        {
            title: 'CLEANUP',
            items: [
                { name: 'System Junk', path: '/junk', icon: Trash2 }, // Placeholder path
                { name: 'Large & Old Files', path: '/large-files', icon: Files },
                { name: 'Browser Data', path: '/browser-data', icon: Globe },
                { name: 'Trash Cleaner', path: '/trash', icon: Eraser }, // Placeholder path
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { name: 'App Uninstaller', path: '/uninstaller', icon: AppWindow },
                { name: 'Extensions', path: '/extensions', icon: Puzzle }, // Placeholder path
            ]
        },
        {
            title: 'OPTIMIZATION',
            items: [
                { name: 'Startup Items', path: '/startup', icon: Zap },
                { name: 'RAM Releaser', path: '/ram', icon: Cpu }, // Placeholder path
            ]
        },
        {
            title: 'HOMEBREW',
            items: [
                { name: 'Homebrew Manager', icon: Terminal, path: '/homebrew' },
            ]
        },
        {
            title: 'ARCADE',
            items: [
                { name: 'Arcade Mode', icon: Rocket, path: '/arcade' },
            ]
        },
        {
            title: 'ADVANCED',
            items: [
                { name: 'Duplicate Finder', icon: Copy, path: '/duplicates' },
                { name: 'Privacy Guard', icon: Shield, path: '/privacy' },
            ]
        }
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Dashboard Link always at top */}
            <div className={styles.dashboardSection}>
                <Link
                    href="/"
                    className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
                >
                    <Gauge className={styles.icon} />
                    <span>Dashboard</span>
                </Link>
            </div>

            <div className={styles.scrollArea}>
                {menuGroups.map((group, index) => (
                    <div key={index} className={styles.group}>
                        <h4 className={styles.groupTitle}>{group.title}</h4>
                        <div className={styles.groupItems}>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                                    >
                                        <Icon className={styles.icon} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
