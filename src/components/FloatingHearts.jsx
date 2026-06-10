import React, { useEffect, useRef } from 'react';

const FloatingHearts = () => {
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

    // Heart class
    class Heart {
      constructor() {
        this.reset();
        // Stagger initial vertical positions
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 15 + 10; // 10px to 25px
        this.speedY = Math.random() * 0.8 + 0.4; // slowly float up
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.3; // gentle sway
        this.opacity = Math.random() * 0.4 + 0.1; // subtle opacity
        this.rotation = Math.random() * 0.4 - 0.2; // slight angle
        this.rotationSpeed = Math.random() * 0.01 - 0.005;
      }

      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y / 30) * 0.2 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff6b8b';

        // Draw heart shape
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        
        // Top left curve
        ctx.bezierCurveTo(
          -this.size / 2, -topCurveHeight, 
          -this.size, topCurveHeight, 
          0, this.size
        );
        
        // Top right curve
        ctx.bezierCurveTo(
          this.size, topCurveHeight, 
          this.size / 2, -topCurveHeight, 
          0, topCurveHeight
        );

        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    const hearts = Array.from({ length: 25 }, () => new Heart());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hearts.forEach((heart) => {
        heart.update();
        heart.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
        zIndex: 0,
      }}
    />
  );
};

export default FloatingHearts;
