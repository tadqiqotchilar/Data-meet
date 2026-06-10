import React, { useEffect, useRef } from 'react';

const Fireworks = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#ff0a54', // Hot pink
      '#ff477e', // Rose
      '#ff7096', // Light rose
      '#ff85a2', // Pink
      '#ab47bc', // Purple
      '#ea80fc', // Light purple
      '#ffd166', // Gold
      '#06d6a0', // Teal
      '#ffffff', // Sparkle white
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 6 + 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 0.08;
        this.friction = 0.96;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.size = Math.random() * 2 + 1.5;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Rocket {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.tx = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        this.ty = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
        this.speed = Math.random() * 5 + 7;
        this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
        this.trailLength = 10;
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
          this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // Check if rocket reached destination height
        if (this.vy >= 0 || this.y <= this.ty) {
          this.exploded = true;
        }
      }

      draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
          const point = this.trail[i];
          const opacity = (i + 1) / this.trail.length;
          ctx.globalAlpha = opacity * 0.4;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw rocket head
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let rockets = [];
    let particles = [];

    const launchRocket = () => {
      rockets.push(new Rocket());
    };

    // Initial launch burst
    for (let i = 0; i < 3; i++) {
      setTimeout(launchRocket, i * 400);
    }

    // Launch a rocket periodically
    const launchInterval = setInterval(() => {
      if (rockets.length < 5) {
        launchRocket();
      }
    }, 800);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();

        if (r.exploded) {
          // Explode! Spawn particles
          const particleCount = Math.floor(Math.random() * 80) + 70;
          for (let p = 0; p < particleCount; p++) {
            particles.push(new Particle(r.x, r.y, r.color));
          }
          rockets.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(launchInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

export default Fireworks;
