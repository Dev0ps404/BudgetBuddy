import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  particleCount = 280,
  colors = ["#39ff14", "#ff007f", "#00ffff", "#ffaa00", "#ffffff"], // Default high-contrast neon
  speedMultiplier = 1.0,
  minRadius = 1.2,
  maxRadius = 4.0,
  connectionDistance = 120,
  mouseRadius = 220,
  theme = "dark"
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let baseParticles = [];
    let trailParticles = [];
    
    // Mouse state
    const mouse = {
      x: null,
      y: null,
      radius: mouseRadius,
      lastX: null,
      lastY: null
    };

    // Track mouse move on window to allow interactions even over other elements
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      mouse.x = newX;
      mouse.y = newY;

      // Spawn trail particles when mouse moves
      if (mouse.lastX !== null && mouse.lastY !== null) {
        const moveDist = Math.hypot(newX - mouse.lastX, newY - mouse.lastY);
        // Only spawn if mouse actually moved significantly to avoid clutter
        if (moveDist > 2) {
          const spawnCount = Math.min(4, Math.floor(moveDist / 4) + 1);
          for (let i = 0; i < spawnCount; i++) {
            // Interpolate position along the movement line for smooth trails
            const ratio = i / spawnCount;
            const spawnX = mouse.lastX + (newX - mouse.lastX) * ratio;
            const spawnY = mouse.lastY + (newY - mouse.lastY) * ratio;
            trailParticles.push(new TrailParticle(spawnX, spawnY));
          }
        }
      }

      mouse.lastX = newX;
      mouse.lastY = newY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.lastX = null;
      mouse.lastY = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Resize handler
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Normal Particle Class
    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset(true); // Random positions initially
      }

      reset(randomPos = false) {
        this.x = randomPos ? Math.random() * this.width : (Math.random() * 20 - 10) + mouse.x;
        this.y = randomPos ? Math.random() * this.height : (Math.random() * 20 - 10) + mouse.y;
        this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
        
        // Base velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.8 + 0.4) * speedMultiplier;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.4; // 0.4 to 1.0 (high visibility)
        this.density = Math.random() * 15 + 5; // Mass for gravity pull
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Apply friction/dampening so particles don't keep accelerating forever
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Mouse attraction (magnetic gravitational pull)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            // The closer the particle is to the mouse, the stronger the pull
            const force = (mouse.radius - distance) / mouse.radius;
            const gravityStrength = 0.08; // Adjust for pull speed
            
            // Pull direction vector
            const pullX = (dx / distance) * force * gravityStrength * this.density;
            const pullY = (dy / distance) * force * gravityStrength * this.density;

            this.vx += pullX;
            this.vy += pullY;
          }
        }

        // Add back a tiny bit of random drift if they slow down too much
        const speed = Math.hypot(this.vx, this.vy);
        if (speed < 0.2) {
          const driftAngle = Math.random() * Math.PI * 2;
          this.vx += Math.cos(driftAngle) * 0.1;
          this.vy += Math.sin(driftAngle) * 0.1;
        }

        // Limit maximum speed
        const maxSpeed = 4.5;
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        // Bounce off canvas boundaries
        if (this.x < 0 || this.x > width) {
          this.vx = -this.vx * 0.8;
          this.x = Math.max(0, Math.min(this.x, width));
        }
        if (this.y < 0 || this.y > height) {
          this.vy = -this.vy * 0.8;
          this.y = Math.max(0, Math.min(this.y, height));
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = theme === "dark" ? 6 : 0; // Glowing effect on dark themes
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
    }

    // Spark Trail Particle Class
    class TrailParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3.5 + 2.0; // Thicker spark sizes
        
        // High velocity explosion/spread
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 1.0;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1.0;
        this.decay = Math.random() * 0.04 + 0.025; // Fades out in ~30 frames
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // High friction to make them float around the spawn point
        this.vx *= 0.92;
        this.vy *= 0.92;
        
        this.alpha -= this.decay;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowBlur = theme === "dark" ? 10 : 0;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      get isDead() {
        return this.alpha <= 0;
      }
    }

    // Initialize base particle list
    const initParticles = () => {
      baseParticles = [];
      // Calculate particle density based on screen space
      const screenFactor = Math.floor((canvas.width * canvas.height) / 5000);
      const count = Math.min(particleCount, Math.max(80, screenFactor));
      
      for (let i = 0; i < count; i++) {
        baseParticles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Draw connection lines
    const drawConnections = () => {
      // Stronger visibility contrast
      const lineOpacity = theme === "dark" ? 0.15 : 0.12;
      const mouseLineOpacity = theme === "dark" ? 0.45 : 0.35;
      
      // 1. Draw connections from particles to mouse
      if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < baseParticles.length; i++) {
          const p = baseParticles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * mouseLineOpacity;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2; // Slightly thicker lines to mouse
            ctx.stroke();
          }
        }
      }

      // 2. Draw connections between nearby particles
      for (let i = 0; i < baseParticles.length; i++) {
        const p1 = baseParticles[i];

        for (let j = i + 1; j < baseParticles.length; j++) {
          const p2 = baseParticles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * lineOpacity;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    };

    // Main Canvas Render Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw base particles
      baseParticles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });

      // Update, draw, and filter out dead trail particles
      trailParticles = trailParticles.filter((p) => {
        p.update();
        p.draw();
        return !p.isDead;
      });

      // Render networking mesh
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    animate();

    // Event Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [particleCount, colors, speedMultiplier, minRadius, maxRadius, connectionDistance, mouseRadius, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
