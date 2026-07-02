import React, { useEffect, useRef } from "react";

const ParticlesBackground = ({
  particleCount = 150,
  colors = ["#6366f1", "#8b5cf6", "#3b82f6", "#14b8a6", "#ec4899"],
  speedMultiplier = 0.8,
  minRadius = 1,
  maxRadius = 3.5,
  connectionDistance = 110,
  mouseRadius = 160,
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
      radius: mouseRadius,
    };

    // Handle mouse move on window so we track it even through pointer-events-none elements
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
      
      // Re-initialize particles to fit the new size properly
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle Class
    class Particle {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
      }

      reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
        
        // Random velocity direction
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.6 + 0.2) * speedMultiplier;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Random color from palette
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
        
        // Mouse reaction variables
        this.density = Math.random() * 20 + 5;
      }

      update(width, height) {
        this.width = width;
        this.height = height;

        // Regular movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) {
          this.vx = -this.vx;
          this.x = Math.max(0, Math.min(this.x, width));
        }
        if (this.y < 0 || this.y > height) {
          this.vy = -this.vy;
          this.y = Math.max(0, Math.min(this.y, height));
        }

        // Mouse interaction: Repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            
            // The closer the mouse, the stronger the force
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * this.density * 0.15;
            const directionY = forceDirectionY * force * this.density * 0.15;
            
            // Push away
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Convert hex to rgb for opacity control
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.min(particleCount, Math.floor((canvas.width * canvas.height) / 8000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Draw lines between close particles
    const drawConnections = () => {
      const lineOpacity = theme === "dark" ? 0.08 : 0.05;
      const mouseLineOpacity = theme === "dark" ? 0.25 : 0.18;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Connect to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const mDx = mouse.x - p1.x;
          const mDy = mouse.y - p1.y;
          const mDist = Math.hypot(mDx, mDy);
          
          if (mDist < mouse.radius) {
            const alpha = (1 - mDist / mouse.radius) * mouseLineOpacity;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.hypot(dx, dy);

          if (distance < connectionDistance) {
            // Fade lines as they get further
            const alpha = (1 - distance / connectionDistance) * lineOpacity;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Mix or pick color of one particle
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw();
      });

      // Draw interactive connections
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    animate();

    // Clean up
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
