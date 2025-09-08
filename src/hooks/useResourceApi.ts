import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "@/services/resource.service";
import { Resource } from "@/types/api";

// Hook para obtener todos los recursos
export const useResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: () => ResourceService.getAllResources(),
  });
};

// Hook para obtener un recurso específico
export const useResource = (id: string) => {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => ResourceService.getResource(id),
    enabled: !!id,
  });
};

// Hook para crear un recurso
export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Resource> | FormData) =>
      ResourceService.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

// Hook para actualizar un recurso
export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Resource> | FormData;
    }) => ResourceService.updateResource(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
    },
  });
};

// Hook para eliminar un recurso
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceService.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

// Hook para buscar recursos
export const useSearchResources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: string) =>
      ResourceService.getAllResources({ search: query }),
    onSuccess: (data) => {
      queryClient.setQueryData(["resources", "search"], data);
    },
  });
};

// Hook para obtener recursos por tipo
export const useResourcesByType = (type: string) => {
  return useQuery({
    queryKey: ["resources", "type", type],
    queryFn: () =>
      ResourceService.getAllResources({
        type: type === "all" ? undefined : type,
      }),
    enabled: !!type,
  });
};

// Hook para obtener recursos por categoría
export const useResourcesByCategory = (category: string) => {
  return useQuery({
    queryKey: ["resources", "category", category],
    queryFn: () =>
      ResourceService.getAllResources({
        category: category === "all" ? undefined : category,
      }),
    enabled: !!category,
  });
};

// Hook para obtener recursos públicos
export const usePublicResources = (municipalityId?: string) => {
  return useQuery({
    queryKey: ["resources", "public", municipalityId],
    queryFn: async () => {
      const response = await ResourceService.getAllResources({
        municipalityId,
      });
      // Handle response structure: { success: true, resources: [...] } or direct array
      if (response && typeof response === "object" && "resources" in response) {
        return response.resources;
      }
      // Fallback: return as array if it's already an array
      return Array.isArray(response) ? response : [];
    },
    enabled: true,
  });
};

// Hook para obtener recursos destacados
// export const useFeaturedResources = () => {
//   return useQuery({
//     queryKey: ['resources', 'featured'],
//     queryFn: () => ResourceService.getFeaturedResources(),
//   });
// };

// Hook para obtener recursos por autor
// export const useResourcesByAuthor = (authorId: string) => {
//   return useQuery({
//     queryKey: ['resources', 'author', authorId],
//     queryFn: () => ResourceService.getResourcesByAuthor(authorId),
//     enabled: !!authorId,
//   });
// };

// Hook para obtener recursos populares
// export const usePopularResources = (limit: number = 10) => {
//   return useQuery({
//     queryKey: ['resources', 'popular', limit],
//     queryFn: () => ResourceService.getPopularResources(limit),
//   });
// };

// Hook para obtener recursos recientes
// export const useRecentResources = (limit: number = 10) => {
//   return useQuery({
//     queryKey: ['resources', 'recent', limit],
//     queryFn: () => ResourceService.getRecentResources(limit),
//   });
// };

// Hook para descargar un recurso
export const useDownloadResource = () => {
  return useMutation({
    mutationFn: (id: string) => ResourceService.downloadResource(id),
  });
};

// Hook para incrementar descargas
export const useIncrementDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResourceService.incrementDownloads(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

// Hook para calificar un recurso
export const useRateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      ResourceService.rateResource(id, rating),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

// Hook para cambiar visibilidad pública
// export const useTogglePublic = () => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (id: string) => ResourceService.togglePublic(id),
//     onSuccess: (_, id) => {
//       queryClient.invalidateQueries({ queryKey: ['resource', id] });
//       queryClient.invalidateQueries({ queryKey: ['resources'] });
//     },
//   });
// };

// Hook para obtener estadísticas de un recurso
// export const useResourceStats = (id: string) => {
//   return useQuery({
//     queryKey: ['resource', 'stats', id],
//     queryFn: () => ResourceService.getResourceStats(id),
//     enabled: !!id,
//   });
// };

// Hook para obtener categorías de recursos
// export const useResourceCategories = () => {
//   return useQuery({
//     queryKey: ['resources', 'categories'],
//     queryFn: () => ResourceService.getResourceCategories(),
//   });
// };

// Hook para obtener tipos de recursos
// export const useResourceTypes = () => {
//   return useQuery({
//     queryKey: ['resources', 'types'],
//     queryFn: () => ResourceService.getResourceTypes(),
//   });
// };

// Hook para subir archivo de recurso
export const useUploadResourceFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      ResourceService.uploadResource(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};
