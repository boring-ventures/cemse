"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ArrowLeft, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CompanyChatModal from "./CompanyChatModal";

interface ChatSummary {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  businessSector?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  hasMessages: boolean;
  totalMessages: number;
}

interface ChatListModalProps {
  applicationId: string;
  applicationTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatListModal({
  applicationId,
  applicationTitle,
  open,
  onOpenChange,
}: ChatListModalProps) {
  const { toast } = useToast();
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ChatSummary | null>(
    null
  );
  const [showCompanyChat, setShowCompanyChat] = useState(false);

  useEffect(() => {
    if (open && applicationId) {
      fetchChatSummaries();
    }
  }, [open, applicationId]);

  const fetchChatSummaries = async () => {
    if (!applicationId) return;

    console.log(
      "🔍 ChatListModal: Fetching chat summaries for applicationId:",
      applicationId
    );

    try {
      setLoading(true);
      const response = await fetch(
        `/api/youthapplication/${applicationId}/chat-summary`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🔍 ChatListModal: Response status:", response.status);
      console.log("🔍 ChatListModal: Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 ChatListModal: Received data:", data);
        console.log("🔍 ChatListModal: Summaries:", data.summaries);

        // For now, just display all messages as individual chat items
        setChatSummaries(data.summaries || []);
      } else {
        const errorData = await response.json();
        console.error("🔍 ChatListModal: API Error:", errorData);
        throw new Error("Failed to fetch chat summaries");
      }
    } catch (error) {
      console.error("Error fetching chat summaries:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompanyChat = (chat: ChatSummary) => {
    setSelectedCompany(chat);
    setShowCompanyChat(true);
  };

  const handleCloseCompanyChat = () => {
    setShowCompanyChat(false);
    setSelectedCompany(null);
    // Refresh the chat list when returning from individual chat
    fetchChatSummaries();
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

  const getTotalUnreadCount = () => {
    return chatSummaries.filter((message) => !message.readAt).length;
  };

  return (
    <>
      <Dialog open={open && !showCompanyChat} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[95vh] flex flex-col p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Conversaciones
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    {applicationTitle}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTotalUnreadCount() > 0 && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {getTotalUnreadCount()} mensaje
                    {getTotalUnreadCount() > 1 ? "s" : ""} nuevo
                    {getTotalUnreadCount() > 1 ? "s" : ""}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchChatSummaries}
                  disabled={loading}
                  className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : chatSummaries.length > 0 ? (
              <div className="space-y-4">
                {chatSummaries.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      console.log("Clicked company message:", message);
                      // Open chat with this specific company (all messages are from companies now)
                      setSelectedCompany({
                        companyId: message.senderId,
                        companyName: message.senderName,
                        companyLogo: null,
                        businessSector: "Unknown",
                        lastMessage: message.content,
                        lastMessageTime: message.createdAt,
                        unreadCount: 0,
                        hasMessages: true,
                        totalMessages: 1,
                      });
                      setShowCompanyChat(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="font-semibold bg-blue-100 text-blue-600">
                          C
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {message.senderName}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          Company • {message.senderId}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {message.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {message.readAt ? "Leído" : "No leído"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay conversaciones
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Aún no tienes conversaciones con empresas sobre esta
                  postulación.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Company Chat Modal */}
      {selectedCompany && (
        <CompanyChatModal
          applicationId={applicationId}
          company={{
            id: selectedCompany.companyId,
            name: selectedCompany.companyName,
            logoUrl: selectedCompany.companyLogo,
            businessSector: selectedCompany.businessSector,
          }}
          open={showCompanyChat}
          onOpenChange={handleCloseCompanyChat}
        />
      )}
    </>
  );
}
