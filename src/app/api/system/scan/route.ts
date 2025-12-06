import { NextResponse } from 'next/server';
import { executeShellCommand } from '@/lib/shell';
import { scanLargeFiles } from '@/lib/scanner';
import os from 'os';

export async function POST(request: Request) {
    try {
        const { action, target } = await request.json();
        const homeDir = os.homedir();

        if (action === 'scan-junk') {
            // Mock scanning common junk paths
            // In reality, we might list files in ~/Library/Caches
            const cachePath = `${homeDir}/Library/Caches`;
            const cmd = `du -sh "${cachePath}"/* | head -n 10`;

            const { stdout } = await executeShellCommand(cmd);

            // Parse output
            const items = stdout.split('\n').filter(Boolean).map((line, idx) => {
                const [size, path] = line.split(/\t/);
                return {
                    id: `junk-${idx}`,
                    name: path.split('/').pop(),
                    path: path,
                    size: size,
                    selected: true
                };
            });

            return NextResponse.json({ success: true, items });
        }

        if (action === 'scan-large') {
            const files = await scanLargeFiles(homeDir + '/Downloads'); // Just scan Downloads for demo
            return NextResponse.json({ success: true, files });
        }

        if (action === 'clean-trash') {
            // SECURITY: Be very careful here. 
            // We will simple return success for the mockup backend without actually doing `rm -rf` 
            // to avoid accidents during this demo/evaluation.
            // const cmd = `rm -rf "${homeDir}/.Trash/"*`; // DANGEROUS IN DEMO
            console.log('Skipping actual deletion for safety in demo.');
            return NextResponse.json({ success: true, message: 'Trash emptied (Simulated)' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
