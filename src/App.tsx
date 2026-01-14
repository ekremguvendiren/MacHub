import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import {
  Trash2,
  Cpu,
  HardDrive,
  Activity,
  RotateCw,
  Zap,
  Eraser,
  Gamepad2,
  FileSearch,
  Grid,
  ScrollText,
  ShieldCheck,
  Lock as LockIcon
} from 'lucide-react';
import './App.css';
import GamesHub from './components/GamesHub';
import StartupManager from './components/StartupManager';
import SecurityScan from './components/SecurityScan';
import LargeFileFinder from './components/LargeFileFinder';
import BrewInstaller from './components/BrewInstaller';
import InternetAnalyzer from './components/InternetAnalyzer';
import FileConverter from './components/FileConverter';
import ActivityLog from './components/ActivityLog';
import PasswordGenerator from './components/PasswordGenerator';
import SecureVault from './components/SecureVault';
import { useLogs } from './contexts/LogContext';

interface SystemStats {
  cpu_usage: number;
  total_memory: number;
  used_memory: number;
  free_memory: number;
}

interface HardwareStats {
  avg_temp: number;
  fan_speed: number | null;
}

interface DiskInfo {
  total_space: number;
  available_space: number;
  is_removable: boolean;
}

function App() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [hwStats] = useState<HardwareStats | null>(null); // Hardware stats disabled for stability
  const [disk, setDisk] = useState<DiskInfo | null>(null);
  const [trashSize, setTrashSize] = useState<string>('Checking...');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appVersion, setAppVersion] = useState('v0.1.0');

  const { addLog } = useLogs();

  useEffect(() => {
    getVersion().then(v => setAppVersion(`v${v}`)).catch(() => setAppVersion('v1.0.0'));
  }, []);

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
    addLog('Initiating trash cleanup...', 'info');
    try {
      const res = await invoke<string>('clean_trash');
      setStatusMsg(res);
      addLog(`Trash cleanup completed: ${res}`, 'success');
      fetchStats(); // Update size
    } catch (e: any) {
      setStatusMsg(`Error: ${e}`);
      addLog(`Trash cleanup failed: ${e}`, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleDeepClean = async () => {
    setLoading(true);
    setStatusMsg('Cleaning Logs & Caches...');
    addLog('Starting deep clean (Logs & Caches)...', 'info');
    try {
      const res = await invoke<string>('clean_logs_caches');
      setStatusMsg(res);
      addLog('Deep clean successful.', 'success');
    } catch (e: any) {
      setStatusMsg(`Error: ${e}`);
      addLog(`Deep clean encountered an error: ${e}`, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  useEffect(() => {
    // Hardware stats fetch commented out for stability
  }, []);


  const formatBytes = (bytes: number) => {
    const split = bytes / (1024 * 1024 * 1024);
    return `${split.toFixed(2)} GB`;
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <div className="sidebar-header" style={{ marginBottom: 30, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/icon.png" alt="MacHub" style={{ width: 40, height: 40, borderRadius: '22%' }} />
            <h1 style={{ fontSize: 22, margin: 0, letterSpacing: '-0.5px' }}>MacHub</h1>
          </div>

          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <Zap size={18} /> Dashboard
          </button>
          <button className={activeTab === 'cleanup' ? 'active' : ''} onClick={() => setActiveTab('cleanup')}>
            <Trash2 size={18} /> Cleanup
          </button>
          <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
            <ScrollText size={18} /> Activity
          </button>
          <button className={activeTab === 'security' || activeTab.startsWith('sec_') ? 'active' : ''} onClick={() => setActiveTab('security')}>
            <ShieldCheck size={18} /> Security
          </button>
          <button className={activeTab === 'tools' ? 'active' : ''} onClick={() => setActiveTab('tools')}>
            <Grid size={18} /> Tools
          </button>
          <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}>
            <Gamepad2 size={18} /> Games
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 0',
          borderTop: '1px solid var(--border-color)',
          marginTop: 10,
          color: 'var(--text-secondary)',
          fontSize: 11,
          textAlign: 'center',
          letterSpacing: 0.5
        }}>
          {appVersion}
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Custom Title Bar Area */}
        <div data-tauri-drag-region className="titlebar" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
          {/* Draggable area */}
        </div>

        <div style={{ marginTop: '0px', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
          {statusMsg && (
            <div className="card" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <RotateCw className="spin" size={16} style={{ marginBottom: -3, marginRight: 8 }} />
              {statusMsg}
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 5 }}>
            {activeTab === 'dashboard' && (
              <>
                <h1>System Overview</h1>
                <div className="stat-grid">
                  <div className="card stat-item">
                    <div className="stat-label"><Cpu size={16} /> CPU Load</div>
                    <div className="stat-value">{stats?.cpu_usage?.toFixed(1) || '0.0'}%</div>
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
                  <div className="card stat-item">
                    <div className="stat-label"><Activity size={16} /> Thermal</div>
                    <div className="stat-value">{hwStats?.avg_temp ? `${hwStats.avg_temp.toFixed(0)}°C` : 'N/A'}</div>
                    <div className="stat-label" style={{ marginTop: 8, fontSize: 12 }}>Avg. Temp</div>
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

            {activeTab === 'activity' && (
              <>
                <h1>Activity Monitoring</h1>
                <ActivityLog />
              </>
            )}

            {activeTab === 'tools' && (
              <>
                <h1>Tools & Utilities</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Additional utilities to manage your system.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>

                  <div className="card tool-card" onClick={() => setActiveTab('internet')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(10, 132, 255, 0.1)', borderRadius: 10 }}>
                        <Activity size={24} color="#0a84ff" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Internet Analyzer</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Test Check speed & latency</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('converter')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(255, 159, 10, 0.1)', borderRadius: 10 }}>
                        <RotateCw size={24} color="#ff9f0a" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>File Converter</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Convert images</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('largefiles')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(48, 209, 88, 0.1)', borderRadius: 10 }}>
                        <FileSearch size={24} color="#30d158" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Large File Finder</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Find space hogs</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('startup')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(191, 90, 242, 0.1)', borderRadius: 10 }}>
                        <Zap size={24} color="#bf5af2" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Startup Manager</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Speed up login</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('brew')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(255, 55, 95, 0.1)', borderRadius: 10 }}>
                        <Grid size={24} color="#ff375f" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Brew App Store</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Install apps easily</div>
                      </div>
                    </div>
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
                <h1>Security Center</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Protect your privacy and data.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>

                  <div className="card tool-card" onClick={() => setActiveTab('sec_scanner')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(255, 59, 48, 0.1)', borderRadius: 10 }}>
                        <Zap size={24} color="#ff3b30" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Vulnerability Scan</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Find threats</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('sec_gen')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(48, 209, 88, 0.1)', borderRadius: 10 }}>
                        <ShieldCheck size={24} color="#30d158" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Password Generator</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Create strong keys</div>
                      </div>
                    </div>
                  </div>

                  <div className="card tool-card" onClick={() => setActiveTab('sec_vault')} style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                      <div style={{ padding: 10, background: 'rgba(10, 132, 255, 0.1)', borderRadius: 10 }}>
                        <LockIcon size={24} color="#0a84ff" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>Secure Vault</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Encrypted storage</div>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {activeTab === 'sec_scanner' && (
              <>
                <h1>Security Scan</h1>
                <SecurityScan />
              </>
            )}

            {activeTab === 'sec_gen' && (
              <>
                <button className="secondary" onClick={() => setActiveTab('security')} style={{ marginBottom: 20 }}>
                  &larr; Back to Security
                </button>
                <PasswordGenerator />
              </>
            )}

            {activeTab === 'sec_vault' && (
              <>
                <button className="secondary" onClick={() => setActiveTab('security')} style={{ marginBottom: 20 }}>
                  &larr; Back to Security
                </button>
                <SecureVault />
              </>
            )}

            {activeTab === 'converter' && (
              <>
                <h1>File Converter</h1>
                <FileConverter />
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
    </div>
  );
}

export default App;
