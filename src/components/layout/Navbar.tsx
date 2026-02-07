import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";
import logo from "@/assets/logo.png";
const navLinks = [{
  href: "/",
  label: "Home"
}, {
  href: "/for-companies",
  label: "For Companies"
}, {
  href: "/for-candidates",
  label: "For Candidates"
}, {
  href: "/pricing",
  label: "Pricing"
}];
export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    scrollYProgress
  } = useScroll();

  // Scroll progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <>
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-primary origin-left z-[60]" style={{
      scaleX
    }} />

      <motion.header initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.5
    }} className="fixed top-0 left-0 right-0 z-50 pt-1">
        <nav className={cn("mx-4 mt-4 rounded-2xl border px-6 py-4 md:mx-auto md:max-w-6xl transition-all duration-300", isScrolled ? "glass-card-elevated border-border/50 bg-background/80 backdrop-blur-xl shadow-lg" : "glass-card border-border/30")}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{
              scale: 1.05,
              rotate: 5
            }} whileTap={{
              scale: 0.95
            }} className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden transition-shadow group-hover:shadow-lg group-hover:shadow-primary/30">
                <img src={logo} alt="HireMinds AI" className="h-9 w-9 object-cover" />
              </motion.div>
              <span className="text-lg font-bold">
                Hire<span className="gradient-text">Minds</span> AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map(link => <Link key={link.href} to={link.href} className={cn("relative text-sm font-medium transition-colors hover:text-primary", location.pathname === link.href ? "text-primary" : "text-muted-foreground")}>
                  {link.label}
                  {/* Animated underline */}
                  {location.pathname === link.href && <motion.div layoutId="navbar-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" transition={{
                type: "spring",
                stiffness: 380,
                damping: 30
              }} />}
                </Link>)}
            </div>

            {/* CTA Buttons */}
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <Button variant="ghost" asChild className="hover-lift">
                <Link to="/login">Login</Link>
              </Button>
              <motion.div whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                <Button variant="hero" asChild className="sparkle-hover">
                  <Link to="/register">Get Started</Link>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <motion.button whileTap={{
              scale: 0.9
            }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? <motion.div key="close" initial={{
                  rotate: -90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: 90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                      <X className="h-6 w-6" />
                    </motion.div> : <motion.div key="menu" initial={{
                  rotate: 90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: -90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                      <Menu className="h-6 w-6" />
                    </motion.div>}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: "auto"
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1]
          }} className="mt-4 flex flex-col gap-2 border-t border-border pt-4 lg:hidden overflow-hidden">
                {navLinks.map((link, index) => <motion.div key={link.href} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: index * 0.05
            }}>
                    <Link to={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("block py-2 px-3 rounded-lg text-sm font-medium transition-all", location.pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50")}>
                      {link.label}
                    </Link>
                  </motion.div>)}
                <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>;
}
export const Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function Footer(props, ref) {
    return (
      <footer ref={ref} className="border-t border-border bg-card/50 py-12" {...props}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                  <img src={logo} alt="HireMinds AI" className="h-8 w-8 object-cover" />
                </div>
                <span className="font-bold">
                  Hire<span className="gradient-text">Minds</span> AI
                </span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Autonomous AI-powered hiring that's fraud-proof and enterprise-ready.
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/for-companies" className="hover:text-primary transition-colors">
                    For Companies
                  </Link>
                </li>
                <li>
                  <Link to="/for-candidates" className="hover:text-primary transition-colors">
                    For Candidates
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/gdpr" className="hover:text-primary transition-colors">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HireMinds AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }
);