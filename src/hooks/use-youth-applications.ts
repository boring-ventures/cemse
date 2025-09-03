import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  YouthApplicationService,
  CreateYouthApplicationRequest,
  UpdateYouthApplicationRequest,
  SendMessageRequest,
  ExpressInterestRequest,
} from "@/services/youth-application.service";

// Query keys
export const YOUTH_APPLICATION_KEYS = {
  all: ["youth-applications"] as const,
  lists: () => [...YOUTH_APPLICATION_KEYS.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...YOUTH_APPLICATION_KEYS.lists(), filters] as const,
  details: () => [...YOUTH_APPLICATION_KEYS.all, "detail"] as const,
  detail: (id: string) => [...YOUTH_APPLICATION_KEYS.details(), id] as const,
  messages: (id: string) =>
    [...YOUTH_APPLICATION_KEYS.detail(id), "messages"] as const,
  interests: (id: string) =>
    [...YOUTH_APPLICATION_KEYS.detail(id), "interests"] as const,
  myApplications: () => [...YOUTH_APPLICATION_KEYS.all, "my"] as const,
  publicApplications: () => [...YOUTH_APPLICATION_KEYS.all, "public"] as const,
};

// Hook para obtener todas las postulaciones
export const useYouthApplications = (filters?: {
  youthProfileId?: string;
  status?: string;
  isPublic?: boolean;
}) => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.list(filters),
    queryFn: () => YouthApplicationService.getYouthApplications(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener mis postulaciones (para jóvenes)
export const useMyApplications = () => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.myApplications(),
    queryFn: () => YouthApplicationService.getMyApplications(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener postulaciones públicas (para empresas)
export const usePublicApplications = () => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.publicApplications(),
    queryFn: () => YouthApplicationService.getPublicApplications(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una postulación específica
export const useYouthApplication = (id: string) => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.detail(id),
    queryFn: () => YouthApplicationService.getYouthApplication(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para crear una nueva postulación
export const useCreateYouthApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateYouthApplicationRequest) =>
      YouthApplicationService.createYouthApplication(data),
    onSuccess: () => {
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.myApplications(),
      });
    },
  });
};

// Hook para actualizar una postulación
export const useUpdateYouthApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateYouthApplicationRequest;
    }) => YouthApplicationService.updateYouthApplication(id, data),
    onSuccess: (data) => {
      // Actualizar la consulta específica
      queryClient.setQueryData(YOUTH_APPLICATION_KEYS.detail(data.id), data);
      // Invalidar las listas
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.myApplications(),
      });
    },
  });
};

// Hook para eliminar una postulación
export const useDeleteYouthApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      YouthApplicationService.deleteYouthApplication(id),
    onSuccess: (_, id) => {
      // Remover de las consultas
      queryClient.removeQueries({
        queryKey: YOUTH_APPLICATION_KEYS.detail(id),
      });
      // Invalidar las listas
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.myApplications(),
      });
    },
  });
};

// Hook para obtener mensajes de una postulación
export const useYouthApplicationMessages = (applicationId: string) => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.messages(applicationId),
    queryFn: () => YouthApplicationService.getMessages(applicationId),
    enabled: !!applicationId,
    staleTime: 1 * 60 * 1000, // 1 minuto (más frecuente para mensajes)
  });
};

// Hook para enviar mensaje
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: SendMessageRequest;
    }) => YouthApplicationService.sendMessage(applicationId, data),
    onSuccess: (_, { applicationId }) => {
      // Invalidar los mensajes de esta aplicación
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.messages(applicationId),
      });
    },
  });
};

// Hook para obtener intereses de empresas
export const useCompanyInterests = (applicationId: string) => {
  return useQuery({
    queryKey: YOUTH_APPLICATION_KEYS.interests(applicationId),
    queryFn: () => YouthApplicationService.getCompanyInterests(applicationId),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para expresar interés de empresa
export const useExpressCompanyInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ExpressInterestRequest;
    }) => YouthApplicationService.expressCompanyInterest(applicationId, data),
    onSuccess: (_, { applicationId }) => {
      // Invalidar los intereses de esta aplicación
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.interests(applicationId),
      });
      // Invalidar la aplicación específica para actualizar contadores
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.detail(applicationId),
      });
    },
  });
};

