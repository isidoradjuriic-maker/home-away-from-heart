import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, MapPin, Bed, Users, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const types = ["all", "apartment", "house", "villa", "cabin", "studio"];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  const [selectedType, setSelectedType] = useState(typeParam);
  const [nameSearch, setNameSearch] = useState("");

  const { data: dbProperties, isLoading } = useQuery({
    queryKey: ["all-properties"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!dbProperties) return [];
    return dbProperties.filter((p) => {
      const q = query.toLowerCase();
      const matchQuery =
        !query ||
        p.location.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      const matchType = selectedType === "all" || p.type === selectedType;
      const matchName =
        !nameSearch ||
        p.title.toLowerCase().includes(nameSearch.toLowerCase()) ||
        p.location.toLowerCase().includes(nameSearch.toLowerCase());
      return matchQuery && matchType && matchName;
    });
  }, [query, selectedType, nameSearch, dbProperties]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Name search input */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by accommodation name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {types.map((t) => (
            <Button
              key={t}
              variant={selectedType === t ? "default" : "outline"}
              size="sm"
              className="rounded-full capitalize shrink-0"
              onClick={() => setSelectedType(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        {query && (
          <p className="text-muted-foreground mb-4 text-sm">
            Showing results for <Badge variant="secondary">{query}</Badge> · {filtered.length} homes
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No homes found matching your criteria.</p>
            <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link key={p.id} to={`/property/${p.id}`} className="group">
                <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[4/3] overflow-hidden">
                    {p.images && p.images.length > 0 && p.images[0] !== "" ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Home className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <Badge variant="secondary" className="capitalize text-xs">{p.type}</Badge>
                    <h3 className="font-heading font-semibold text-foreground">{p.title}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </div>
                    <div className="flex gap-3 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds} bed{p.beds !== 1 && "s"}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.guests} guest{p.guests !== 1 && "s"}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-xl mt-2">View Details</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
