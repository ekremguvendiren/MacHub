# CleanMac

![CleanMac](public/app-icon.png)

**CleanMac** is a modern, high-performance macOS utility designed to keep your system clean, secure, and optimized. Built with **Tauri** (Rust + React), it delivers a native-like experience with an incredibly small footprint and blazing fast speed.

## ✨ Features

- **🚀 System Clean**: Instantly free up space by removing system logs, cache files, and temporary data.
- **🛡️ Security Scan**: Advanced vulnerability scanner with a "Bug Bounty" style interface to detect and neutralize threats.
- **📦 Large File Finder**: Identify and manage large files that are cluttering your disk.
- **🔒 Secure Vault**: Encrypted storage for your most sensitive passwords and data.
- **🔧 Startup Manager**: Control which apps launch at login to improve boot time.
- **🕵️ Internet Analyzer**: Monitor your network connection and speed.

## 🛠️ Tech Stack

- **Core**: [Rust](https://www.rust-lang.org/) (Tauri 2.0) - For backend performance and security.
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) - For a robust and interactive UI.
- **Build Tool**: [Vite](https://vitejs.dev/) - For lightning-fast development and building.
- **Styling**: Vanilla CSS / Modules with a focus on dark mode and glassmorphism.

## 📦 Installation

### Prerequisites
- macOS (Universal Binary for Intel & Apple Silicon)
- Node.js (v20+)
- Rust (Latest Stable)

### Development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/clean-mac-ui.git
   cd clean-mac-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

### Build for Production
To build a standalone `.dmg` or `.app`:
```bash
npm run tauri build
```
The output will be found in `src-tauri/target/release/bundle/dmg`.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License © 2026 Antigravity
