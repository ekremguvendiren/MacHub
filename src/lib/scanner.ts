import { executeShellCommand } from './shell';
import path from 'path';

export interface FileItem {
    id: string;
    name: string;
    path: string;
    size: number;
    sizeStr: string;
    type: 'video' | 'image' | 'archive' | 'other';
    lastAccess: string;
}

export async function scanLargeFiles(directory: string): Promise<FileItem[]> {
    // Use 'find' command to look for files larger than 100MB
    // Note: This is a simplified example. Production would need more robust parsing.
    // -type f: file
    // -size +50M: larger than 50MB
    // -print0: null-terminated for safety
    // xargs -0 ls -lh: list detailed info

    // For safety/demo in this environment, we might just mock or use a safer 'ls' if 'find' is too heavy.
    // We will try a 'find' command limited to depth 2 to avoid hanging.

    try {
        const cmd = `find "${directory}" -maxdepth 3 -type f -size +50M -exec ls -lh {} \\; | head -n 20`;
        const { stdout } = await executeShellCommand(cmd);

        const lines = stdout.split('\n').filter(line => line.length > 0);

        return lines.map((line, index) => {
            // Very basic parsing for `ls -lh` output
            // -rw-r--r--  1 user  staff   100M Dec  6 12:00 /path/to/file
            const parts = line.split(/\s+/);
            const sizeIndex = 4;
            const dateIndex = 5;
            const pathIndex = 8; // Roughly

            const sizeStr = parts[sizeIndex] || '0B';
            const filePath = parts.slice(pathIndex).join(' '); // Rejoin remaining parts as path
            const fileName = path.basename(filePath);

            // Determine type
            const ext = path.extname(fileName).toLowerCase();
            let type: FileItem['type'] = 'other';
            if (['.mp4', '.mov', '.mkv'].includes(ext)) type = 'video';
            if (['.jpg', '.png', '.heic'].includes(ext)) type = 'image';
            if (['.zip', '.dmg', '.pkg', '.iso'].includes(ext)) type = 'archive';

            return {
                id: `file-${index}`,
                name: fileName,
                path: filePath,
                size: parseSize(sizeStr), // We need a helper for this number
                sizeStr: sizeStr,
                type: type,
                lastAccess: 'Unknown' // ls -lh gives mod time, not access time usually
            };
        });
    } catch (error) {
        console.error('Scan failed', error);
        return [];
    }
}

function parseSize(sizeStr: string): number {
    if (!sizeStr) return 0;
    const units = { 'K': 1024, 'M': 1024 * 1024, 'G': 1024 * 1024 * 1024 };
    const unit = sizeStr.slice(-1);
    const val = parseFloat(sizeStr);

    if (units[unit as keyof typeof units]) {
        return val * units[unit as keyof typeof units];
    }
    return val;
}
