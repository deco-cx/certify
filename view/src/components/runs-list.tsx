import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeletarRun, useExecutarRun, useListarRuns } from "@/hooks/useRuns";
import { useListarTemplates } from "../hooks/useTemplates";
import { useListarCSVs } from "../hooks/useCSVs";
import { CreateRunModal } from "./create-run-modal";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Download, Eye, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";


interface RunsListProps {
  turmaId: number;
}

export function RunsList({ turmaId }: RunsListProps) {
  const [showCreateRun, setShowCreateRun] = useState(false);
  const [showRunDetalhes, setShowRunDetalhes] = useState(false);
  const [runSelecionada, setRunSelecionada] = useState<any>(null);
  const [deletingRunId, setDeletingRunId] = useState<number | null>(null);

  const { data: runsData, isLoading: isLoadingRuns } = useListarRuns(turmaId);
  const { data: templatesData } = useListarTemplates(turmaId);
  const { data: csvsData } = useListarCSVs(turmaId);
  const deletarRun = useDeletarRun();
  const executarRunMutation = useExecutarRun();

  const handleDeleteRun = async (runId: number) => {
    setDeletingRunId(runId);
    try {
      await deletarRun.mutateAsync({ id: runId });
      toast.success("Run deletado com sucesso!");
      setDeletingRunId(null);
    } catch (error) {
      console.error("Erro ao deletar run:", error);
      toast.error("Erro ao deletar run");
      setDeletingRunId(null);
    }
  };

  const handleExecutarRun = async (runId: number) => {
    try {
      await executarRunMutation.mutateAsync({ runId });
      toast.success("Run iniciado com sucesso!");
    } catch (error) {
      console.error("Erro ao executar run:", error);
      toast.error("Erro ao iniciar run");
    }
  };

  const handleVerRunDetalhes = (run: any) => {
    setRunSelecionada(run);
    setShowRunDetalhes(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "processing":
        return "Processando";
      case "completed":
        return "Concluído";
      case "error":
        return "Erro";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTemplateName = (templateId: number) => {
    return templatesData?.templates?.find((t: any) => t.id === templateId)
      ?.nome || "Template não encontrado";
  };

  const getCSVName = (csvId: number) => {
    return csvsData?.csvs?.find((c: any) => c.id === csvId)?.nome ||
      "CSV não encontrado";
  };

  if (isLoadingRuns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Runs de Certificados</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Runs de Certificados</CardTitle>
            <CardDescription>
              Gerencie os processos de geração de certificados
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateRun(true)}>
            <Play className="w-4 h-4 mr-2" />
            Novo Run
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!runsData?.runs || runsData.runs.length === 0
          ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum run encontrado para esta turma.</p>
              <p className="text-sm">Clique em "Novo Run" para começar.</p>
            </div>
          )
          : (
            <div className="space-y-4">
              {runsData.runs.map((run: any) => (
                <Card key={run.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{run.nome}</h3>
                          <Badge className={getStatusColor(run.status)}>
                            {getStatusText(run.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Template:</span>
                            <p>{getTemplateName(run.templateId)}</p>
                          </div>
                          <div>
                            <span className="font-medium">CSV:</span>
                            <p>{getCSVName(run.csvId)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Coluna Nome:</span>
                            <p>{run.nameColumn}</p>
                          </div>
                          <div>
                            <span className="font-medium">Progresso:</span>
                            <p>{run.certificadosGerados} / {run.totalAlunos}</p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          <span>Criado: {formatDate(run.criadoEm)}</span>
                          {run.iniciadoEm && (
                            <span className="ml-4">
                              Iniciado: {formatDate(run.iniciadoEm)}
                            </span>
                          )}
                          {run.concluidoEm && (
                            <span className="ml-4">
                              Concluído: {formatDate(run.concluidoEm)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {run.status === "pending" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleExecutarRun(run.id)}
                            disabled={executarRunMutation.isPending}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {executarRunMutation.isPending
                              ? "Executando..."
                              : "Executar"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVerRunDetalhes(run)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {run.status === "completed" && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>
                        )}
                        <DeleteConfirmationDialog
                          title="Excluir Run"
                          description="Tem certeza que deseja excluir esta run de certificados?"
                          itemName={run.nome}
                          onConfirm={() => handleDeleteRun(run.id)}
                          isDeleting={deletingRunId === run.id}
                          triggerVariant="outline"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingRunId === run.id}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </DeleteConfirmationDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </CardContent>

      {/* Modal de criação de run */}
      <CreateRunModal
        turmaId={turmaId}
        isOpen={showCreateRun}
        onClose={() => setShowCreateRun(false)}
      />

      {/* Modal de detalhes da run */}
      {showRunDetalhes && runSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalhes da Run: {runSelecionada.nome}
                </h2>
                <p className="text-gray-600 mt-1">
                  Status:{" "}
                  <Badge className={getStatusColor(runSelecionada.status)}>
                    {getStatusText(runSelecionada.status)}
                  </Badge>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRunDetalhes(false)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Informações da Run
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Template:</span>{" "}
                    {getTemplateName(runSelecionada.templateId)}
                  </div>
                  <div>
                    <span className="font-medium">CSV:</span>{" "}
                    {getCSVName(runSelecionada.csvId)}
                  </div>
                  <div>
                    <span className="font-medium">Coluna Nome:</span>{" "}
                    {runSelecionada.nameColumn}
                  </div>
                  <div>
                    <span className="font-medium">Total de Alunos:</span>{" "}
                    {runSelecionada.totalAlunos}
                  </div>
                  <div>
                    <span className="font-medium">Certificados Gerados:</span>
                    {" "}
                    {runSelecionada.certificadosGerados}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Timestamps</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Criado:</span>{" "}
                    {formatDate(runSelecionada.criadoEm)}
                  </div>
                  {runSelecionada.iniciadoEm && (
                    <div>
                      <span className="font-medium">Iniciado:</span>{" "}
                      {formatDate(runSelecionada.iniciadoEm)}
                    </div>
                  )}
                  {runSelecionada.concluidoEm && (
                    <div>
                      <span className="font-medium">Concluído:</span>{" "}
                      {formatDate(runSelecionada.concluidoEm)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {runSelecionada.status === "completed" && (
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Certificados Gerados
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 mb-3">
                    Esta run gerou {runSelecionada.certificadosGerados}{" "}
                    certificados com sucesso.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Switch to certificados tab
                        const certificadosTab = document.querySelector(
                          '[data-value="certificados"]',
                        ) as HTMLElement;
                        if (certificadosTab) {
                          certificadosTab.click();
                          setShowRunDetalhes(false);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Certificados
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Todos
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {runSelecionada.status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-red-800 mb-2">
                  Erro na Execução
                </h3>
                <p className="text-red-600">
                  Esta run encontrou um erro durante a execução. Verifique os
                  logs para mais detalhes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
