const canvas = document.getElementById("pong-canvas");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const state = {
  running: false,
  gameOver: false,
  winner: "",
  playerScore: 0,
  cpuScore: 0,
};

const WIN_SCORE = 10;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 88;
const PADDLE_MARGIN = 20;

const player = {
  x: PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 7,
  up: false,
  down: false,
};

const cpu = {
  x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 4.5,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  vx: 0,
  vy: 0,
  speed: 6,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const updateScoreUI = () => {
  playerScoreEl.textContent = state.playerScore;
  cpuScoreEl.textContent = state.cpuScore;
};

const resetBall = (direction = 1) => {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6;

  const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
  ball.vx = Math.cos(angle) * ball.speed * direction;
  ball.vy = Math.sin(angle) * ball.speed;
};

const resetGame = () => {
  state.running = false;
  state.gameOver = false;
  state.winner = "";
  state.playerScore = 0;
  state.cpuScore = 0;

  player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  cpu.y = canvas.height / 2 - PADDLE_HEIGHT / 2;

  ball.vx = 0;
  ball.vy = 0;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  updateScoreUI();
  statusEl.textContent = "Press Start to serve the ball.";
};

const startGame = () => {
  if (state.gameOver) {
    resetGame();
  }

  if (!state.running) {
    state.running = true;
    const serveDirection = Math.random() > 0.5 ? 1 : -1;
    resetBall(serveDirection);
    statusEl.textContent = "Game on!";
  }
};

const checkPaddleCollision = (paddle) => {
  const hit =
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y + ball.radius > paddle.y &&
    ball.y - ball.radius < paddle.y + paddle.height;

  if (!hit) {
    return;
  }

  const relative = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  const bounceAngle = relative * (Math.PI / 3);
  const direction = paddle === player ? 1 : -1;

  ball.speed = Math.min(ball.speed + 0.35, 12);
  ball.vx = Math.cos(bounceAngle) * ball.speed * direction;
  ball.vy = Math.sin(bounceAngle) * ball.speed;

  if (paddle === player) {
    ball.x = player.x + player.width + ball.radius;
  } else {
    ball.x = cpu.x - ball.radius;
  }
};

const scorePoint = (scoredByPlayer) => {
  if (scoredByPlayer) {
    state.playerScore += 1;
    statusEl.textContent = "You scored!";
  } else {
    state.cpuScore += 1;
    statusEl.textContent = "CPU scored!";
  }

  updateScoreUI();

  if (state.playerScore >= WIN_SCORE || state.cpuScore >= WIN_SCORE) {
    state.running = false;
    state.gameOver = true;
    state.winner = state.playerScore >= WIN_SCORE ? "You win 🎉" : "CPU wins 🤖";
    statusEl.textContent = `${state.winner} Press Restart to play again.`;
    ball.vx = 0;
    ball.vy = 0;
    return;
  }

  const direction = scoredByPlayer ? -1 : 1;
  resetBall(direction);
};

const update = () => {
  player.y += (player.down - player.up) * player.speed;
  player.y = clamp(player.y, 0, canvas.height - player.height);

  const targetY = ball.y - cpu.height / 2;
  const diff = targetY - cpu.y;
  cpu.y += clamp(diff, -cpu.speed, cpu.speed);
  cpu.y = clamp(cpu.y, 0, canvas.height - cpu.height);

  if (!state.running) {
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  checkPaddleCollision(player);
  checkPaddleCollision(cpu);

  if (ball.x + ball.radius < 0) {
    scorePoint(false);
  }

  if (ball.x - ball.radius > canvas.width) {
    scorePoint(true);
  }
};

const drawNet = () => {
  ctx.setLineDash([8, 14]);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawPaddle = (paddle, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
};

const drawBall = () => {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#050d1b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawNet();
  drawPaddle(player, "#4cc9f0");
  drawPaddle(cpu, "#f72585");
  drawBall();
};

const loop = () => {
  update();
  draw();
  requestAnimationFrame(loop);
};

document.addEventListener("keydown", (event) => {
  if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
    player.up = true;
  }

  if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
    player.down = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
    player.up = false;
  }

  if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
    player.down = false;
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

resetGame();
loop();
