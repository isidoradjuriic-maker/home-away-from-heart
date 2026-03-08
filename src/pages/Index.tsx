import { ArrowRight, Search, Handshake, Plane, PiggyBank, Home, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProperties, popularDestinations } from "@/lib/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  {
    icon: Search,
    title: "Find a Home",
    description: "Browse thousands of verified homes worldwide. Filter by destination, dates, and style to find your perfect match.",
  },
  {
    icon: Handshake,
    title: "Request a Swap",
    description: "Send a swap request to the host. Discuss details, agree on dates, and confirm the exchange — no fees involved.",
  },
  {
    icon: Plane,
    title: "Travel & Enjoy",
    description: "Pack your bags and enjoy a local experience. Leave a review after your stay to help the community grow.",
  },
];

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
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-primary-foreground/70 mb-4 animate-fade-in">
            No fees · No middlemen · Just travel
          </span>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Live Like a Local,<br />Anywhere in the World
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Swap your home with verified travelers and stay for free. Join a global community of 10,000+ home exchangers.
          </p>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Swapping homes is simple, safe, and completely free. Here's how to get started.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
              )}
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 text-primary mb-5 transition-transform duration-300 group-hover:scale-110">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">Popular Destinations</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Explore the most sought-after locations for home swaps around the globe.</p>
        </div>
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
