import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  booking_id: string | null;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all messages for current user
  const { data: allMessages = [] } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!user,
  });

  // Fetch profiles for all conversation partners
  const partnerIds = [
    ...new Set(
      allMessages.flatMap((m) => [m.sender_id, m.receiver_id]).filter((id) => id !== user?.id)
    ),
  ];

  const { data: profiles = [] } = useQuery({
    queryKey: ["message-profiles", partnerIds.join(",")],
    queryFn: async () => {
      if (partnerIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .in("user_id", partnerIds);
      return data ?? [];
    },
    enabled: partnerIds.length > 0,
  });

  const getProfile = (userId: string) =>
    profiles.find((p) => p.user_id === userId);

  // Build conversation list
  const conversations: Conversation[] = partnerIds.map((partnerId) => {
    const msgs = allMessages.filter(
      (m) =>
        (m.sender_id === partnerId && m.receiver_id === user?.id) ||
        (m.sender_id === user?.id && m.receiver_id === partnerId)
    );
    const lastMsg = msgs[msgs.length - 1];
    const profile = getProfile(partnerId);
    const unread = msgs.filter(
      (m) => m.receiver_id === user?.id && !m.read
    ).length;

    return {
      partnerId,
      partnerName: profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
        : "User",
      partnerAvatar: profile?.avatar_url ?? null,
      lastMessage: lastMsg?.content ?? "",
      lastMessageAt: lastMsg?.created_at ?? "",
      unreadCount: unread,
    };
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  // Current chat messages
  const chatMessages = selectedPartner
    ? allMessages.filter(
        (m) =>
          (m.sender_id === selectedPartner && m.receiver_id === user?.id) ||
          (m.sender_id === user?.id && m.receiver_id === selectedPartner)
      )
    : [];

  // Mark messages as read
  useEffect(() => {
    if (!selectedPartner || !user) return;
    const unreadIds = chatMessages
      .filter((m) => m.receiver_id === user.id && !m.read)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadIds)
        .then(() => queryClient.invalidateQueries({ queryKey: ["messages"] }));
    }
  }, [selectedPartner, chatMessages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPartner || !newMessage.trim()) return;
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedPartner,
        content: newMessage.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      inputRef.current?.focus();
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const selectedProfile = selectedPartner ? getProfile(selectedPartner) : null;
  const selectedName = selectedProfile
    ? `${selectedProfile.first_name || ""} ${selectedProfile.last_name || ""}`.trim() || "User"
    : "User";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 container mx-auto px-4 md:px-8 pb-8">
        <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Messages
        </h1>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[400px]">
          {/* Conversation List */}
          <div
            className={cn(
              "w-full md:w-80 border-r flex-shrink-0 flex flex-col",
              selectedPartner ? "hidden md:flex" : "flex"
            )}
          >
            <div className="p-4 border-b">
              <p className="text-sm font-semibold text-muted-foreground">Conversations</p>
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No conversations yet. Send a message from a property page to start chatting!
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartner(conv.partnerId)}
                    className={cn(
                      "w-full text-left p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b",
                      selectedPartner === conv.partnerId && "bg-accent"
                    )}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={conv.partnerAvatar ?? ""} />
                      <AvatarFallback>{conv.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conv.partnerName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedPartner ? "hidden md:flex" : "flex"
            )}
          >
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="md:hidden text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedProfile?.avatar_url ?? ""} />
                    <AvatarFallback>{selectedName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm">{selectedName}</p>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {format(new Date(msg.created_at), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage.mutate();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-xl h-10 w-10 flex-shrink-0"
                      disabled={!newMessage.trim() || sendMessage.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
