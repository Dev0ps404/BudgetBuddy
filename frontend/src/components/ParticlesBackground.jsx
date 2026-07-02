import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  speedMultiplier = 0.15, // Very slow, calm drifting speed
  minRadius = 0.5,
  maxRadius = 1.25,      // Size range 1px to 2.5px
  repulsionRadius = 110, // Circular repulsion zone (80-120px)
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
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // High-performance Particle Class
    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset(true);
      }

      reset(randomPos = false) {
        this.x = randomPos ? Math.random() * this.width : Math.random() * this.width;
        this.y = randomPos ? Math.random() * this.height : Math.random() * this.height;
        
        // uniform size: 1px to 2.5px
        this.size = Math.random() * (maxRadius * 2 - minRadius * 2) + minRadius * 2;
        
        // Cosmic drifting velocities
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.3 + 0.1) * speedMultiplier;
        
        this.driftX = Math.cos(angle) * speed;
        this.driftY = Math.sin(angle) * speed;

        this.vx = this.driftX;
        this.vy = this.driftY;

        // Group index for batched rendering by opacity level (0, 1, 2, 3)
        this.groupIndex = Math.floor(Math.random() * 4);
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Optimized mouse repulsion: check squared distance first to avoid heavy Math.sqrt calls
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            // Force drops to 0 at the boundary of repulsion zone
            const force = (mouse.radius - dist) / mouse.radius;
            const pushFactor = 0.35; // Gentle push behavior

            // Shift particle away gently
            this.x += (dx / dist) * force * pushFactor;
            this.y += (dy / dist) * force * pushFactor;

            // Direct velocity slightly away
            this.vx += (dx / dist) * force * 0.05;
            this.vy += (dy / dist) * force * 0.05;
          }
        }

        // Smooth velocity recovery back to original drift paths
        this.vx += (this.driftX - this.vx) * 0.05;
        this.vy += (this.driftY - this.vy) * 0.05;

        // Apply continuous floating movement
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap-around with infinite drift loop
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }
    }

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      
      // Scaled particle counts based on device widths to guarantee 60fps on mobile/tablet
      let count = 50000;
      if (width < 640) {
        count = 12000; // Mobile: ~12,000 stars
      } else if (width < 1024) {
        count = 25000; // Tablet: ~25,000 stars
      } else {
        count = 50000; // Desktop: ~50,000 stars
      }
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Render loop using highly-optimized batched rectangle path drawings
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create batched bucket lists for each opacity level
      const groups = [[], [], [], []];
      const count = particles.length;
      
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.update(canvas.width, canvas.height);
        groups[p.groupIndex].push(p);
      }

      // Consistent white colors with varying opacities
      const opacities = [0.6, 0.72, 0.84, 0.95];
      
      // Set uniform shadow blur to give the starfield a subtle glow
      ctx.shadowBlur = 1.5;
      if (theme === "light") {
        ctx.shadowColor = "rgba(100, 116, 139, 0.15)";
      } else {
        ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
      }

      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        
        if (theme === "light") {
          // Soft slate-grey for visibility on light pages
          ctx.fillStyle = `rgba(148, 163, 184, ${opacities[g]})`;
        } else {
          // Pure white stars
          ctx.fillStyle = `rgba(255, 255, 255, ${opacities[g]})`;
        }
        
        const list = groups[g];
        const listSize = list.length;
        for (let i = 0; i < listSize; i++) {
          const p = list[i];
          // Drawing as square rects in a single path is >20x faster than drawing individual circle arcs
          ctx.rect(p.x, p.y, p.size, p.size);
        }
        ctx.fill();
      }
      
      ctx.shadowBlur = 0; // Reset shadow

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
  }, [speedMultiplier, minRadius, maxRadius, repulsionRadius, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
