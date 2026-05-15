<p align="center">
  <img width="808" height="508" alt="Catvatar Preview" src="https://github.com/user-attachments/assets/97f57ac2-2cfb-4eca-88bf-4dcb63b13380" />
</p>

<h1 align="center">🐱 Catfit</h1>

<p align="center">
  <strong>A sleek desktop app to change between your Roblox outfits</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-40.1.0-47848F?logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-000000?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white" alt="Windows">
</p>

---

## ✨ Features

- 🎭 **Outfit Management** - Browse and equip your saved outfits with one click
- 🖼️ **Live Preview** - See your avatar thumbnail update in real-time
- 🌙 **Dark Theme** - Beautiful dark UI

## 📦 Installation

### Option 1: Installer
Download `Catfit.exe` and run it to install.

### Option 2: Portable
Download the `win-unpacked` folder and run `Catfit.exe` directly.

## 🔧 Development

```bash
# Install dependencies
npm install
cd Front && npm install

# Run in development
npm run dev

# Build for production
npm run build
```

## 🔐 Authentication

This app uses your Roblox `.ROBLOSECURITY` cookie to authenticate. Your cookie is stored locally and never sent to any external servers.

**To get your cookie:**
1. Log into Roblox in your browser
2. Open DevTools (F12) → Application → Cookies
3. Copy the value of `.ROBLOSECURITY`

## 📁 Project Structure

```
├── Back/           # Electron main process
├── Front/          # Next.js frontend
│   ├── app/        # Pages and API routes
│   └── public/     # Static assets
└── dist/           # Electron packaged app
```

## ⚠️ Disclaimer

This is an unofficial tool and is not affiliated with Roblox Corporation. Use at your own risk.

---

<p align="center">Made with 💜 by RawenCat</p>
