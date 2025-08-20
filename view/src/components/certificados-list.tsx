import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  useDeletarCertificado,
  useListarCertificados,
} from "../hooks/useCertificados";
import { useListarTemplates } from "../hooks/useTemplates";
import { useListarCSVs } from "../hooks/useCSVs";
import { useListarRuns } from "../hooks/useRuns";
import { Download, ExternalLink, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UnicornLoading } from "./unicorn-loading";

interface CertificadosListProps {
  turmaId: number;
}

export function CertificadosList({ turmaId }: CertificadosListProps) {
  const [selectedRunId, setSelectedRunId] = useState<string>("all");

  // Convert selectedRunId to number or null for the hook
  const runIdForQuery = selectedRunId === "all"
    ? null
    : (selectedRunId === "none" ? 0 : parseInt(selectedRunId));

  const { data: certificadosData, isLoading: isLoadingCertificados } =
    useListarCertificados(turmaId, runIdForQuery);
  const { data: templatesData } = useListarTemplates(turmaId);
  const { data: csvsData } = useListarCSVs(turmaId);
  const { data: runsData } = useListarRuns(turmaId);
  const deletarCertificado = useDeletarCertificado();

  const handleDeleteCertificado = async (certificadoId: number) => {
    if (confirm("Tem certeza que deseja deletar este certificado?")) {
      try {
        await deletarCertificado.mutateAsync({ id: certificadoId.toString() });
        toast.success("Certificado deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar certificado:", error);
        toast.error("Erro ao deletar certificado");
      }
    }
  };

  const getStatusColor = (status: string | null) => {
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

  const getStatusText = (status: string | null) => {
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
        return "Não definido";
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

  const getRunName = (runId: number | null) => {
    if (!runId) return "Sem run";
    return runsData?.runs?.find((r: any) => r.id === runId)?.nome ||
      "Run não encontrado";
  };

  const getStudentName = (dados: string, linhaIndex: number) => {
    try {
      const dadosArray = JSON.parse(dados);
      if (Array.isArray(dadosArray) && dadosArray[linhaIndex]) {
        // Assume que a primeira coluna é o nome
        return dadosArray[linhaIndex][0] || `Linha ${linhaIndex + 1}`;
      }
      return `Linha ${linhaIndex + 1}`;
    } catch (error) {
      return `Linha ${linhaIndex + 1}`;
    }
  };

  if (isLoadingCertificados) {
    return (
      <UnicornLoading 
        message="Carregando certificados..." 
        fullScreen={false}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle>Certificados Gerados</CardTitle>
            <CardDescription>
              Visualize e gerencie os certificados organizados por runs
            </CardDescription>
          </div>

          {/* Select de Runs */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por Run:
            </label>
            <Select value={selectedRunId} onValueChange={setSelectedRunId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma run" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Runs</SelectItem>
                <SelectItem value="none">Sem Run</SelectItem>
                {runsData?.runs?.map((run: any) => (
                  <SelectItem key={run.id} value={run.id.toString()}>
                    {run.nome} ({getStatusText(run.status)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!certificadosData?.certificados ||
            certificadosData.certificados.length === 0
          ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum certificado gerado ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Primeiro, crie um run na aba "Runs" para gerar certificados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Switch to runs tab
                  const runsTab = document.querySelector(
                    '[data-value="runs"]',
                  ) as HTMLElement;
                  if (runsTab) runsTab.click();
                }}
              >
                <FileText className="h-4 h-4 mr-2" />
                Ir para Runs
              </Button>
            </div>
          )
          : (
            <div className="space-y-4">
              {/* Header informativo da seleção atual */}
              {selectedRunId !== "all" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    {selectedRunId === "none"
                      ? "Mostrando certificados sem run associado"
                      : `Mostrando certificados da run: ${
                        runsData?.runs?.find((r: any) =>
                          r.id === parseInt(selectedRunId)
                        )?.nome || "Run não encontrada"
                      }`}
                  </p>
                </div>
              )}

              {/* Lista de Certificados */}
              <div className="space-y-3">
                {certificadosData.certificados.map((certificado: any) => (
                  <Card
                    key={certificado.id}
                    className="border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {certificado.nome ||
                                getStudentName(
                                  certificado.dados,
                                  certificado.linhaIndex,
                                )}
                            </h4>
                            <Badge
                              className={getStatusColor(certificado.status)}
                            >
                              {getStatusText(certificado.status)}
                            </Badge>
                            {certificado.emailEnviado && (
                              <Badge className="bg-green-100 text-green-800">
                                Email Enviado
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Template:</span>
                              <p>{getTemplateName(certificado.templateId)}</p>
                            </div>
                            <div>
                              <span className="font-medium">CSV:</span>
                              <p>{getCSVName(certificado.csvId)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Run:</span>
                              <p>{getRunName(certificado.runId)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Linha:</span>
                              <p>{certificado.linhaIndex + 1}</p>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            <span>
                              Criado: {formatDate(certificado.criadoEm)}
                            </span>
                            {certificado.verificadoEm && (
                              <span className="ml-4">
                                Verificado:{" "}
                                {formatDate(certificado.verificadoEm)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://deco.chat/deco-camp-certificados/${certificado.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver
                            </a>
                          </Button>
                          {certificado.arquivoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={certificado.arquivoUrl} download>
                                <Download className="w-4 h-4 mr-1" />
                                Baixar
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteCertificado(certificado.id)}
                            disabled={deletarCertificado.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </div>

                      {/* URL de Verificação */}
                      <div className="mt-2">
                        <span className="font-medium">URL de Verificação:</span>
                        <a
                          href={`https://deco.chat/deco-camp-certificados/${certificado.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {`https://deco.chat/deco-camp-certificados/${certificado.id}`}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
