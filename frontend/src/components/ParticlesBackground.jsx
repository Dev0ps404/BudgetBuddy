import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  speedMultiplier = 0.15, // Calm, slow space drift speed
  minRadius = 0.5,
  maxRadius = 1.25,      // Size range 1px to 2.5px (radius 0.5px to 1.25px)
  repulsionRadius = 100  // Circular repulsion zone radius (80-120px)
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    
    // Mouse interaction coordinates
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

    // Space Star Particle Class
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
        
        // Consistent slow cosmic drift direction
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.3 + 0.1) * speedMultiplier;
        
        // Base paths/drift vectors (original velocities)
        this.driftX = Math.cos(angle) * speed;
        this.driftY = Math.sin(angle) * speed;

        // Current velocities
        this.vx = this.driftX;
        this.vy = this.driftY;

        // Pure white with opacities between 0.6 and 0.95
        this.alpha = Math.random() * 0.35 + 0.6;
        
        // Dynamic twinkle factor
        this.twinkleSpeed = Math.random() * 0.005 + 0.002;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Soft star twinkle effect
        this.alpha += this.twinkleSpeed * this.twinkleDirection;
        if (this.alpha >= 0.95) {
          this.alpha = 0.95;
          this.twinkleDirection = -1;
        } else if (this.alpha <= 0.6) {
          this.alpha = 0.6;
          this.twinkleDirection = 1;
        }

        // Soft repulsion interaction around the cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            // Force drops to 0 at the boundary of repulsion zone
            const force = (mouse.radius - dist) / mouse.radius;
            const pushFactor = 0.25; // Gentle push behavior

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

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Pure uniform white only
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        
        // Subtle white glow
        ctx.shadowBlur = 3;
        ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      
      // Strict density counts matching screen size requirements
      let count = 1000;
      if (width < 640) {
        count = 350; // Mobile: 250–450 particles
      } else if (width < 1024) {
        count = 550; // Tablet: 400–700 particles
      } else {
        count = 1000; // Desktop: 800–1200 particles
      }
      
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
  }, [speedMultiplier, minRadius, maxRadius, repulsionRadius]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
