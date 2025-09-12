"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  RefreshCw,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/use-auth";

interface YouthApplicationMessage {
  id: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  senderId: string;
  senderType: "COMPANY" | "YOUTH";
  status: "SENT" | "DELIVERED" | "READ";
  createdAt: string;
  readAt?: string;
}

interface Company {
  id: string;
  name: string;
  businessSector?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

interface CompanyChatModalProps {
  applicationId: string;
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompanyChatModal({
  applicationId,
  company,
  open,
  onOpenChange,
}: CompanyChatModalProps) {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<YouthApplicationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && applicationId && company) {
      fetchMessages();
    }
  }, [open, applicationId, company]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/youthapplication-messages/${applicationId}/messages`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const messagesArray = data.messages || [];

      // Filter messages to show conversation between youth and this specific company
      const conversationMessages = messagesArray.filter(
        (msg: YouthApplicationMessage) =>
          msg.senderType === "YOUTH" ||
          (msg.senderType === "COMPANY" && msg.senderId === company?.id)
      );

      setMessages(conversationMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !applicationId) return;

    try {
      setSending(true);
      setError(null);

      const response = await fetch(
        "/api/youthapplication-messages/send-message",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            content: newMessage.trim(),
            messageType: "TEXT",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newMsg = data.message || data;
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(
        `/api/youthapplication-messages/${applicationId}/messages/${messageId}/read`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status: "READ", readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Ahora";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] flex flex-col p-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-12 h-12">
                <AvatarImage src={company.logoUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {company.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {company.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {company.businessSector || "Sector no especificado"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMessages}
                disabled={loading}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Recargar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">
                  Cargando mensajes...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error al cargar mensajes
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={fetchMessages}
                disabled={loading}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay mensajes
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Inicia la conversación enviando un mensaje a {company.name}.
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message) => {
                const isOwnMessage =
                  message.senderType === "YOUTH" &&
                  message.senderId === user?.id;
                const isCompanyMessage = message.senderType === "COMPANY";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] ${isOwnMessage ? "order-2" : "order-1"}`}
                    >
                      {/* Sender info */}
                      <div
                        className={`text-xs mb-2 font-medium ${
                          isOwnMessage
                            ? "text-right text-blue-600"
                            : "text-left text-gray-600"
                        }`}
                      >
                        {isOwnMessage
                          ? "Tú"
                          : isCompanyMessage
                            ? company.name
                            : "Usuario"}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`p-4 rounded-2xl shadow-sm ${
                          isOwnMessage
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <p
                            className={`text-xs ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                          {isOwnMessage && (
                            <div className="text-xs text-blue-100">
                              {message.status === "READ" ? "✓✓" : "✓"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                placeholder={`Escribe un mensaje a ${company.name}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[60px] max-h-[150px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={sending}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 min-w-[100px]"
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
