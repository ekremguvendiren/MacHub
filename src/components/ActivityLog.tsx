import { Trash2, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { useLogs } from '../contexts/LogContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityLog() {
    const { logs, clearLogs } = useLogs();

    return (
        <div className="activity-log-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                        <span style={{ marginLeft: 10, fontWeight: 600, color: 'var(--text-primary)' }}>System Activity</span>
                    </div>
                    <button className="secondary" onClick={clearLogs} style={{ padding: '5px 10px', fontSize: 12 }}>
                        <Trash2 size={12} style={{ marginRight: 5 }} /> Clear Logs
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', background: 'rgba(0,0,0,0.2)' }}>
                    {logs.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Clock size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <AnimatePresence>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            padding: '12px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 15,
                                            fontSize: 13
                                        }}
                                    >
                                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12, minWidth: 80 }}>
                                            {log.timestamp}
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                            {log.type === 'success' && <CheckCircle size={16} color="#32d74b" />}
                                            {log.type === 'error' && <AlertCircle size={16} color="#ff453a" />}
                                            {log.type === 'warning' && <AlertCircle size={16} color="#ff9f0a" />}
                                            {log.type === 'info' && <Info size={16} color="#0a84ff" />}

                                            <span style={{
                                                color: log.type === 'error' ? '#ff453a' : 'var(--text-primary)',
                                                flex: 1
                                            }}>
                                                {log.message}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
