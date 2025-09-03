import { useState, useEffect } from "react";
import { useAuthContext } from "./use-auth";

export interface YouthApplicationMessage {
  id: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  senderId: string;
  senderType: "COMPANY" | "YOUTH";
  status: "SENT" | "DELIVERED" | "READ";
  createdAt: string;
  readAt?: string;
}

export interface SendMessageData {
  content: string;
  messageType?: "TEXT" | "IMAGE" | "FILE";
}

export function useYouthApplicationMessages(applicationId: string) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<YouthApplicationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if applicationId is valid
  const isValidApplicationId = (id: string) => {
    return id && id.trim() !== "" && id !== "undefined" && id !== "null";
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!isValidApplicationId(applicationId)) {
      console.log(
        "🔍 useYouthApplicationMessages - Skipping fetchMessages: invalid applicationId:",
        applicationId
      );
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `/api/youthapplication/${applicationId}/message`;
      console.log(
        "🔍 useYouthApplicationMessages - Fetching messages from URL:",
        url
      );
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // Use cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageData: SendMessageData) => {
    if (!isValidApplicationId(applicationId) || !messageData.content.trim()) {
      console.log(
        "🔍 useYouthApplicationMessages - Skipping sendMessage: invalid applicationId:",
        applicationId
      );
      throw new Error("ID de aplicación inválido o mensaje vacío");
    }

    try {
      setSending(true);
      setError(null);

      const url = `/api/youthapplication/${applicationId}/message`;
      console.log(
        "🔍 useYouthApplicationMessages - Sending message to URL:",
        url
      );
      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Use cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageData.content,
          messageType: messageData.messageType || "TEXT",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle the response structure - could be the message object directly or wrapped
      const newMessage = data.message || data;
      setMessages((prev) => [...prev, newMessage]);

      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!isValidApplicationId(applicationId)) {
      console.log(
        "🔍 useYouthApplicationMessages - Skipping markAsRead: invalid applicationId:",
        applicationId
      );
      return;
    }

    try {
      await fetch(
        `/api/youthapplication/${applicationId}/message/${messageId}/read`,
        {
          method: "PUT",
          credentials: "include", // Use cookies for authentication
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

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const response = await fetch("/api/youthapplication/unread-count", {
        method: "GET",
        credentials: "include", // Use cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.unreadCount || 0;
      }
      return 0;
    } catch (err) {
      console.error("Error getting unread count:", err);
      return 0;
    }
  };

  // Fetch messages when applicationId changes
  useEffect(() => {
    console.log(
      "🔍 useYouthApplicationMessages - useEffect triggered with applicationId:",
      applicationId
    );

    if (!isValidApplicationId(applicationId)) {
      console.log(
        "🔍 useYouthApplicationMessages - Skipping useEffect: invalid applicationId"
      );
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Initial fetch
    fetchMessages();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (isValidApplicationId(applicationId)) {
        fetchMessages();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [applicationId]); // Only depend on applicationId

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markAsRead,
    getUnreadCount,
    refreshMessages: fetchMessages,
  };
}
