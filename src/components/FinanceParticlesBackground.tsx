import { useEffect, useRef } from "react";

// Font Awesome unicodes for finance icons
const ICONS = [
  "\uf51e", // fa-coins
  "\uf4d3", // fa-piggy-bank
  "\uf555", // fa-wallet
  "\uf201", // fa-chart-line
  "\uf1ec", // fa-calculator
  "\uf0d6", // fa-money-bill
  "\uf19c", // fa-university
  "\uf09d", // fa-credit-card
  "\uf81d", // fa-sack-dollar
  "\uf543", // fa-receipt
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function FinanceParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;
    let mouseX = width / 2;
    let mouseY = height / 2;
    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      drift: number;
      icon: string;
      rotate: number;
      rotateSpeed: number;
      opacity: number;
      blur: number;
      floatPhase: number;
      color: string;
    }

    let particles: Particle[] = [];

    function isDarkMode() {
      return document.body.classList.contains("dark");
    }

    function createParticles() {
      let minSize = 32,
        maxSize = 64;
      if (width < 400) {
        minSize = 14;
        maxSize = 24;
      } else if (width < 600) {
        minSize = 18;
        maxSize = 28;
      } else if (width < 700) {
        minSize = 22;
        maxSize = 34;
      } else if (width < 900) {
        minSize = 26;
        maxSize = 40;
      }
      const particleCount = 22;
      return Array.from({ length: particleCount }, () => ({
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        size: randomBetween(minSize, maxSize),
        speed: randomBetween(0.3, 1.1),
        drift: randomBetween(-0.3, 0.3),
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        rotate: randomBetween(0, 360),
        rotateSpeed: randomBetween(-0.2, 0.2),
        opacity: randomBetween(0.3, 0.7),
        blur: Math.random() > 0.7 ? 2 : 0,
        floatPhase: randomBetween(0, Math.PI * 2),
        color: "",
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      particles = createParticles(); // Regenerate particles on resize
    }

    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Optional: gradient overlay for extra polish
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, isDarkMode() ? "#25102a" : "#f7f4ff");
      grad.addColorStop(1, isDarkMode() ? "#7c4dff" : "#a78bfa");
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      particles.forEach((p, i) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        if (p.blur) ctx.shadowBlur = p.blur * 2;
        ctx.shadowColor = isDarkMode() ? "#a78bfa" : "#7c4dff";
        ctx.font = `900 ${p.size}px "Font Awesome 6 Free", "Font Awesome 5 Free", Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Parallax effect
        const parallaxStrength = 20 + i * 0.5;
        const px = p.x + ((mouseX - width / 2) / width) * parallaxStrength;
        const py =
          p.y +
          ((mouseY - height / 2) / height) * parallaxStrength +
          Math.sin(Date.now() / 900 + p.floatPhase) * 8; // floating

        ctx.translate(px, py);
        ctx.rotate((p.rotate * Math.PI) / 180);

        // Color
        ctx.fillStyle = isDarkMode()
          ? ["#a78bfa", "#61d887", "#fff", "#7c4dff"][i % 4]
          : ["#7c4dff", "#61d887", "#a78bfa", "#237efd"][i % 4];

        ctx.fillText(p.icon, 0, 0);
        ctx.restore();

        // Move
        p.y += p.speed;
        p.x += p.drift;
        p.rotate += p.rotateSpeed;

        // Respawn at top if out of view
        if (p.y > height + 50) {
          p.y = -50;
          p.x = randomBetween(0, width);
        }
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
      });
      animationId = requestAnimationFrame(draw);
    }
    draw();

    // Clean up
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        zIndex: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        opacity: 0.5,
        transition: "background 0.3s",
      }}
      aria-hidden="true"
    />
  );
}