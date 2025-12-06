import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

// Helper to find associated files for an app
async function findAssociatedFiles(appName: string, bundleId: string | null): Promise<string[]> {
    const homeDir = os.homedir();
    const searchPaths = [
        path.join(homeDir, 'Library/Application Support'),
        path.join(homeDir, 'Library/Caches'),
        path.join(homeDir, 'Library/Preferences'),
        path.join(homeDir, 'Library/Saved Application State'),
        path.join(homeDir, 'Library/Logs'),
    ];

    const foundFiles: string[] = [];
    const searchTerms = [appName];
    if (bundleId) searchTerms.push(bundleId);

    // Simplistic search strategy: check if folder/file starts with or contains app name
    // In production, we'd need exact bundle ID matching from Info.plist
    for (const baseDir of searchPaths) {
        try {
            const files = await readdir(baseDir);
            for (const file of files) {
                const lowerFile = file.toLowerCase();
                if (searchTerms.some(term => lowerFile.includes(term.toLowerCase()))) {
                    foundFiles.push(path.join(baseDir, file));
                }
            }
        } catch (e) { }
    }

    return foundFiles;
}

export async function GET() {
    try {
        const appsDir = '/Applications';
        const files = await readdir(appsDir);

        const apps = [];
        for (const file of files) {
            if (file.endsWith('.app')) {
                try {
                    const fullPath = path.join(appsDir, file);
                    const stats = await stat(fullPath);
                    apps.push({
                        id: file,
                        name: file.replace('.app', ''),
                        path: fullPath,
                        icon: '/placeholder-app-icon.png',
                        size: 'Calculating...', // Real size calculation recurses, too slow for list
                        lastUsed: new Date(stats.atime).toLocaleDateString(),
                        selected: false
                    });
                } catch (e) { }
            }
        }

        return NextResponse.json({ success: true, apps });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { action, apps } = await request.json();

        if (action === 'delete' && Array.isArray(apps)) {
            const trashBase = path.join(os.homedir(), '.Trash', 'CleanMac_Uninstalled');
            if (!fs.existsSync(trashBase)) {
                await mkdir(trashBase, { recursive: true });
            }

            let results = [];

            for (const app of apps) {
                const appName = app.name;
                // 1. Move the Main App
                const appDest = path.join(trashBase, `${appName}_${Date.now()}.app`);
                try {
                    await rename(app.path, appDest);
                    results.push(`Moved App: ${appName}`);
                } catch (e) {
                    results.push(`Failed to move App: ${appName}`);
                    continue; // Don't delete associated files if app move fails
                }

                // 2. Find and Move Associated Files
                // Heuristic: Use app name as search term. In real app, we parse Info.plist for CFBundleIdentifier
                const associatedFiles = await findAssociatedFiles(appName, null);

                for (const file of associatedFiles) {
                    try {
                        const fileName = path.basename(file);
                        const dest = path.join(trashBase, `${appName}_associated_${fileName}`);
                        await rename(file, dest);
                        results.push(`Moved Orphan: ${fileName}`);
                    } catch (e) { }
                }
            }

            return NextResponse.json({ success: true, message: `Operations complete. Check Trash.`, details: results });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
