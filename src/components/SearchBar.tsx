import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const SearchBar = ({ variant = "hero" }: SearchBarProps) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [type, setType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    if (dates) params.set("dates", dates);
    if (type) params.set("type", type);
    navigate(`/search?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-card rounded-full shadow-card border px-2 py-1.5">
        <div className="flex items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-32"
          />
        </div>
        <Button size="sm" type="submit" className="rounded-full h-8 px-4">Search</Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-elevated p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-0 md:items-center">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 md:border-r border-border">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block">Destination</label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full font-medium"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3 md:border-r border-border">
          <Calendar className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block">Dates</label>
            <input
              type="text"
              placeholder="Add dates"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full font-medium"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3">
          <Home className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-transparent text-sm outline-none w-full font-medium text-foreground"
            >
              <option value="">Any type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="cabin">Cabin</option>
              <option value="studio">Studio</option>
            </select>
          </div>
        </div>
        <div className="px-2">
          <Button type="submit" className="rounded-xl h-12 px-6 w-full md:w-auto">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
