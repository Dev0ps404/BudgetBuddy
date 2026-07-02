import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  particleCount = 900,  // Low density (600-1200)
  speedMultiplier = 0.08, // Very slow ambient drift
  minRadius = 0.5,
  maxRadius = 1.0,      // Tiny circles (1px-2px size range)
  repulsionRadius = 100, // Elegant 100px mouse interaction radius
  theme = "dark"
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let orbs = [];
    
    // Mouse tracking state
    const mouse = {
      x: null,
      y: null,
      radius: repulsionRadius
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Resize handler
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initOrbs();
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Blurred Floating Orb Class
    class FloatingOrb {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.radius = Math.random() * 80 + 120; // Size: 120-200px
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        
        // Extremely slow drift speed
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.05 + 0.02;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Premium Brand Colors: Indigo, Purple, Blue
        const orbColors = ["rgba(99, 102, 241", "rgba(139, 92, 246", "rgba(59, 130, 246"];
        this.color = orbColors[Math.floor(Math.random() * orbColors.length)];
        
        // Opacity: 3% to 5%
        this.opacity = Math.random() * 0.02 + 0.03;
      }

      update(width, height) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
      }

      draw() {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, `${this.color}, ${this.opacity})`);
        grad.addColorStop(0.5, `${this.color}, ${this.opacity * 0.4})`);
        grad.addColorStop(1, `${this.color}, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // Ambient Particle Class
    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset(true);
      }

      reset(randomPos = false) {
        this.x = randomPos ? Math.random() * this.width : Math.random() * this.width;
        this.y = randomPos ? Math.random() * this.height : Math.random() * this.height;
        this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
        
        // Organic, slow drifting velocities
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.25 + 0.1) * speedMultiplier;
        
        this.driftX = Math.cos(angle) * speed;
        this.driftY = Math.sin(angle) * speed;

        this.vx = this.driftX;
        this.vy = this.driftY;

        // Premium Palette: Soft blue and purple tints
        const particleColors = [
          "rgba(99, 102, 241,", // Indigo
          "rgba(139, 92, 246,", // Purple
          "rgba(59, 130, 246,"  // Blue
        ];
        this.colorPrefix = particleColors[Math.floor(Math.random() * particleColors.length)];
        
        // Opacity: 0.08 to 0.18 (very subtle)
        this.alpha = Math.random() * 0.10 + 0.08;
        
        // Twinkling drift
        this.twinkleSpeed = Math.random() * 0.002 + 0.001;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Soft, ambient twinkle
        this.alpha += this.twinkleSpeed * this.twinkleDirection;
        if (this.alpha >= 0.18) {
          this.alpha = 0.18;
          this.twinkleDirection = -1;
        } else if (this.alpha <= 0.08) {
          this.alpha = 0.08;
          this.twinkleDirection = 1;
        }

        // Very soft Attraction Mouse Effect (extremely low strength)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouse.radius - dist) / mouse.radius;
            const attractionStrength = 0.02; // Extremely low attraction strength

            this.vx += (dx / dist) * force * attractionStrength;
            this.vy += (dy / dist) * force * attractionStrength;
          }
        }

        // Smooth easing path recovery back to original slow drifts
        this.vx += (this.driftX - this.vx) * 0.03;
        this.vy += (this.driftY - this.vy) * 0.03;

        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap-around with infinite loop
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = `${this.colorPrefix} ${this.alpha})`;
        
        // Extremely subtle glow
        ctx.shadowBlur = 1;
        if (theme === "light") {
          ctx.shadowColor = "rgba(99, 102, 241, 0.1)";
        } else {
          ctx.shadowColor = "rgba(139, 92, 246, 0.25)";
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    const initOrbs = () => {
      orbs = [];
      // Generate 3–4 blurred floating orbs in background
      const count = Math.floor(Math.random() * 2) + 3; // 3 or 4
      for (let i = 0; i < count; i++) {
        orbs.push(new FloatingOrb(canvas.width, canvas.height));
      }
    };

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      
      // Low density count based on screen sizes
      let count = 900;
      if (width < 640) {
        count = 350; // Mobile: 250-450 particles
      } else if (width < 1024) {
        count = 600; // Tablet: 400-700 particles
      } else {
        count = 900; // Desktop: 600-1200 particles
      }
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw large blurred background orbs first
      orbs.forEach((orb) => {
        orb.update(canvas.width, canvas.height);
        orb.draw();
      });

      // 2. Draw ambient particles on top
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [particleCount, speedMultiplier, minRadius, maxRadius, repulsionRadius, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
