import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/lib/mockData";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const types = ["all", "apartment", "house", "villa", "cabin", "studio"];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  const [selectedType, setSelectedType] = useState(typeParam);

  const filtered = useMemo(() => {
    return mockProperties.filter((p) => {
      const matchQuery = !query || p.location.toLowerCase().includes(query.toLowerCase()) || p.title.toLowerCase().includes(query.toLowerCase()) || p.country.toLowerCase().includes(query.toLowerCase());
      const matchType = selectedType === "all" || p.type === selectedType;
      return matchQuery && matchType;
    });
  }, [query, selectedType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <SearchBar />
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

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No homes found matching your criteria.</p>
            <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
