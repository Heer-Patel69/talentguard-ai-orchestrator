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

export const InteractiveBackground = memo(function InteractiveBackground({
  className,
  particleCount = 40,
  enableParticles = true,
  enableGradientOrbs = true,
  enableGridPattern = true,
  enableNoise = false,
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
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(true);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { damping: 25, stiffness: 80, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  const gradientX = useTransform(smoothMouseX, [0, 1], [15, 65]);
  const gradientY = useTransform(smoothMouseY, [0, 1], [15, 65]);
  const orb2X = useTransform(smoothMouseX, [0, 1], [60, 25]);
  const orb2Y = useTransform(smoothMouseY, [0, 1], [70, 35]);
  
  const lastMouseUpdate = useRef(0);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastMouseUpdate.current < 32) return;
    lastMouseUpdate.current = now;
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    mouseX.set(x);
    mouseY.set(y);
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [mouseX, mouseY]);

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

  // Particle animation with connection lines
  useEffect(() => {
    if (!enableParticles || !canvasRef.current || !isVisible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Initialize particles with varied hues for vibrant feel
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.15,
      hue: [250, 280, 330, 200, 155][Math.floor(Math.random() * 5)],
    }));

    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    const connectionDistance = 150;
    const mouseInfluenceRadius = 250;
    
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
      
      // Draw connection lines first (behind particles)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = connectionDistance * connectionDistance;
          
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / connectionDistance) * 0.15;
            const avgHue = (particles[i].hue + particles[j].hue) / 2;
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${avgHue}, 80%, 65%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        
        // Connection to cursor
        const dxMouse = mousePos.x - particles[i].x;
        const dyMouse = mousePos.y - particles[i].y;
        const mouseDistSq = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (mouseDistSq < mouseInfluenceRadius * mouseInfluenceRadius) {
          const mouseDist = Math.sqrt(mouseDistSq);
          const opacity = (1 - mouseDist / mouseInfluenceRadius) * 0.25;
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = `hsla(${particles[i].hue}, 90%, 70%, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      
      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Cursor attraction
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < mouseInfluenceRadius * mouseInfluenceRadius) {
          const dist = Math.sqrt(distSq);
          const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius * 0.02;
          particle.x += dx * force;
          particle.y += dy * force;
        }
        
        // Draw glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 90%, 70%, ${particle.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 90%, 70%, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 90%, 75%, ${particle.opacity})`;
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
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/90" />
      
      {/* Grid pattern */}
      {enableGridPattern && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      )}
      
      {/* Primary gradient orb */}
      {enableGradientOrbs && (
        <>
          <motion.div
            className="absolute w-[900px] h-[900px] rounded-full will-change-transform"
            style={{
              left: useTransform(gradientX, (v) => `${v}%`),
              top: useTransform(gradientY, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(250, 100%, 70%, 0.1) 0%, hsla(330, 100%, 60%, 0.05) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full will-change-transform"
            style={{
              left: useTransform(orb2X, (v) => `${v}%`),
              top: useTransform(orb2Y, (v) => `${v}%`),
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsla(330, 100%, 65%, 0.08) 0%, hsla(20, 100%, 60%, 0.04) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </>
      )}
      
      {/* Particle canvas */}
      {enableParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: 0.7 }}
        />
      )}
      
      {/* Noise texture */}
      {enableNoise && (
        <div 
          className="absolute inset-0 opacity-[0.015]"
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
          opacity: 0.4,
        }}
      />
    </div>
  );
});
