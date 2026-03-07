import { Link } from "react-router-dom";
import { Star, MapPin, Bed, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/mockData";

const PropertyCard = ({ property }: { property: Property }) => {
  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur-sm border-0 text-xs capitalize">
            {property.type}
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base font-semibold leading-tight line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">{property.location}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-sm pt-1">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.beds} beds</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {property.guests} guests</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
