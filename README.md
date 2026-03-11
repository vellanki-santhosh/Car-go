# CarGo Pro 🚗

A fun arcade driving game built with React and HTML5 Canvas. Collect coins, avoid obstacles, upgrade your car, and survive as long as possible!

## Features

- **4 Car Tiers**: Hatchback → Sedan → Sports Car → Supercar
- **Power-ups**: Nitro (speed boost), Shield (invincibility), Magnet (coin attraction)
- **Drifting**: Hold turning while at speed to drift and leave tire marks
- **Mobile Support**: Touch controls for playing on phones
- **Responsive**: Full screen gameplay

## How to Play

- **W / ↑** - Accelerate
- **S / ↓** - Brake / Reverse
- **A / ←** - Turn Left
- **D / →** - Turn Right
- **SPACE** - Start / Pause

## Development

The game runs directly in the browser using:
- React 18
- HTML5 Canvas
- Babel (for JSX transformation)

### Running Locally

Simply open `index.html` in your browser, or use a local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000/

## Deployment to GitHub Pages

This project is now configured for GitHub Pages with `index.html` at the repository root.

1. Push your latest code to GitHub.
2. Open your repository on GitHub.
3. Go to **Settings** -> **Pages**.
4. Under **Build and deployment**, set:
	- **Source**: `Deploy from a branch`
	- **Branch**: `main` (or your default branch)
	- **Folder**: `/ (root)`
5. Save and wait 1-2 minutes.

Your game will be available at:
`https://<your-username>.github.io/<your-repo-name>/`

Legacy link support:
- `cargo.html` now redirects to `index.html`.

## License

MIT

