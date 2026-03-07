import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary border-t mt-20">
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg font-bold">HomeSwap</span>
          </div>
          <p className="text-sm text-muted-foreground">Exchange homes, discover the world. Travel like a local.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Explore</h4>
          <div className="space-y-2">
            <Link to="/search" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Search Homes</Link>
            <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Host</h4>
          <div className="space-y-2">
            <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">List Your Home</Link>
            <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host Resources</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-sm">Support</h4>
          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">Help Center</span>
            <span className="block text-sm text-muted-foreground">Contact Us</span>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
        © 2026 HomeSwap. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
