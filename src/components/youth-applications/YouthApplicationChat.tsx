"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useYouthApplicationMessages,
  useOptimisticMessage,
} from "@/hooks/use-youth-applications";
import { YouthApplicationMessage } from "@/services/youth-application.service";
import { useCurrentUser } from "@/hooks/use-current-user";

interface YouthApplicationChatProps {
  applicationId: string;
  youthProfile?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export default function YouthApplicationChat({
  applicationId,
  youthProfile,
}: YouthApplicationChatProps) {
  const { user } = useCurrentUser();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } =
    useYouthApplicationMessages(applicationId);
  const sendMessage = useOptimisticMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const messageContent = message.trim();
    setMessage("");

    try {
      await sendMessage.mutateAsync({
        applicationId,
        data: { content: messageContent },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // El error ya se maneja en el hook
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isCurrentUserMessage = (message: YouthApplicationMessage) => {
    // Determine current user's sender type based on their role
    const currentUserSenderType = user?.role === "COMPANIES" ? "COMPANY" : "YOUTH";
    return message.senderType === currentUserSenderType;
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando mensajes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={youthProfile?.avatarUrl} />
            <AvatarFallback>
              {youthProfile
                ? getInitials(youthProfile.firstName, youthProfile.lastName)
                : "JD"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {youthProfile
                ? `${youthProfile.firstName} ${youthProfile.lastName}`
                : "Joven Desarrollador"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {messages?.length || 0} mensajes
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const isCurrentUser = isCurrentUserMessage(msg);
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].createdAt) !==
                  formatDate(msg.createdAt);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(msg.createdAt)}
                      </Badge>
                    </div>
                  )}

                  <div
                    className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          isCurrentUser
                            ? user?.avatarUrl
                            : youthProfile?.avatarUrl
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {isCurrentUser
                          ? user?.role === "COMPANIES"
                            ? "EM"
                            : "JD"
                          : youthProfile
                            ? getInitials(
                                youthProfile.firstName,
                                youthProfile.lastName
                              )
                            : "JD"}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <span className="text-xs font-medium">
                          {isCurrentUser
                            ? "Tú"
                            : youthProfile
                              ? `${youthProfile.firstName} ${youthProfile.lastName}`
                              : "Joven"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>

                      {msg.status === "READ" && isCurrentUser && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">
                            Leído
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No hay mensajes aún
                </h3>
                <p className="text-muted-foreground">
                  Inicia la conversación enviando un mensaje
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
