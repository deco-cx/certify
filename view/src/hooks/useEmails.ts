import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

export const useListarCampanhasEmail = (turmaId: number) => {
  return useQuery({
    queryKey: ["campanhas-email", turmaId],
    queryFn: () => client.LISTAR_CAMPANHAS_EMAIL({ turmaId }),
    enabled: !!turmaId,
  });
};

export const useCriarCampanhaEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      turmaId: number;
      runId: number;
      nome: string;
      assunto: string;
      mensagem: string;
    }) => client.CRIAR_CAMPANHA_EMAIL(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["campanhas-email", variables.turmaId] 
      });
    },
  });
};

export const useEnviarCampanhaEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campanhaId: number) => client.ENVIAR_CAMPANHA_EMAIL({ campanhaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campanhas-email"] });
    },
  });
};

export const useBuscarRunsCompletasEmail = (turmaId: number) => {
  return useQuery({
    queryKey: ["runs-completas-email", turmaId],
    queryFn: () => client.BUSCAR_RUNS_COMPLETAS_EMAIL({ turmaId }),
    enabled: !!turmaId,
  });
};

export const useDeletarCampanhaEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campanhaId: number) => client.DELETAR_CAMPANHA_EMAIL({ campanhaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campanhas-email"] });
    },
  });
};
