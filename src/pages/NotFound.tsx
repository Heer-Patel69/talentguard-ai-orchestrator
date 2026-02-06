import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageBackground, Container } from "@/components/ui/layout";
import { Navbar } from "@/components/layout/Navbar";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <PageBackground pattern="grid" />
      <Navbar />

      <Container className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-8xl font-bold gradient-text">404</h1>
          <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