// Hook para optimistic updates de mensajes
export const useOptimisticMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: SendMessageRequest;
    }) => {
      console.log("🔍 useOptimisticMessage - Calling sendMessage:", {
        applicationId,
        data,
      });
      const result = await YouthApplicationService.sendMessage(
        applicationId,
        data
      );
      console.log("✅ useOptimisticMessage - sendMessage result:", result);
      return result;
    },
    onMutate: async ({ applicationId, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({
        queryKey: YOUTH_APPLICATION_KEYS.messages(applicationId),
      });

      // Snapshot del valor anterior
      const previousMessages = queryClient.getQueryData(
        YOUTH_APPLICATION_KEYS.messages(applicationId)
      );

      // Note: We don't create optimistic updates for messages since sender type
      // needs to be determined by the API based on user profile
      // The API will handle the message creation and we'll refetch

      return { previousMessages };
    },
    onError: (err, { applicationId }, context) => {
      // Revertir en caso de error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          YOUTH_APPLICATION_KEYS.messages(applicationId),
          context.previousMessages
        );
      }
    },
    onSettled: (_, __, { applicationId }) => {
      // Siempre refetch para asegurar sincronización
      queryClient.invalidateQueries({
        queryKey: YOUTH_APPLICATION_KEYS.messages(applicationId),
      });
    },
  });
};

// Hook para obtener conteo de mensajes no leídos por postulación
export const useUnreadMessagesCount = (applicationId: string) => {
  return useQuery({
    queryKey: [
      ...YOUTH_APPLICATION_KEYS.messages(applicationId),
      "unread-count",
    ],
    queryFn: async () => {
      const messages = await YouthApplicationService.getMessages(applicationId);

      // Get user info from localStorage or use a simple approach
      let userRole = "YOUTH"; // Default
      try {
        const token = localStorage.getItem("cemse-auth-token");
        if (token) {
          // Simple token parsing to get role
          const userProfile = localStorage.getItem("userProfile");
          if (userProfile) {
            const profile = JSON.parse(userProfile);
            userRole = profile.role || "YOUTH";
          }
        }
      } catch (error) {
        console.error("Error getting user role for unread count:", error);
      }

      // Contar mensajes no leídos que no son del usuario actual
      return messages.filter(
        (msg) =>
          !msg.readAt &&
          msg.senderType !== (userRole === "COMPANIES" ? "COMPANY" : "YOUTH")
      ).length;
    },
    enabled: !!applicationId,
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 60 * 1000, // Refetch cada 1 minuto
  });
};

// Hook para obtener conteo total de mensajes no leídos
export const useTotalUnreadMessagesCount = () => {
  const { data: applications } = useMyApplications();

  return useQuery({
    queryKey: [...YOUTH_APPLICATION_KEYS.myApplications(), "total-unread"],
    queryFn: async () => {
      if (!applications || applications.length === 0) return 0;

      let totalUnread = 0;

      // Get user info from localStorage
      let userRole = "YOUTH"; // Default
      try {
        const token = localStorage.getItem("cemse-auth-token");
        if (token) {
          const userProfile = localStorage.getItem("userProfile");
          if (userProfile) {
            const profile = JSON.parse(userProfile);
            userRole = profile.role || "YOUTH";
          }
        }
      } catch (error) {
        console.error("Error getting user role for total unread count:", error);
      }

      for (const application of applications) {
        const messages = await YouthApplicationService.getMessages(
          application.id
        );

        const unreadCount = messages.filter(
          (msg) =>
            !msg.readAt &&
            msg.senderType !== (userRole === "COMPANIES" ? "COMPANY" : "YOUTH")
        ).length;

        totalUnread += unreadCount;
      }

      return totalUnread;
    },
    enabled: !!applications && applications.length > 0,
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 60 * 1000, // Refetch cada 1 minuto
  });
};
