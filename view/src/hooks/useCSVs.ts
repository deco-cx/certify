import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook para listar CSVs de uma turma
export const useListarCSVs = (turmaId: number) => {
  return useQuery({
    queryKey: ["csvs", turmaId],
    queryFn: () => client.LISTAR_CSVS({ turmaId }),
    enabled: !!turmaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar CSV por ID
export const useBuscarCSVPorId = (id: number) => {
  return useQuery({
    queryKey: ["csv", id],
    queryFn: () => client.BUSCAR_CSV_POR_ID({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar CSV
export const useCriarCSV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      turmaId: number;
      nome: string;
      dados: string;
      colunas: string;
      templateId?: number;
    }) => client.CRIAR_CSV(data),
    
    onSuccess: (data, variables) => {
      // Invalidate CSVs list for the turma
      queryClient.invalidateQueries({ queryKey: ["csvs", variables.turmaId] });
      
      // Invalidate turma data to refresh counts
      queryClient.invalidateQueries({ queryKey: ["turma", variables.turmaId] });
    },
  });
};

// Hook para atualizar CSV
export const useAtualizarCSV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: number;
      nome?: string;
      dados?: string;
      colunas?: string;
      templateId?: number;
      processadoEm?: string;
    }) => client.ATUALIZAR_CSV(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific CSV
      queryClient.invalidateQueries({ queryKey: ["csv", variables.id] });
      
      // Invalidate CSVs list (we need to get turmaId from the response)
      // This will be handled by the component using the hook
    },
  });
};

// Hook para deletar CSV
export const useDeletarCSV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number }) => client.DELETAR_CSV(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific CSV
      queryClient.invalidateQueries({ queryKey: ["csv", variables.id] });
      
      // Note: We can't invalidate the list without knowing the turmaId
      // The component using this hook should handle list invalidation
    },
  });
};
