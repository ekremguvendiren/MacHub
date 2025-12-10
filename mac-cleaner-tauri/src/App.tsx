import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Trash2,
  Cpu,
  HardDrive,
  Activity,
  RotateCw,
  Zap,
  Package,
  Eraser,
  Gamepad2,
  ShieldCheck,
  FileSearch,
  Power,
  Wifi
} from 'lucide-react';
import './App.css';
import GamesHub from './components/GamesHub';
import StartupManager from './components/StartupManager';
import SecurityScan from './components/SecurityScan';
import LargeFileFinder from './components/LargeFileFinder';
import BrewInstaller from './components/BrewInstaller';
import InternetAnalyzer from './components/InternetAnalyzer';

interface SystemStats {
  cpu_usage: number;
  total_memory: number;
  used_memory: number;
  free_memory: number;
}

interface DiskInfo {
  total_space: number;
  available_space: number;
  is_removable: boolean;
}

function App() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [disk, setDisk] = useState<DiskInfo | null>(null);
  const [trashSize, setTrashSize] = useState<string>('Checking...');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchStats = async () => {
    try {
      const s = await invoke<SystemStats>('get_system_stats');
      setStats(s);

      const d = await invoke<DiskInfo>('get_disk_info');
      setDisk(d);

      const t = await invoke<string>('get_trash_size');
      setTrashSize(t);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

  const handleCleanTrash = async () => {
    setLoading(true);
    setStatusMsg('Emptying Trash...');
    try {
      const res = await invoke<string>('clean_trash');
      setStatusMsg(res);
      fetchStats(); // Update size
    } catch (e: any) {
      setStatusMsg(`Error: ${e}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleDeepClean = async () => {
    setLoading(true);
    setStatusMsg('Cleaning Logs & Caches...');
    try {
      const res = await invoke<string>('clean_logs_caches');
      setStatusMsg(res);
    } catch (e: any) {
      setStatusMsg(`Error: ${e}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };



  const formatBytes = (bytes: number) => {
    const split = bytes / (1024 * 1024 * 1024);
    return `${split.toFixed(2)} GB`;
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">
          <Zap size={20} color="#9d50bb" fill="#9d50bb" />
          <span>MacCleaner</span>
        </div>

        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          <Activity size={18} /> Dashboard
        </button>
        <button className={activeTab === 'cleanup' ? 'active' : ''} onClick={() => setActiveTab('cleanup')}>
          <Trash2 size={18} /> Cleanup
        </button>

        <div className="sidebar-divider" style={{ margin: '10px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

        <button className={activeTab === 'brew' ? 'active' : ''} onClick={() => setActiveTab('brew')}>
          <Package size={18} /> Brew App Store
        </button>
        <button className={activeTab === 'internet' ? 'active' : ''} onClick={() => setActiveTab('internet')}>
          <Wifi size={18} /> Internet Analyzer
        </button>
        <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
          <ShieldCheck size={18} /> Security Scan
        </button>
        <button className={activeTab === 'startup' ? 'active' : ''} onClick={() => setActiveTab('startup')}>
          <Power size={18} /> Startup Manager
        </button>
        <button className={activeTab === 'largefiles' ? 'active' : ''} onClick={() => setActiveTab('largefiles')}>
          <FileSearch size={18} /> Large Files
        </button>

        <div className="sidebar-divider" style={{ margin: '10px 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

        <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}>
          <Gamepad2 size={18} /> Games
        </button>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Custom Title Bar Area */}
        <div data-tauri-drag-region className="titlebar" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
          {/* Draggable area */}
        </div>

        <div style={{ marginTop: '0px' }}>
          {statusMsg && (
            <div className="card" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <RotateCw className="spin" size={16} style={{ marginBottom: -3, marginRight: 8 }} />
              {statusMsg}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <h1>System Overview</h1>
              <div className="stat-grid">
                <div className="card stat-item">
                  <div className="stat-label"><Cpu size={16} /> CPU Load</div>
                  <div className="stat-value">{stats?.cpu_usage.toFixed(1)}%</div>
                  <div className="stat-label" style={{ marginTop: 8, fontSize: 12 }}>System & User</div>
                </div>
                <div className="card stat-item">
                  <div className="stat-label"><Activity size={16} /> RAM Usage</div>
                  <div className="stat-value">{stats ? formatBytes(stats.used_memory) : '-'}</div>
                  <div className="stat-label" style={{ marginTop: 8, fontSize: 12 }}>of {stats ? formatBytes(stats.total_memory) : '-'} Total</div>
                </div>
                <div className="card stat-item">
                  <div className="stat-label"><HardDrive size={16} /> Disk Free</div>
                  <div className="stat-value">{disk ? formatBytes(disk.available_space) : '-'}</div>
                  <div className="stat-label" style={{ marginTop: 8, fontSize: 12 }}>of {disk ? formatBytes(disk.total_space) : '-'} Total</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="stat-label">Quick Actions</div>
                    <div style={{ fontSize: 13, marginTop: 5, color: 'var(--text-secondary)' }}>Optimize your system with one click.</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="secondary" onClick={() => setActiveTab('cleanup')}>
                      Go to Cleanup
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'cleanup' && (
            <>
              <h1>System Cleanup</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Free up space by removing unnecessary files.</p>

              <div className="card">
                <h2><Trash2 size={18} style={{ verticalAlign: 'text-bottom', marginRight: 8 }} /> Trash Bin</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="stat-value" style={{ fontSize: 24 }}>{trashSize}</div>
                    <div className="stat-label">Current Size</div>
                  </div>
                  <button className="danger" onClick={handleCleanTrash} disabled={loading}>
                    <Trash2 size={16} /> Empty Trash
                  </button>
                </div>
              </div>

              <div className="card">
                <h2><Eraser size={18} style={{ verticalAlign: 'text-bottom', marginRight: 8 }} /> System Logs & Caches</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="stat-label">Safe to remove files</div>
                  <button className="primary" onClick={handleDeepClean} disabled={loading}>
                    <Zap size={16} /> Deep Clean
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'brew' && (
            <>
              <h1>Brew App Store</h1>
              <BrewInstaller />
            </>
          )}

          {activeTab === 'internet' && (
            <>
              <h1>Internet Analyzer</h1>
              <InternetAnalyzer />
            </>
          )}

          {activeTab === 'security' && (
            <>
              <h1>Security Scan</h1>
              <SecurityScan />
            </>
          )}

          {activeTab === 'startup' && (
            <>
              <h1>Startup Manager</h1>
              <StartupManager />
            </>
          )}

          {activeTab === 'largefiles' && (
            <>
              <h1>Large File Assistant</h1>
              <LargeFileFinder />
            </>
          )}

          {activeTab === 'games' && (<GamesHub />)}
        </div>
      </div>
    </div>
  );
}

export default App;
