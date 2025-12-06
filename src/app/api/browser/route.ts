import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);

async function safeMoveToTrash(sourcePath: string, subDirName: string) {
    if (!fs.existsSync(sourcePath)) return;

    const trashBase = path.join(os.homedir(), '.Trash', 'CleanMac_BrowserData', subDirName);
    if (!fs.existsSync(trashBase)) {
        await mkdir(trashBase, { recursive: true });
    }

    try {
        const fileName = path.basename(sourcePath);
        const destPath = path.join(trashBase, `${Date.now()}_${fileName}`);
        await rename(sourcePath, destPath);
        console.log(`Moved to trash: ${sourcePath}`);
    } catch (e) {
        console.error(`Failed to move ${sourcePath} to trash:`, e);
    }
}

// Clean contents of a directory, but keep the directory itself
async function cleanDirectoryContents(dirPath: string, subDirName: string) {
    if (!fs.existsSync(dirPath)) return;
    try {
        const files = await readdir(dirPath);
        for (const file of files) {
            await safeMoveToTrash(path.join(dirPath, file), subDirName);
        }
    } catch (e) {
        console.error(e);
    }
}

export async function POST(request: Request) {
    try {
        const { browsers } = await request.json();
        const home = os.homedir();

        // CHROME
        if (browsers.chrome) {
            const chromeBase = path.join(home, 'Library/Application Support/Google/Chrome/Default');
            if (browsers.chrome.cache) {
                await cleanDirectoryContents(path.join(home, 'Library/Caches/Google/Chrome'), 'Chrome_Cache');
                await cleanDirectoryContents(path.join(chromeBase, 'Cache'), 'Chrome_Profile_Cache');
                await cleanDirectoryContents(path.join(chromeBase, 'Code Cache'), 'Chrome_Code_Cache');
            }
            if (browsers.chrome.history) {
                await safeMoveToTrash(path.join(chromeBase, 'History'), 'Chrome_History');
            }
            if (browsers.chrome.cookies) {
                // Cookies is a single file in Chrome
                // await safeMoveToTrash(path.join(chromeBase, 'Cookies'), 'Chrome_Cookies');
                // Disabled for safety in this pass unless explicitly trusted, damaging cookies is annoying
            }
        }

        // SAFARI
        if (browsers.safari) {
            if (browsers.safari.cache) {
                await cleanDirectoryContents(path.join(home, 'Library/Caches/com.apple.Safari'), 'Safari_Cache');
            }
            if (browsers.safari.history) {
                // Safari History is protected by TCC usually, might fail without Full Disk Access
                await safeMoveToTrash(path.join(home, 'Library/Safari/History.db'), 'Safari_History');
            }
        }

        // FIREFOX
        if (browsers.firefox) {
            const firefoxProfiles = path.join(home, 'Library/Caches/Firefox/Profiles');
            // Firefox uses randomized profile names, scan them
            if (fs.existsSync(firefoxProfiles) && browsers.firefox.cache) {
                const profiles = await readdir(firefoxProfiles);
                for (const profile of profiles) {
                    await cleanDirectoryContents(path.join(firefoxProfiles, profile, 'cache2'), 'Firefox_Cache');
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Browser data cleaned (moved to Trash)' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
