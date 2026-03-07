import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Bed, Bath, Users, ArrowLeft, Heart, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProperties } from "@/lib/mockData";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Property not found</p>
          <Link to="/search"><Button variant="outline">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 md:px-8">
        {/* Back */}
        <Link to="/search" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        {/* Image */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden mb-6">
          <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10"><Heart className="h-4 w-4" /></Button>
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{property.type}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="flex gap-6 py-4 border-y">
              <div className="flex items-center gap-2 text-sm"><Bed className="h-4 w-4 text-primary" /> {property.beds} bedrooms</div>
              <div className="flex items-center gap-2 text-sm"><Bath className="h-4 w-4 text-primary" /> {property.baths} bathrooms</div>
              <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /> {property.guests} guests</div>
            </div>

            <div>
              <h3 className="font-heading text-lg font-semibold mb-3">About this home</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Reviews placeholder */}
            <div>
              <h3 className="font-heading text-lg font-semibold mb-3">Reviews</h3>
              <p className="text-muted-foreground text-sm">Sign in to view and leave reviews.</p>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl shadow-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={property.hostAvatar} alt={property.hostName} />
                  <AvatarFallback>{property.hostName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">Hosted by {property.hostName}</p>
                  <p className="text-xs text-muted-foreground">Verified host</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full rounded-xl h-12">
                    Request to Swap
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full rounded-xl h-12 mt-2">
                    <MessageSquare className="h-4 w-4 mr-2" /> Message Host
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-center text-muted-foreground">Free to swap · No booking fees</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
