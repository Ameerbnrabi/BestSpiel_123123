// BestSpiel Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Mobile Control Buttons
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// Game State Variables
let gameState = 'START'; // 'START', 'PLAYING', 'GAMEOVER'
let score = 0;
let highScore = parseInt(localStorage.getItem('bestspiel_highscore') || '0', 10);
highScoreEl.textContent = highScore;

let animationFrameId;
let lastTime = 0;
let obstacleTimer = 0;
let starTimer = 0;

// Player setup
const player = {
  x: 100,
  y: canvas.height / 2,
  radius: 18,
  speed: 350,
  vx: 0,
  vy: 0,
  color: '#38bdf8'
};

// Game entities
let obstacles = [];
let stars = [];
let particles = [];

// Key tracking
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  a: false,
  d: false,
  W: false,
  S: false,
  A: false,
  D: false
};

// Event Listeners for Keyboard
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Setup Touch / Mobile controls
function bindTouchControl(button, keyName) {
  if (!button) return;
  const startHandler = (e) => {
    e.preventDefault();
    keys[keyName] = true;
  };
  const endHandler = (e) => {
    e.preventDefault();
    keys[keyName] = false;
  };
  button.addEventListener('pointerdown', startHandler);
  button.addEventListener('pointerup', endHandler);
  button.addEventListener('pointerleave', endHandler);
}

bindTouchControl(btnUp, 'ArrowUp');
bindTouchControl(btnDown, 'ArrowDown');
bindTouchControl(btnLeft, 'ArrowLeft');
bindTouchControl(btnRight, 'ArrowRight');

// Start / Restart Handlers
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function resetGame() {
  score = 0;
  scoreEl.textContent = score;
  player.x = 100;
  player.y = canvas.height / 2;
  obstacles = [];
  stars = [];
  particles = [];
  obstacleTimer = 0;
  starTimer = 0;
}

function startGame() {
  resetGame();
  gameState = 'PLAYING';
  gameOverlay.classList.add('hidden');
  lastTime = performance.now();
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameState = 'GAMEOVER';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('bestspiel_highscore', highScore.toString());
    highScoreEl.textContent = highScore;
    overlayTitle.textContent = '🎉 New High Score!';
  } else {
    overlayTitle.textContent = '💥 Game Over';
  }
  overlaySubtitle.textContent = `You scored ${score} points! Can you beat it?`;
  startBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  gameOverlay.classList.remove('hidden');
}

// Particle system
function createExplosion(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 150 + 50;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 2,
      color,
      alpha: 1,
      life: Math.random() * 0.4 + 0.3
    });
  }
}

// Spawning functions
function spawnObstacle() {
  const height = Math.random() * 40 + 20;
  const width = Math.random() * 30 + 20;
  const speed = Math.random() * 150 + 200 + Math.min(score * 2, 250);
  obstacles.push({
    x: canvas.width + width,
    y: Math.random() * (canvas.height - height),
    width,
    height,
    speed,
    color: '#ef4444'
  });
}

function spawnStar() {
  const radius = 12;
  stars.push({
    x: canvas.width + radius,
    y: Math.random() * (canvas.height - radius * 2) + radius,
    radius,
    speed: Math.random() * 50 + 150,
    color: '#f59e0b',
    pulse: 0
  });
}

// Update game entities
function update(dt) {
  // Move Player
  let moveX = 0;
  let moveY = 0;

  if (keys.ArrowUp || keys.w || keys.W) moveY -= 1;
  if (keys.ArrowDown || keys.s || keys.S) moveY += 1;
  if (keys.ArrowLeft || keys.a || keys.A) moveX -= 1;
  if (keys.ArrowRight || keys.d || keys.D) moveX += 1;

  // Normalize diagonal movement
  if (moveX !== 0 && moveY !== 0) {
    moveX *= Math.SQRT1_2;
    moveY *= Math.SQRT1_2;
  }

  player.x += moveX * player.speed * dt;
  player.y += moveY * player.speed * dt;

  // Screen Boundaries
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Timers for spawning
  obstacleTimer += dt;
  if (obstacleTimer > Math.max(0.4, 1.2 - score * 0.015)) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  starTimer += dt;
  if (starTimer > 1.5) {
    spawnStar();
    starTimer = 0;
  }

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed * dt;

    // Collision check with Player (Circle - Rect collision)
    const closestX = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(player.y, obs.y + obs.height));
    const distX = player.x - closestX;
    const distY = player.y - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < player.radius) {
      createExplosion(player.x, player.y, '#ef4444', 30);
      gameOver();
      return;
    }

    // Remove offscreen obstacles
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score += 5;
      scoreEl.textContent = score;
    }
  }

  // Update Stars
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    star.x -= star.speed * dt;
    star.pulse += dt * 5;

    // Circle - Circle collision
    const distX = player.x - star.x;
    const distY = player.y - star.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < player.radius + star.radius) {
      createExplosion(star.x, star.y, '#f59e0b', 15);
      score += 25;
      scoreEl.textContent = score;
      stars.splice(i, 1);
      continue;
    }

    if (star.x + star.radius < 0) {
      stars.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= dt / p.life;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Render game entities
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid Effect
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Render Stars
  stars.forEach((star) => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = star.color;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    const size = star.radius + Math.sin(star.pulse) * 2;
    ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Render Obstacles
  obstacles.forEach((obs) => {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = obs.color;
    ctx.fillStyle = obs.color;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
    ctx.fill();
    ctx.restore();
  });

  // Render Particles
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Render Player
  if (gameState === 'PLAYING') {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;

    // Draw ship triangle pointing right
    ctx.beginPath();
    ctx.moveTo(player.x + player.radius, player.y);
    ctx.lineTo(player.x - player.radius, player.y - player.radius * 0.8);
    ctx.lineTo(player.x - player.radius * 0.5, player.y);
    ctx.lineTo(player.x - player.radius, player.y + player.radius * 0.8);
    ctx.closePath();
    ctx.fill();

    // Engine thrust glow
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(player.x - player.radius * 0.8, player.y, 4 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Game Loop
function gameLoop(timestamp) {
  if (gameState !== 'PLAYING') return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  update(dt);
  render();

  if (gameState === 'PLAYING') {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// Initial idle draw
render();
