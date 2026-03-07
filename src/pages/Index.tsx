import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProperties, popularDestinations } from "@/lib/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Swap Homes,<br />Discover the World
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Exchange your home with travelers worldwide. Stay like a local, pay nothing for accommodation.
          </p>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularDestinations.map((dest) => (
            <Link
              key={dest.name}
              to={`/search?q=${dest.name}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img src={dest.image} alt={dest.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="font-heading font-semibold text-primary-foreground text-lg">{dest.name}</p>
                <p className="text-primary-foreground/70 text-sm">{dest.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="container mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Featured Homes</h2>
          <Link to="/search">
            <Button variant="ghost" className="text-primary">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.slice(0, 6).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-8 pb-16">
        <div className="bg-primary rounded-2xl p-8 md:p-14 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to swap your home?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join thousands of travelers exchanging homes around the world.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="rounded-xl font-semibold">
              Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
