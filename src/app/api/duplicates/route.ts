import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

// Helper to calculate file hash
async function calculateHash(filePath: string, size: number): Promise<string> {
    const BUFFER_SIZE = 64 * 1024; // 64KB
    // If file is large (> 50MB), use partial hashing for speed
    if (size > 50 * 1024 * 1024) {
        const fd = await promisify(fs.open)(filePath, 'r');
        try {
            const buffer = Buffer.alloc(BUFFER_SIZE * 3);

            // Read start
            await promisify(fs.read)(fd, buffer, 0, BUFFER_SIZE, 0);

            // Read middle
            const mid = Math.floor(size / 2);
            await promisify(fs.read)(fd, buffer, BUFFER_SIZE, BUFFER_SIZE, mid);

            // Read end
            const end = size - BUFFER_SIZE;
            await promisify(fs.read)(fd, buffer, BUFFER_SIZE * 2, BUFFER_SIZE, end);

            return crypto.createHash('md5').update(buffer).digest('hex');
        } finally {
            await promisify(fs.close)(fd);
        }
    } else {
        // Full hash for smaller files
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }
}

// Recursive file scanner
async function scanDirectory(dir: string, fileList: { path: string, size: number }[], depth = 0) {
    if (depth > 4) return; // Limit depth for safety
    try {
        const files = await readdir(dir);
        for (const file of files) {
            if (file.startsWith('.')) continue; // Skip hidden files
            const filePath = path.join(dir, file);
            try {
                const stats = await stat(filePath);
                if (stats.isDirectory()) {
                    await scanDirectory(filePath, fileList, depth + 1);
                } else if (stats.isFile() && stats.size > 1024) { // Ignore tiny files
                    fileList.push({ path: filePath, size: stats.size });
                }
            } catch (e) {
                // Access denied or other error, skip
            }
        }
    } catch (e) {
        // Directory access error
    }
}

export async function POST(request: Request) {
    try {
        const { action, scannedPath, filesToDelete } = await request.json(); // filesToDelete for clean action

        if (action === 'scan') {
            const targetDir = path.join(os.homedir(), 'Downloads'); // Default scan target
            const allFiles: { path: string, size: number }[] = [];

            console.log(`Scanning duplicats in ${targetDir}...`);
            await scanDirectory(targetDir, allFiles);

            // Group by size
            const sizeMap = new Map<number, typeof allFiles>();
            for (const file of allFiles) {
                const list = sizeMap.get(file.size) || [];
                list.push(file);
                sizeMap.set(file.size, list);
            }

            // Filter for potential duplicates (count > 1)
            const potentialDuplicates = Array.from(sizeMap.values()).filter(list => list.length > 1);

            const duplicates = [];
            let groupId = 1;

            for (const group of potentialDuplicates) {
                // Hash comparison
                const hashMap = new Map<string, string[]>();
                for (const file of group) {
                    try {
                        const hash = await calculateHash(file.path, file.size);
                        const list = hashMap.get(hash) || [];
                        list.push(file.path);
                        hashMap.set(hash, list);
                    } catch (e) { }
                }

                for (const [hash, paths] of hashMap.entries()) {
                    if (paths.length > 1) {
                        duplicates.push({
                            id: `group-${groupId++}`,
                            size: group[0].size,
                            files: paths.map((p, idx) => ({
                                id: crypto.randomUUID(),
                                name: path.basename(p),
                                path: p,
                                selected: idx > 0 // Select all copies except the first one by default
                            }))
                        });
                    }
                }
            }

            return NextResponse.json({ success: true, duplicates });
        }

        if (action === 'clean' && Array.isArray(filesToDelete)) {
            // Safe removal: Move to Trash
            const trashBase = path.join(os.homedir(), '.Trash', 'CleanMac_Duplicates');
            if (!fs.existsSync(trashBase)) {
                await mkdir(trashBase, { recursive: true });
            }

            let deletedCount = 0;
            for (const filePath of filesToDelete) {
                try {
                    const fileName = path.basename(filePath);
                    const destPath = path.join(trashBase, `${Date.now()}_${fileName}`);
                    await rename(filePath, destPath);
                    deletedCount++;
                } catch (e) {
                    console.error(`Failed to move ${filePath} to trash:`, e);
                }
            }

            return NextResponse.json({ success: true, message: `Moved ${deletedCount} files to Trash` });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' });
    } catch (error: any) {
        console.error('Duplicate API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
