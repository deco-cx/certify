import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";
import { toast } from "sonner";

// Hook para listar runs de uma turma
export const useListarRuns = (turmaId: number) => {
  return useQuery({
    queryKey: ["runs", turmaId],
    queryFn: () => client.LISTAR_RUNS({ turmaId }),
    enabled: !!turmaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar run por ID
export const useBuscarRunPorId = (id: number) => {
  return useQuery({
    queryKey: ["run", id],
    queryFn: () => client.BUSCAR_RUN_POR_ID({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar run
export const useCriarRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      turmaId: number;
      nome: string;
      templateId: number;
      csvId: number;
      nameColumn: string;
    }) => client.CRIAR_RUN(data),
    
    onSuccess: (data, variables) => {
      // Invalidate runs list for the turma
      queryClient.invalidateQueries({ queryKey: ["runs", variables.turmaId] });
      
      // Invalidate turma data to refresh counts
      queryClient.invalidateQueries({ queryKey: ["turma", variables.turmaId] });
    },
  });
};

// Hook para atualizar run
export const useAtualizarRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: number;
      nome?: string;
      status?: string;
      certificadosGerados?: number;
      iniciadoEm?: string;
      concluidoEm?: string;
    }) => client.ATUALIZAR_RUN(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific run
      queryClient.invalidateQueries({ queryKey: ["run", variables.id] });
      
      // Invalidate runs list (we need to get turmaId from the response)
      // This will be handled by the component using the hook
    },
  });
};

// Hook para deletar run
export const useDeletarRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number }) => client.DELETAR_RUN(data),
    
    onSuccess: (data, variables) => {
      // Invalidate specific run
      queryClient.invalidateQueries({ queryKey: ["run", variables.id] });
      
      // Note: We can't invalidate the list without knowing the turmaId
      // The component using this hook should handle list invalidation
    },
  });
};

export const useExecutarRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { runId: number }) => client.EXECUTAR_RUN(input),
    onSuccess: (data: any, variables) => {
      // Invalidate related queries after successful execution
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["certificados"] });
      
      // Show success message
      toast.success(data.message);
    },
    onError: (error) => {
      console.error("Error executing run:", error);
      toast.error(`Erro ao executar run: ${error.message}`);
    },
  });
};
