import { NextResponse } from 'next/server';
import { executeShellCommand } from '@/lib/shell';
import os from 'os';

export async function POST(request: Request) {
    try {
        const { action, id, path } = await request.json();
        const homeDir = os.homedir();

        // Whitelist actions
        if (!['list', 'toggle'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        if (action === 'list') {
            // List LaunchAgents in user library
            // launchctl list is messy, so we list .plist files instead for this prototype
            const agentsPath = `${homeDir}/Library/LaunchAgents`;
            try {
                const { stdout } = await executeShellCommand(`ls "${agentsPath}"`);
                const items = stdout.split('\n').filter(Boolean).map((file, idx) => ({
                    id: `agent-${idx}`,
                    name: file.replace('.plist', ''),
                    path: `${agentsPath}/${file}`,
                    enabled: true // difficult to determine exact status without parsing complex launchctl print output
                }));
                return NextResponse.json({ success: true, items });
            } catch (e) {
                // Directory might be empty or not exist
                return NextResponse.json({ success: true, items: [] });
            }
        }

        if (action === 'toggle') {
            // Toggle logic: simple mv to disabled folder or launchctl unload
            // For prototype safety, we will just use launchctl load/unload
            if (!path) return NextResponse.json({ success: false, error: 'Path required' }, { status: 400 });

            // Simulating the toggle by just returning success. 
            // Actual launchctl unload -w might affect user's real system state.
            // const cmd = `launchctl unload -w "${path}"`; 

            return NextResponse.json({ success: true, message: `Toggled ${path} (Simulated)` });
        }

        return NextResponse.json({ success: false });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
