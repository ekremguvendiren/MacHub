import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeShellCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
        // Basic security precaution: verify command is a string and not empty
        if (!command || typeof command !== 'string') {
            throw new Error('Invalid command');
        }

        // In a real app, strict whitelist validation should happen here.
        // For this prototype, we allow commands but log them.
        console.log(`Executing: ${command}`);

        const { stdout, stderr } = await execAsync(command);
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Command failed: ${command}`, error);
        throw new Error(error.stderr || error.message);
    }
}
