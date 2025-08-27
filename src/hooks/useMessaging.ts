import { useState, useEffect } from 'react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  otherParticipantId: string;
  participant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface MessagingStats {
  totalConversations: number;
  totalMessages: number;
  unreadMessages: number;
}

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const { profile: currentUser, user } = useCurrentUser();

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Token from localStorage:', !!token);
    return token;
  };

  // Usar directamente el backend en lugar de las API routes
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cemse-back-production-56da.up.railway.app";

  const fetchConversations = async () => {
    try {
      console.log('🔍 Fetching conversations directly from backend...');
      const token = getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${BACKEND_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Conversations response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Conversations error response:', errorText);
        throw new Error(`Error fetching conversations: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Conversations data:', data);
      console.log('🔍 First conversation participant:', data.conversations?.[0]?.participant);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('🔍 Error in fetchConversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${BACKEND_URL}/messages/conversation/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching messages');
      }

      const data = await response.json();
      setCurrentMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const sendMessage = async (receiverId: string, content: string, messageType: string = 'TEXT') => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${BACKEND_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, content, messageType })
      });

      if (!response.ok) {
        throw new Error('Error sending message');
      }

      const data = await response.json();

      // Agregar el nuevo mensaje a la conversación actual
      setCurrentMessages(prev => [...prev, data.data]);

      // Actualizar conversaciones
      await fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${BACKEND_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error marking message as read');
      }

      // Actualizar el estado del mensaje localmente
      setCurrentMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, status: 'READ', readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching stats directly from backend...');
      const token = getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${BACKEND_URL}/messages/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Stats response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Stats error response:', errorText);
        throw new Error(`Error fetching stats: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Stats data:', data);
      setStats(data.stats);
    } catch (err) {
      console.error('🔍 Error in fetchStats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchConversations(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Error in refetch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    refetch();
  }, []);

  return {
    conversations,
    currentMessages,
    stats,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    fetchStats,
    refetch
  };
};
