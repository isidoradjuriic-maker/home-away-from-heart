import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Plus, Bed, Bath, Users, MapPin, CalendarIcon, ImagePlus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddProperty, setShowAddProperty] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState<string>("apartment");
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);
  const [guests, setGuests] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availabilityRange, setAvailabilityRange] = useState<DateRange | undefined>();
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: properties } = useQuery({
    queryKey: ["my-properties", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, properties(title, location)").or(`guest_id.eq.${user!.id},host_id.eq.${user!.id}`).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const addProperty = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      const insertData: any = {
        user_id: user!.id,
        title,
        description,
        location,
        country,
        type: type as any,
        beds,
        baths,
        guests,
        images: imageUrls,
      };

      if (availabilityRange?.from) {
        insertData.availability_start = format(availabilityRange.from, "yyyy-MM-dd");
      }
      if (availabilityRange?.to) {
        insertData.availability_end = format(availabilityRange.to, "yyyy-MM-dd");
      }

      const { error } = await supabase.from("properties").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property added!");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setShowAddProperty(false);
      setTitle(""); setDescription(""); setLocation(""); setCountry("");
      setImageFiles([]); setImagePreviews([]); setAvailabilityRange(undefined);
      setUploading(false);
    },
    onError: (e: any) => {
      toast.error(e.message);
      setUploading(false);
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property deleted");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated!");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/login" />;

  const availabilityLabel = availabilityRange?.from
    ? availabilityRange.to
      ? `${format(availabilityRange.from, "MMM d, yyyy")} – ${format(availabilityRange.to, "MMM d, yyyy")}`
      : format(availabilityRange.from, "MMM d, yyyy")
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome, {profile?.first_name || user.email}</p>
          </div>
          <Button variant="outline" onClick={() => { signOut(); navigate("/"); }}>Sign out</Button>
        </div>

        {/* My Properties */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">My Properties</h2>
            <Button size="sm" onClick={() => setShowAddProperty(!showAddProperty)}>
              <Plus className="h-4 w-4 mr-1" /> Add Property
            </Button>
          </div>

          {showAddProperty && (
            <form onSubmit={(e) => { e.preventDefault(); addProperty.mutate(); }} className="bg-card rounded-xl shadow-card p-6 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cozy beach house" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabin</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Paris, France" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" required className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your home..." className="rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Beds</Label>
                  <Input type="number" min={1} value={beds} onChange={(e) => setBeds(Number(e.target.value))} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Baths</Label>
                  <Input type="number" min={1} value={baths} onChange={(e) => setBaths(Number(e.target.value))} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="rounded-xl" />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Property Images (max 5)</Label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-border group">
                      <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <label className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Add</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Availability Dates */}
              <div className="space-y-2">
                <Label>Availability Dates</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" type="button" className={cn("w-full md:w-auto rounded-xl h-11 justify-start text-left font-normal", !availabilityLabel && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {availabilityLabel || "Select available dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={availabilityRange}
                      onSelect={setAvailabilityRange}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" disabled={addProperty.isPending || uploading}>
                {uploading ? "Uploading images..." : addProperty.isPending ? "Adding..." : "Add Property"}
              </Button>
            </form>
          )}

          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                  {p.images && p.images.length > 0 && p.images[0] !== "" ? (
                    <img src={p.images[0]} alt={p.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full bg-muted flex items-center justify-center"><Home className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading font-semibold">{p.title}</h3>
                      <button
                        type="button"
                        onClick={() => { if (confirm("Delete this property?")) deleteProperty.mutate(p.id); }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </div>
                    <div className="flex gap-3 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.guests}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No properties yet. Add your first home to start swapping!</p>
          )}
        </section>

        {/* Bookings */}
        <section>
          <h2 className="font-heading text-xl font-semibold mb-4">Booking Requests</h2>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b: any) => (
                <div key={b.id} className="bg-card rounded-xl shadow-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{b.properties?.title || "Property"}</p>
                    <p className="text-muted-foreground text-xs">{b.check_in} → {b.check_out}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${b.status === 'accepted' ? 'bg-accent/20 text-accent' : b.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
                      {b.status}
                    </span>
                  </div>
                  {b.host_id === user.id && b.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateBooking.mutate({ id: b.id, status: 'accepted' })}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => updateBooking.mutate({ id: b.id, status: 'rejected' })}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No booking requests yet.</p>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;