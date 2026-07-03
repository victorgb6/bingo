# Pride Bingo

A bingo board for numbers 1-90, designed to be displayed on a TV screen. Built with Pride-themed colors inspired by the Progress Pride flag.

## Features

- **Number board (1-90)** with large, TV-friendly sizing that fits the viewport without scrolling
- **Random draw** — click "Draw Number" to pick a random number
- **Manual entry** — toggle to manual mode to type numbers in, with validation
- **Full-screen reveal** — each drawn number is displayed in a large overlay for 3 seconds so everyone can see it
- **Undo & remove** — undo the last draw or hover any drawn cell to remove a specific number (manual mode)
- **Fullscreen mode** — button in the top-right corner with wake lock to prevent the screen from sleeping
- **Remote control** — use a phone as a remote by scanning the QR code on the host screen
- **Pride-themed design** — rainbow gradient title, animated button, Progress Pride flag color bar, and each row of the board lights up in a different flag color

## Getting started

```sh
npm install
npm run dev
```

This starts a local Vite dev server at `http://localhost:3000`.

## Remote control

The host screen displays a QR code in the top-left corner. Scan it with a phone on the same network to open the remote control view — a mobile-friendly panel with draw, manual entry, undo, and reset controls. Communication is peer-to-peer via PeerJS (WebRTC), no server required.

## Build

```sh
npm run build
```

Output goes to `dist/`. Preview the build with `npm run preview`.

## Tech

Vite + vanilla JavaScript. No framework. PeerJS for peer-to-peer remote control, qrcode for QR generation.
