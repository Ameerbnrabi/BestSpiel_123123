# 🎮 BestSpiel

**BestSpiel** is an action-packed arcade browser game built with modern HTML5 Canvas, JavaScript, CSS, and Vite.

## 🚀 Features

- **Smooth 60FPS Canvas Animation**: Responsive and animated space ship movement.
- **Dynamic Obstacles & Collectibles**: Dodge hazardous laser obstacles while collecting bonus stars to boost your score.
- **Particle System**: Explosions and visual feedback upon collecting items or colliding.
- **High Score Tracking**: Local storage persistence for tracking your personal best.
- **Mobile & Desktop Controls**: Fully playable using keyboard (`WASD` / Arrow Keys) or touch/mouse on-screen controls.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+) and npm

### Installation

```bash
npm install
```

### Running Locally

To start the Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Building for Production

To generate production build assets in `dist/`:

```bash
npm run build
```

### Running Tests

To run the Playwright end-to-end test suite:

```bash
npx playwright test
```

## 🎮 How to Play

1. Click **Start Game** to launch your spaceship.
2. Use **Arrow Keys** or **WASD** (or on-screen buttons on mobile) to steer your ship up, down, left, and right.
3. **Stars (+25 pts)**: Fly into glowing golden stars to collect bonus score.
4. **Obstacles (+5 pts)**: Dodge red hazardous obstacles as they scroll past.
5. If you crash into a red obstacle, it's Game Over! Hit **Play Again** to restart.
