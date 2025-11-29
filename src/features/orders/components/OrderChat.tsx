"use client";

import { useEffect, useState, useRef } from "react";
import { fetchMessages, sendMessage } from "../api/ordersService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Image as ImageIcon, X, Reply } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Image from "next/image";
import { ImageViewerDialog } from "./ImageViewerDialog";

interface Message {
  id: number;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: {
    id: number;
    name: string;
    role: string;
  };
  replyTo?: {
    id: number;
    content: string;
    imageUrl?: string | null;
    author: {
      name: string;
    };
  } | null;
}

interface OrderChatProps {
  orderId: number;
}

export function OrderChat({ orderId }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserIdRef = useRef<number | null>(null);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserIdRef.current = payload.sub;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMessages(orderId);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("فشل تحميل الرسائل");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);

    // Create EventSource for real-time updates
    const eventSource = new EventSource(
      `/api/orders/${orderId}/messages/stream?token=${token}`
    );

    eventSource.onopen = () => {
      console.log("Chat connected");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newMessages = data.messages || data;
        const onlineUsers = data.onlineUsers || [];
        
        setMessages(newMessages);
        setIsLoading(false);

        // Check if other party is online (anyone except current user)
        if (currentUserIdRef.current && Array.isArray(onlineUsers)) {
          const othersOnline = onlineUsers.filter((id: number) => id !== currentUserIdRef.current);
          console.log("Online users:", onlineUsers, "Current user:", currentUserIdRef.current, "Others:", othersOnline);
          setOtherPartyOnline(othersOnline.length > 0);
        } else {
          setOtherPartyOnline(false);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      setIsConnected(false);
      eventSource.close();
      // Fallback to polling on error
      loadMessages();
    };

    return () => {
      setIsConnected(false);
      eventSource.close();
    };
  }, [orderId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Attempting to send message:", {
      hasText: !!newMessage.trim(),
      hasImage: !!selectedImage,
      newMessage,
      selectedImage,
      replyToId: replyingTo?.id
    });
    
    if (!newMessage.trim() && !selectedImage) {
      console.log("Blocked: no text and no image");
      return;
    }

    try {
      setIsSending(true);
      console.log("Sending message...");
      await sendMessage(orderId, newMessage, selectedImage, replyingTo?.id);
      console.log("Message sent successfully");
      setNewMessage("");
      clearImage();
      setReplyingTo(null);
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(String(error) || "فشل إرسال الرسالة");
    } finally {
      setIsSending(false);
    }
  };

  const scrollToMessage = (messageId: number) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-accent/20');
      setTimeout(() => element.classList.remove('bg-accent/20'), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-md">
      <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">المحادثة</h3>
          {otherPartyOnline && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              الطرف الآخر متصل
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollRef}>
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد رسائل بعد. ابدأ المحادثة!
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.author.role !== "CUSTOMER"; 
              
              return (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className={`flex flex-col group transition-colors duration-500 rounded-lg p-1 ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`max-w-[90%] rounded-lg overflow-hidden relative ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.replyTo && (
                        <div 
                          onClick={() => scrollToMessage(message.replyTo!.id)}
                          className={`text-xs p-2 mb-1 border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${isMe ? "border-primary-foreground/50 bg-primary-foreground/10" : "border-primary/50 bg-muted-foreground/10"}`}
                        >
                          <span className="font-bold block mb-1">{message.replyTo.author.name}</span>
                          {message.replyTo.imageUrl && (
                            <div className="flex items-center gap-1 mb-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>صورة</span>
                            </div>
                          )}
                          <span className="line-clamp-1">{message.replyTo.content}</span>
                        </div>
                      )}

                      {message.imageUrl && (
                        <div 
                          className="relative w-72 h-48 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setViewerImageUrl(message.imageUrl!)}
                        >
                          <img
                            src={message.imageUrl}
                            alt="Message attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap p-3">{message.content}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setReplyingTo(message)}
                      title="رد"
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{message.author.name}</span>
                    <span>
                      {format(new Date(message.createdAt), "p", { locale: ar })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        {replyingTo && (
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded mb-2 border-l-4 border-primary">
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-primary">الرد على {replyingTo.author.name}</span>
              <span className="text-muted-foreground line-clamp-1">
                {replyingTo.content || (replyingTo.imageUrl ? "صورة" : "")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <div className="relative w-20 h-20 rounded border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || (!newMessage.trim() && !selectedImage)}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      <ImageViewerDialog 
        imageUrl={viewerImageUrl}
        open={!!viewerImageUrl}
        onOpenChange={(open) => !open && setViewerImageUrl(null)}
      />
    </div>
  );
}
