import { NextResponse } from 'next/server';
import { executeShellCommand } from '@/lib/shell';

export async function POST(request: Request) {
    try {
        const { command } = await request.json();

        // Whitelist commands
        const allowed = ['outdated', 'update', 'upgrade', 'cleanup'];
        if (!allowed.includes(command)) {
            return NextResponse.json({ success: false, error: 'Command not allowed' }, { status: 403 });
        }

        let shellCmd = '';
        // Assume brew is in path or known location. On Apple Silicon it's /opt/homebrew/bin/brew
        const brewPath = '/opt/homebrew/bin/brew';

        // Fallback check or user env might be needed. 
        // We will try executing just 'brew' assuming it's in PATH for the node process, 
        // if not we attempt the absolute path.

        if (command === 'outdated') {
            shellCmd = `${brewPath} outdated --json`;
        } else if (command === 'update') {
            shellCmd = `${brewPath} update`;
        } else if (command === 'upgrade') {
            shellCmd = `${brewPath} upgrade`;
        } else if (command === 'cleanup') {
            shellCmd = `${brewPath} cleanup`;
        }

        const { stdout, stderr } = await executeShellCommand(shellCmd);

        if (command === 'outdated') {
            // Parse JSON output from brew
            try {
                const data = JSON.parse(stdout); // brew outdated --json returns array of formulae/casks
                // Normalizing the structure
                const formulae = data.formulae?.map((f: any) => ({
                    name: f.name,
                    version: f.installed_versions?.[0] || 'unknown',
                    latest: f.current_version,
                    type: 'Formula',
                    outdated: true
                })) || [];

                const casks = data.casks?.map((c: any) => ({
                    name: c.name,
                    version: c.installed_versions?.[0] || 'unknown',
                    latest: c.current_version,
                    type: 'Cask',
                    outdated: true
                })) || [];

                return NextResponse.json({ success: true, packages: [...formulae, ...casks] });
            } catch (e) {
                // Fallback if not JSON or empty
                return NextResponse.json({ success: true, packages: [], raw: stdout });
            }
        }

        return NextResponse.json({ success: true, output: stdout, stderr });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
