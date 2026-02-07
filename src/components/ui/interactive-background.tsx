import { useEffect, useRef, useCallback, memo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveBackgroundProps {
  className?: string;
  particleCount?: number;
  enableParticles?: boolean;
  enableGradientOrbs?: boolean;
  enableGridPattern?: boolean;
  enableNoise?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const InteractiveBackground = memo(function InteractiveBackground({
  className,
  particleCount = 30, // Reduced from 50 for better performance
  enableParticles = true,
  enableGradientOrbs = true,
  enableGridPattern = true,
  enableNoise = false, // Disabled by default - heavy on performance
}: InteractiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    hue: number;
  }>>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  
  // Mouse position with spring physics
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  // Simpler transform calculations
  const gradientX = useTransform(smoothMouseX, [0, 1], [20, 60]);
  const gradientY = useTransform(smoothMouseY, [0, 1], [20, 60]);
  
  // Throttled mouse handler
  const lastMouseUpdate = useRef(0);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastMouseUpdate.current < 32) return; // ~30fps throttle for mouse
    lastMouseUpdate.current = now;
    
    if (!containerRef.current) return;
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    mouseX.set(x);
    mouseY.set(y);
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [mouseX, mouseY]);

  // Visibility observer - pause animations when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Optimized particle animation
  useEffect(() => {
    if (!enableParticles || !canvasRef.current || !isVisible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // Cap DPR for performance
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    
    // Debounced resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Initialize particles with fewer connections needed
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 60 + 220,
    }));

    let lastFrameTime = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime - (deltaTime % frameInterval);
      
      ctx.clearRect(0, 0, width, height);
      
      const mousePos = mousePosRef.current;
      const particles = particlesRef.current;
      
      // Draw particles without expensive connection lines
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Subtle attraction towards cursor
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < 40000) { // 200^2
          const dist = Math.sqrt(distSq);
          const force = (200 - dist) / 200 * 0.015;
          particle.x += dx * force;
          particle.y += dy * force;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.fill();
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableParticles, particleCount, isVisible]);

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 -z-10 overflow-hidden pointer-events-none", className)}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
      
      {/* Grid pattern - static, no animation */}
      {enableGridPattern && (
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      )}
      
      {/* Single optimized gradient orb - GPU accelerated */}
      {enableGradientOrbs && (
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full will-change-transform"
          style={{
            left: useTransform(gradientX, (v) => `${v}%`),
            top: useTransform(gradientY, (v) => `${v}%`),
            x: "-50%",
            y: "-50%",
            background: "radial-gradient(circle, hsla(226, 100%, 64%, 0.08) 0%, hsla(280, 87%, 65%, 0.04) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      )}
      
      {/* Particle canvas */}
      {enableParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: 0.6 }}
        />
      )}
      
      {/* Optional noise texture */}
      {enableNoise && (
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)",
          opacity: 0.3,
        }}
      />
    </div>
  );
});
