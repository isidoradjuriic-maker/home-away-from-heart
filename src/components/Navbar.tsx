import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Search, User } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${isHome ? "bg-transparent" : "bg-card/95 backdrop-blur-md border-b"}`}>
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">HomeSwap</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">Log in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b px-4 pb-4 space-y-3 animate-fade-in">
          <Link to="/search" className="flex items-center gap-2 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <Search className="h-4 w-4" /> Explore
          </Link>
          <Link to="/login" className="flex items-center gap-2 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <User className="h-4 w-4" /> Log in
          </Link>
          <Link to="/register" onClick={() => setMobileOpen(false)}>
            <Button className="w-full" size="sm">Sign up</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
