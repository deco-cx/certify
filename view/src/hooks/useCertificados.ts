import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook para listar certificados de uma turma
export const useListarCertificados = (turmaId: number) => {
  return useQuery({
    queryKey: ["certificados", turmaId],
    queryFn: () => client.LISTAR_CERTIFICADOS({ turmaId }),
    enabled: !!turmaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar certificado por ID
export const useBuscarCertificadoPorId = (id: number) => {
  return useQuery({
    queryKey: ["certificado", id],
    queryFn: () => client.BUSCAR_CERTIFICADO_POR_ID({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar certificado
export const useCriarCertificado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      runId?: number;
      turmaId: number;
      templateId: number;
      csvId: number;
      linhaIndex: number;
      dados: string;
      nome?: string;
      arquivoUrl?: string;
      arquivoId?: string;
      status?: string;
      generateUrl?: string;
    }) => client.CRIAR_CERTIFICADO(data),
    
    onSuccess: (data, variables) => {
      // Invalidate certificados list for the turma
      queryClient.invalidateQueries({ queryKey: ["certificados", variables.turmaId] });
      
      // Invalidate runs list if runId is provided
      if (variables.runId) {
        queryClient.invalidateQueries({ queryKey: ["runs", variables.turmaId] });
      }
    },
  });
};

// Hook para atualizar certificado
export const useAtualizarCertificado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: number;
      status?: string;
      arquivoUrl?: string;
      arquivoId?: string;
      generateUrl?: string;
      verificadoEm?: string;
      emailEnviado?: boolean;
      emailDestinatario?: string;
    }) => client.ATUALIZAR_CERTIFICADO(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific certificado
      queryClient.invalidateQueries({ queryKey: ["certificado", variables.id] });
      
      // Invalidate certificados list (we need to get turmaId from the response)
      // This will be handled by the component using the hook
    },
  });
};

// Hook para deletar certificado
export const useDeletarCertificado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number }) => client.DELETAR_CERTIFICADO(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific certificado
      queryClient.invalidateQueries({ queryKey: ["certificado", variables.id] });
      
      // Note: We can't invalidate the list without knowing the turmaId
      // The component using this hook should handle list invalidation
    },
  });
};
