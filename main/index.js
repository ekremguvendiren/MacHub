const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let nextServer;

const BASE_URL = 'http://localhost:3000';

const fs = require('fs');

const startNextServer = () => {
    return new Promise((resolve, reject) => {
        // Helper to resolve the server path in both packed (ASAR) and unpacked environments
        // Helper to resolve the server path in both packed (ASAR) and unpacked environments
        const resolveServerPath = () => {
            const possiblePaths = [
                // 1. ASAR Unpacked (Top Priority for Spawned Process)
                // When "asarUnpack" is used, these files are NOT in app.asar, but in app.asar.unpacked
                ...(app.getAppPath().endsWith('.asar') ? [
                    path.join(app.getAppPath().replace(/\.asar$/, '.asar.unpacked'), 'server.js'),
                    path.join(app.getAppPath().replace(/\.asar$/, '.asar.unpacked'), '.next/standalone/server.js')
                ] : []),

                // 2. Standard electron-builder output (inside app.asar) - fallback
                path.join(app.getAppPath(), '.next/standalone/server.js'),

                // 3. Unpacked resources (if extraResources is used)
                path.join(process.resourcesPath, '.next/standalone/server.js'),

                // 4. Nested deeper in app.asar (common with some configs)
                path.join(app.getAppPath(), 'server/.next/standalone/server.js'),

                // 5. Nested in resources
                path.join(process.resourcesPath, 'server/.next/standalone/server.js'),

                // 6. Dev / Local structure
                path.join(__dirname, '../.next/standalone/server.js'),
                path.join(process.cwd(), '.next/standalone/server.js'),
            ];

            // Primary check: Specific known paths
            for (const p of possiblePaths) {
                console.log(`Checking path: ${p}`);
                if (fs.existsSync(p)) {
                    console.log(`Found Next.js server at: ${p}`);
                    return p;
                }
            }

            // Fallback: Recursive search if not found in standard locations
            // This handles cases where the structure is unpredictable inside the package
            console.log('Standard paths failed. Attempting recursive search...');

            const findFileRecursive = (dir, filename, depth = 0, maxDepth = 6) => {
                if (depth > maxDepth) return null;
                try {
                    const files = fs.readdirSync(dir);
                    // Check files in current dir first
                    if (files.includes(filename)) {
                        const fullPath = path.join(dir, filename);
                        // Strict validation: Ensure it's the Next.js server we are looking for
                        if (fullPath.includes('.next/standalone')) {
                            return fullPath;
                        }
                    }

                    // Then recursively check subdirectories
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stat = fs.statSync(filePath);
                        if (stat.isDirectory()) {
                            // optimization: prioritize directories that look like they contain the app
                            if (file === '.next' || file === 'standalone' || file === 'server') {
                                const found = findFileRecursive(filePath, filename, depth + 1, maxDepth);
                                if (found) return found;
                            } else if (!file.startsWith('.')) { // Skip hidden folders like .git
                                const found = findFileRecursive(filePath, filename, depth + 1, maxDepth);
                                if (found) return found;
                            }
                        }
                    }
                } catch (e) {
                    // Ignore access errors
                    return null;
                }
                return null;
            };

            // Search in app path first
            const foundInApp = findFileRecursive(app.getAppPath(), 'server.js');
            if (foundInApp) return foundInApp;

            // Search in resources path
            const foundInResources = findFileRecursive(process.resourcesPath, 'server.js');
            if (foundInResources) return foundInResources;

            return null;
        };

        const serverPath = resolveServerPath();

        // Check if we are in production (packaged) or dev
        const isProd = app.isPackaged;

        if (!isProd) {
            console.log('Running in development mode');
            resolve();
            return;
        }

        if (!serverPath) {
            const msg = 'Could not find Next.js standalone server. Checked app.getAppPath(), process.resourcesPath, and current directory.';
            console.error(msg);
            reject(new Error(msg));
            return;
        }

        const nextDir = path.dirname(serverPath);
        console.log('Starting Next.js server from:', serverPath);
        console.log('Server CWD:', nextDir);

        nextServer = spawn(process.execPath, [serverPath], {
            env: { ...process.env, PORT: 3000, HOST: 'localhost', ELECTRON_RUN_AS_NODE: '1' },
            cwd: nextDir,
            stdio: 'inherit'
        });

        nextServer.on('error', (err) => {
            console.error('Failed to start Next.js server:', err);
            reject(err);
        });

        // Wait for port to be ready
        let retries = 0;
        const maxRetries = 20; // 4 seconds total

        const checkServer = () => {
            http.get(BASE_URL, (res) => {
                if (res.statusCode === 200) {
                    console.log('checkServer: Server is ready (200 OK)');
                    resolve();
                } else {
                    console.log(`checkServer: Server responded with status ${res.statusCode}, retrying...`);
                    retry();
                }
            }).on('error', () => {
                retry();
            });
        };

        const retry = () => {
            retries++;
            if (retries >= maxRetries) {
                reject(new Error('Timed out waiting for Next.js server'));
            } else {
                setTimeout(checkServer, 200);
            }
        };

        checkServer();
    });
};

const createWindow = () => {
    console.log('createWindow: Init');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hiddenInset', // Mac-like title bar
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        vibrancy: 'under-window', // Mac vibrancy
        visualEffectState: 'active',
    });
    console.log('createWindow: BrowserView created');

    console.log(`createWindow: Loading URL ${BASE_URL}`);
    mainWindow.loadURL(BASE_URL);
    console.log('createWindow: URL loaded (async)');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', async () => {
    try {
        console.log('App ready, starting server...');
        await startNextServer();
        console.log('Server started, creating window...');
        createWindow();
        console.log('Window created.');
    } catch (e) {
        console.error('App init error:', e);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (nextServer) {
        nextServer.kill();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
