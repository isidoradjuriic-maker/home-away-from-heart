import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Bed, Bath, Users, ArrowLeft, Heart, Share2, MessageSquare, CalendarIcon } from "lucide-react";
import { format, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { mockProperties } from "@/lib/mockData";
import type { DateRange } from "react-day-picker";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [message, setMessage] = useState("");

  // Try to fetch from DB first
  const { data: dbProperty, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, profiles!properties_user_id_fkey(first_name, last_name, avatar_url)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id && id.length > 10, // UUIDs are long, mock IDs are short
  });

  // Fetch existing bookings for this property to block dates
  const { data: existingBookings } = useQuery({
    queryKey: ["property-bookings", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("check_in, check_out, status")
        .eq("property_id", id!)
        .in("status", ["pending", "accepted"]);
      return data ?? [];
    },
    enabled: !!id && id.length > 10,
  });

  // Fall back to mock data
  const mockProperty = mockProperties.find((p) => p.id === id);

  const property = dbProperty
    ? {
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description || "",
        location: dbProperty.location,
        country: dbProperty.country,
        type: dbProperty.type,
        beds: dbProperty.beds,
        baths: dbProperty.baths,
        guests: dbProperty.guests,
        images: dbProperty.images?.length ? dbProperty.images : ["/placeholder.svg"],
        hostName: (dbProperty as any).profiles?.first_name
          ? `${(dbProperty as any).profiles.first_name} ${(dbProperty as any).profiles.last_name || ""}`.trim()
          : "Host",
        hostAvatar: (dbProperty as any).profiles?.avatar_url || "",
        userId: dbProperty.user_id,
        rating: 0,
        reviewCount: 0,
      }
    : mockProperty
    ? { ...mockProperty, userId: "", hostAvatar: mockProperty.hostAvatar }
    : null;

  // Compute disabled (booked) dates
  const bookedDates = (existingBookings ?? []).flatMap((b) => {
    try {
      return eachDayOfInterval({ start: parseISO(b.check_in), end: parseISO(b.check_out) });
    } catch {
      return [];
    }
  });

  const isDateBooked = (date: Date) =>
    bookedDates.some((d) => d.toDateString() === date.toDateString());

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      if (!dateRange?.from || !dateRange?.to) throw new Error("Select check-in and check-out dates");
      if (!dbProperty) throw new Error("Cannot book mock properties");

      const { error } = await supabase.from("bookings").insert({
        property_id: dbProperty.id,
        guest_id: user.id,
        host_id: dbProperty.user_id,
        check_in: format(dateRange.from, "yyyy-MM-dd"),
        check_out: format(dateRange.to, "yyyy-MM-dd"),
        message: message || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking request sent! The host will review it.");
      setDateRange(undefined);
      setMessage("");
      navigate("/dashboard");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

  const isOwner = user?.id === property.userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 md:px-8">
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
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> <span>{property.location}</span>
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
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl shadow-elevated p-6 space-y-5">
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

              {!user ? (
                <div className="space-y-3">
                  <Link to="/login">
                    <Button className="w-full rounded-xl h-12">Sign in to Book</Button>
                  </Link>
                </div>
              ) : isOwner ? (
                <p className="text-sm text-muted-foreground text-center">This is your property</p>
              ) : (
                <div className="space-y-4">
                  {/* Date range picker */}
                  <div>
                    <p className="text-sm font-medium mb-2">Select dates</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full rounded-xl h-11 justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                            ) : (
                              format(dateRange.from, "MMM d, yyyy")
                            )
                          ) : (
                            "Check-in → Check-out"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          disabled={(date) => date < new Date() || isDateBooked(date)}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Message to host */}
                  <div>
                    <p className="text-sm font-medium mb-2">Message to host (optional)</p>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi! I'd love to swap homes..."
                      className="rounded-xl text-sm"
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full rounded-xl h-12"
                    onClick={() => createBooking.mutate()}
                    disabled={createBooking.isPending || !dateRange?.from || !dateRange?.to}
                  >
                    {createBooking.isPending ? "Sending..." : "Request to Swap"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">Free to swap · No booking fees</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
