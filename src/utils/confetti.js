// Lightweight, standalone HTML5 Canvas Confetti engine (zero external dependency issues)
let activeCanvas = null;
let activeContext = null;
let particles = [];
let animationId = null;

function getOrCreateCanvas() {
  if (typeof document === "undefined") return null;
  if (!activeCanvas) {
    activeCanvas = document.createElement("canvas");
    activeCanvas.style.position = "fixed";
    activeCanvas.style.top = "0px";
    activeCanvas.style.left = "0px";
    activeCanvas.style.width = "100vw";
    activeCanvas.style.height = "100vh";
    activeCanvas.style.pointerEvents = "none";
    activeCanvas.style.zIndex = "999999";
    activeCanvas.width = window.innerWidth;
    activeCanvas.height = window.innerHeight;
    document.body.appendChild(activeCanvas);
    activeContext = activeCanvas.getContext("2d");

    window.addEventListener("resize", () => {
      if (activeCanvas) {
        activeCanvas.width = window.innerWidth;
        activeCanvas.height = window.innerHeight;
      }
    });
  }
  return { canvas: activeCanvas, ctx: activeContext };
}

function updateAndDraw() {
  if (!activeCanvas || !activeContext) return;
  
  activeContext.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= p.friction;
    p.vy *= p.friction;
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;

    if (p.opacity <= 0 || p.y > activeCanvas.height) {
      particles.splice(i, 1);
      continue;
    }

    activeContext.save();
    activeContext.translate(p.x, p.y);
    activeContext.rotate(p.rotation);
    activeContext.globalAlpha = Math.max(0, p.opacity);
    activeContext.fillStyle = p.color;
    activeContext.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    activeContext.restore();
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(updateAndDraw);
  } else {
    if (activeCanvas && activeCanvas.parentNode) {
      activeCanvas.parentNode.removeChild(activeCanvas);
      activeCanvas = null;
      activeContext = null;
    }
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

export default function confetti(options = {}) {
  try {
    const {
      particleCount = 50,
      angle = 90,
      spread = 45,
      origin = { x: 0.5, y: 0.5 },
      colors = ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"]
    } = options;

    const canvasInfo = getOrCreateCanvas();
    if (!canvasInfo) return;

    const startX = origin.x * window.innerWidth;
    const startY = origin.y * window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      const radAngle = (angle + (Math.random() - 0.5) * spread) * (Math.PI / 180);
      const speed = 15 + Math.random() * 25;
      
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(radAngle) * speed,
        vy: -Math.sin(radAngle) * speed,
        gravity: 0.5,
        friction: 0.96,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    if (!animationId) {
      animationId = requestAnimationFrame(updateAndDraw);
    }
  } catch (e) {
    console.warn("Confetti effect skipped:", e);
  }
}
