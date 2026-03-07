import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Plus, Bed, Bath, Users, MapPin, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
      const { error } = await supabase.from("properties").insert({
        user_id: user!.id,
        title,
        description,
        location,
        country,
        type: type as any,
        beds,
        baths,
        guests,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property added!");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setShowAddProperty(false);
      setTitle(""); setDescription(""); setLocation(""); setCountry("");
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
              <Button type="submit" disabled={addProperty.isPending}>
                {addProperty.isPending ? "Adding..." : "Add Property"}
              </Button>
            </form>
          )}

          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="bg-card rounded-xl shadow-card p-4 space-y-2">
                  <h3 className="font-heading font-semibold">{p.title}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-3.5 w-3.5" /> {p.location}
                  </div>
                  <div className="flex gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.guests}</span>
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
