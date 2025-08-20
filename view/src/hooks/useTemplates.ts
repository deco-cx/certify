import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook para listar templates de uma turma
export const useListarTemplates = (turmaId: number) => {
  return useQuery({
    queryKey: ["templates", turmaId],
    queryFn: () => client.LISTAR_TEMPLATES({ turmaId }),
    enabled: !!turmaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar template por ID
export const useBuscarTemplatePorId = (id: number) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: () => client.BUSCAR_TEMPLATE_POR_ID({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar template
export const useCriarTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      turmaId: number;
      nome: string;
      arquivoUrl: string;
      arquivoId?: string;
      tipo?: string;
      campos?: string;
    }) => client.CRIAR_TEMPLATE(data),
    
    onSuccess: (data, variables) => {
      // Invalidate templates list for the turma
      queryClient.invalidateQueries({ queryKey: ["templates", variables.turmaId] });
      
      // Invalidate turma data to refresh counts
      queryClient.invalidateQueries({ queryKey: ["turma", variables.turmaId] });
    },
  });
};

// Hook para atualizar template
export const useAtualizarTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: number;
      nome?: string;
      arquivoUrl?: string;
      arquivoId?: string;
      tipo?: string;
      campos?: string;
    }) => client.ATUALIZAR_TEMPLATE(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific template
      queryClient.invalidateQueries({ queryKey: ["template", variables.id] });
      
      // Invalidate templates list (we need to get turmaId from the response)
      // This will be handled by the component using the hook
    },
  });
};

// Hook para deletar template
export const useDeletarTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number }) => client.DELETAR_TEMPLATE(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific template
      queryClient.invalidateQueries({ queryKey: ["template", variables.id] });
      
      // Note: We can't invalidate the list without knowing the turmaId
      // The component using this hook should handle list invalidation
    },
  });
};
