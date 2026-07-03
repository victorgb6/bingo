# Pride Bingo

A static bingo board for numbers 1-90, designed to be displayed on a TV screen. Built with Pride-themed colors inspired by the Progress Pride flag.

## Features

- **Number board (1-90)** with large, TV-friendly sizing that fits the viewport without scrolling
- **Random draw** — click "Draw Number" to pick a random number
- **Manual entry** — toggle to manual mode to type numbers in, with validation
- **Full-screen reveal** — each drawn number is displayed in a large overlay for 3 seconds so everyone can see it
- **Undo & remove** — undo the last draw or hover any drawn cell to remove a specific number (manual mode)
- **Fullscreen mode** — button in the top-right corner with wake lock to prevent the screen from sleeping
- **Pride-themed design** — rainbow gradient title, animated button, Progress Pride flag color bar, and each row of the board lights up in a different flag color

## Getting started

Open `index.html` directly in a browser, or serve it locally:

```sh
npm run dev
```

This starts a local server at `http://localhost:3000`.

## Deployment

```sh
npm run build
snow deploy --build-dir dist --yes
```

## Tech

Single static HTML file — no dependencies, no build step, no framework. Just HTML, CSS, and vanilla JavaScript.
