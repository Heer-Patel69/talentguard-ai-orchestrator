import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu, X, Brain } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/for-companies", label: "For Companies" },
  { href: "/for-candidates", label: "For Candidates" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-primary origin-left z-[60]"
        style={{ scaleX }}
      />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 pt-1"
      >
        <nav
          className={cn(
            "mx-4 mt-4 rounded-xl border px-6 py-4 md:mx-auto md:max-w-6xl transition-all duration-300",
            isScrolled
              ? "glass-card-elevated border-primary/10 bg-background/85 backdrop-blur-glass shadow-lg"
              : "glass-card border-border/20"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary transition-shadow group-hover:shadow-lg group-hover:shadow-primary/30"
              >
                <Brain className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="text-lg font-bold tracking-tight">
                Hire<span className="gradient-text">Minds</span> AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 flex flex-col gap-2 border-t border-border pt-4 lg:hidden overflow-hidden"
              >
                {navLinks.map((link, index) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block py-2 px-3 rounded-lg text-sm font-medium transition-all",
                        location.pathname === link.href
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>
  );
}

export const Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function Footer(props, ref) {
    return (
      <footer ref={ref} className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-12" {...props}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary transition-transform group-hover:scale-105">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold tracking-tight">
                  Hire<span className="gradient-text">Minds</span> AI
                </span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Autonomous AI-powered hiring that's fraud-proof and enterprise-ready.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/for-companies" className="hover:text-primary transition-colors">For Companies</Link></li>
                <li><Link to="/for-candidates" className="hover:text-primary transition-colors">For Candidates</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/gdpr" className="hover:text-primary transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HireMinds AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }
);
