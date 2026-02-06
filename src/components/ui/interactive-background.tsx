import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface InteractiveBackgroundProps {
  className?: string;
  particleCount?: number;
  enableParticles?: boolean;
  enableGradientOrbs?: boolean;
  enableGridPattern?: boolean;
  enableNoise?: boolean;
}

export function InteractiveBackground({
  className,
  particleCount = 50,
  enableParticles = true,
  enableGradientOrbs = true,
  enableGridPattern = true,
  enableNoise = true,
}: InteractiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  
  // Mouse position with spring physics for smooth following
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  // Transform mouse position to gradient positions
  const gradientX1 = useTransform(smoothMouseX, [0, 1], [10, 40]);
  const gradientY1 = useTransform(smoothMouseY, [0, 1], [10, 40]);
  const gradientX2 = useTransform(smoothMouseX, [0, 1], [60, 90]);
  const gradientY2 = useTransform(smoothMouseY, [0, 1], [60, 90]);
  const gradientX3 = useTransform(smoothMouseX, [0, 1], [30, 70]);
  const gradientY3 = useTransform(smoothMouseY, [0, 1], [70, 30]);
  
  // Secondary orbs with offset
  const orb1X = useTransform(smoothMouseX, [0, 1], [20, 80]);
  const orb1Y = useTransform(smoothMouseY, [0, 1], [20, 80]);
  const orb2X = useTransform(smoothMouseX, [0, 1], [70, 30]);
  const orb2Y = useTransform(smoothMouseY, [0, 1], [80, 20]);
  const orb3X = useTransform(smoothMouseX, [0, 1], [50, 50]);
  const orb3Y = useTransform(smoothMouseY, [0, 1], [30, 70]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Initialize and animate particles on canvas
  useEffect(() => {
    if (!enableParticles || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 220, // Blue to purple range
    }));

    let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const handleCanvasMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleCanvasMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Attract particles towards cursor
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const force = (200 - distance) / 200;
          particle.x += dx * force * 0.02;
          particle.y += dy * force * 0.02;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
        ctx.fill();
        
        // Draw connections to nearby particles
        particlesRef.current.forEach((other) => {
          if (particle.id >= other.id) return;
          
          const dx2 = particle.x - other.x;
          const dy2 = particle.y - other.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(226, 80%, 60%, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleCanvasMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableParticles, particleCount]);

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 -z-10 overflow-hidden", className)}
    >
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
      
      {/* Grid pattern */}
      {enableGridPattern && (
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      )}
      
      {/* Interactive gradient orbs */}
      {enableGradientOrbs && (
        <>
          {/* Primary orb - follows cursor */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              left: useTransform(gradientX1, (v) => `${v}%`),
              top: useTransform(gradientY1, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(226, 100%, 64%, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          
          {/* Secondary orb - purple */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              left: useTransform(gradientX2, (v) => `${v}%`),
              top: useTransform(gradientY2, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(280, 87%, 65%, 0.12) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          
          {/* Tertiary orb - green accent */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              left: useTransform(gradientX3, (v) => `${v}%`),
              top: useTransform(gradientY3, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(160, 84%, 39%, 0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          
          {/* Floating ambient orbs */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              left: useTransform(orb1X, (v) => `${v}%`),
              top: useTransform(orb1Y, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(226, 100%, 70%, 0.1) 0%, transparent 60%)",
              filter: "blur(30px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{
              left: useTransform(orb2X, (v) => `${v}%`),
              top: useTransform(orb2Y, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(280, 80%, 60%, 0.08) 0%, transparent 60%)",
              filter: "blur(35px)",
            }}
            animate={{
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute w-[250px] h-[250px] rounded-full pointer-events-none"
            style={{
              left: useTransform(orb3X, (v) => `${v}%`),
              top: useTransform(orb3Y, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(200, 90%, 55%, 0.06) 0%, transparent 60%)",
              filter: "blur(25px)",
            }}
            animate={{
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
      
      {/* Particle canvas */}
      {enableParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
      
      {/* Noise texture overlay */}
      {enableNoise && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}
