import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  particleCount = 1000,
  speedMultiplier = 0.2, // Very slow cosmic drift
  minRadius = 0.5,
  maxRadius = 2.0,
  repulsionRadius = 90, // Size of the mouse circle ring
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
    
    // Mouse state
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
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Starfield Particle Class
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
        
        // Very slow drifting velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.4 + 0.1) * speedMultiplier;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Twinkling stars look
        this.color = "#ffffff";
        this.alpha = Math.random() * 0.8 + 0.2; // Opacity variation
        this.twinkleSpeed = Math.random() * 0.01 + 0.005;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Twinkle effect (softly adjust opacity)
        this.alpha += this.twinkleSpeed * this.twinkleDirection;
        if (this.alpha >= 1.0) {
          this.alpha = 1.0;
          this.twinkleDirection = -1;
        } else if (this.alpha <= 0.2) {
          this.alpha = 0.2;
          this.twinkleDirection = 1;
        }

        // Mouse circle push-out interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            
            // Push particle exactly to the edge of the circle (repulsion zone)
            const pushForce = (mouse.radius - dist) * 0.25;
            this.x += Math.cos(angle) * pushForce;
            this.y += Math.sin(angle) * pushForce;
            
            // Dampen normal velocity inside the zone to prevent erratic fly-aways
            this.vx *= 0.8;
            this.vy *= 0.8;
          }
        }

        // Apply normal drift
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap-around (classic starfield effect)
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // For light themes, invert starfield to dark grey/indigo so they are visible
        if (theme === "light") {
          ctx.fillStyle = "#334155";
        } else {
          ctx.fillStyle = this.color;
        }
        
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      // Dynamic count based on viewport size for performance safety
      const screenFactor = Math.floor((canvas.width * canvas.height) / 1200);
      const count = Math.min(particleCount, Math.max(200, screenFactor));
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
