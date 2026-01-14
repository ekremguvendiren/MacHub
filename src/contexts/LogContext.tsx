import { createContext, useContext, useState, ReactNode } from 'react';

export type LogType = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
    id: string;
    message: string;
    type: LogType;
    timestamp: string;
}

interface LogContextType {
    logs: LogEntry[];
    addLog: (message: string, type?: LogType) => void;
    clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = (message: string, type: LogType = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const id = Math.random().toString(36).substr(2, 9);
        setLogs((prev) => [{ id, message, type, timestamp }, ...prev]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <LogContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </LogContext.Provider>
    );
}

export function useLogs() {
    const context = useContext(LogContext);
    if (context === undefined) {
        throw new Error('useLogs must be used within a LogProvider');
    }
    return context;
}
