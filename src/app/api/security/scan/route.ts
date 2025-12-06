import { NextResponse } from 'next/server';
import { executeShellCommand } from '@/lib/shell';
import { ADWARE_SIGNATURES } from '@/lib/adware_signatures';
import os from 'os';

export async function POST(request: Request) {
    try {
        const homeDir = os.homedir();
        const foundThreats = [];

        // 1. Scan Launch Agents
        try {
            const cmd = `ls "${homeDir}/Library/LaunchAgents"`;
            const { stdout } = await executeShellCommand(cmd);
            const files = stdout.split('\n');

            for (const file of files) {
                const threat = ADWARE_SIGNATURES.launchAgents.find(sig => sig.name === file);
                if (threat) {
                    foundThreats.push({
                        type: 'LaunchAgent',
                        name: file,
                        path: `${homeDir}/Library/LaunchAgents/${file}`,
                        threatLevel: threat.threatLevel
                    });
                }
            }
        } catch (e) {
            // Directory might not exist or access issues
        }

        // 2. Scan Chrome Extensions (Basic Check)
        // Chrome extensions are at ~/Library/Application Support/Google/Chrome/Default/Extensions/ID/VERSION
        try {
            const chromeExtPath = `${homeDir}/Library/Application Support/Google/Chrome/Default/Extensions`;
            const cmd = `ls "${chromeExtPath}"`; // List IDs
            const { stdout } = await executeShellCommand(cmd);
            const installedIds = stdout.split('\n');

            for (const id of installedIds) {
                const threat = ADWARE_SIGNATURES.extensions.find(sig => sig.id === id);
                if (threat) {
                    foundThreats.push({
                        type: 'Chrome Extension',
                        name: threat.name,
                        id: id,
                        threatLevel: threat.threatLevel
                    });
                }
            }
        } catch (e) {
            // Chrome might not be installed
        }

        return NextResponse.json({ success: true, threats: foundThreats });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
