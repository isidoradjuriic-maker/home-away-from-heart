import { Link } from "react-router-dom";
import { Star, MapPin, Bed, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/mockData";

const PropertyCard = ({ property }: { property: Property }) => {
  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1.5">
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur-sm border-0 text-xs capitalize font-medium">
            {property.type}
          </Badge>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs font-semibold text-foreground">{property.rating}</span>
            <span className="text-xs text-muted-foreground">({property.reviewCount})</span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-heading text-base font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-sm">{property.location}</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" /> {property.beds} {property.beds === 1 ? "bed" : "beds"}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {property.guests} {property.guests === 1 ? "guest" : "guests"}
            </span>
          </div>
          <div className="pt-1">
            <Button variant="outline" size="sm" className="w-full rounded-xl text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              View Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
