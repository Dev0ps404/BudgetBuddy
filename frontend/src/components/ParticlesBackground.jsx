import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  particleCount = 200,
  maxDistance = 140, // Connection line distance (120-160px)
  mouseRadius = 220,  // Cursor influence radius (180-250px)
  theme = "dark"      // Page theme
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
      radius: mouseRadius
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

    // Track globally so moving over text/buttons still affects the canvas
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

    // Particle Class with natural physics
    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset(true);
      }

      reset(randomPos = false) {
        this.x = randomPos ? Math.random() * this.width : Math.random() * this.width;
        this.y = randomPos ? Math.random() * this.height : Math.random() * this.height;
        this.radius = Math.random() * 3.0 + 1.0; // 1px - 4px size range
        
        // Random drift speed and angle (ambient cosmic drift)
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.4 + 0.2; // Smooth floating movement
        
        // Storing original base drift velocity for smooth path recovery
        this.driftX = Math.cos(angle) * speed;
        this.driftY = Math.sin(angle) * speed;

        // Current velocity
        this.vx = this.driftX;
        this.vy = this.driftY;

        // Random opacity levels between 0.2 and 0.8
        this.alpha = Math.random() * 0.6 + 0.2;
        
        // Magnetic sensitivity factor
        this.sensitivity = Math.random() * 0.8 + 0.4;
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Apply smooth friction/damping
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Easing pull towards original drift path
        this.vx += this.driftX * 0.05;
        this.vy += this.driftY * 0.05;

        // Real-time mouse magnetic attraction interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            // Attraction force is stronger the closer the particle is
            const force = (mouse.radius - dist) / mouse.radius;
            const attractionStrength = 0.15 * this.sensitivity;

            // Pull vectors
            this.vx += (dx / dist) * force * attractionStrength;
            this.vy += (dy / dist) * force * attractionStrength;
          }
        }

        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap-around with infinite loop logic
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // White particles with opacity. 
        // For light themes, we use a light-indigo/grey so they stand out on light backgrounds
        if (theme === "light") {
          ctx.fillStyle = `rgba(148, 163, 184, ${this.alpha})`; // Soft slate-400
          ctx.shadowColor = "rgba(100, 116, 139, 0.2)";
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`; // White
          ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        }

        // Subtle glowing effect
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    const initParticles = () => {
      particles = [];
      
      // Calculate optimized density based on screen size (150-250 range)
      const screenFactor = Math.floor((canvas.width * canvas.height) / 7500);
      const count = Math.min(particleCount, Math.max(70, screenFactor));
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Draw lines between close particles
    const drawConnections = () => {
      // Connect line opacity styles
      const lineAlphaMultiplier = theme === "light" ? 0.08 : 0.12;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            // Fade connection line opacity smoothly with distance
            const alpha = (1 - dist / maxDistance) * lineAlphaMultiplier * Math.min(p1.alpha, p2.alpha);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            if (theme === "light") {
              ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            }
            
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }
    };

    // 60FPS animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });

      drawConnections();

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
  }, [particleCount, maxDistance, mouseRadius, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  );
};

export default ParticlesBackground;
