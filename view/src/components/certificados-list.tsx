import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useListarCertificados, useDeletarCertificado } from "../hooks/useCertificados";
import { useListarTemplates } from "../hooks/useTemplates";
import { useListarCSVs } from "../hooks/useCSVs";
import { useListarRuns } from "../hooks/useRuns";
import { Download, Eye, Trash2, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

interface CertificadosListProps {
  turmaId: number;
}

export function CertificadosList({ turmaId }: CertificadosListProps) {
  const { data: certificadosData, isLoading: isLoadingCertificados } = useListarCertificados(turmaId);
  const { data: templatesData } = useListarTemplates(turmaId);
  const { data: csvsData } = useListarCSVs(turmaId);
  const { data: runsData } = useListarRuns(turmaId);
  const deletarCertificado = useDeletarCertificado();

  const handleDeleteCertificado = async (certificadoId: number) => {
    if (confirm("Tem certeza que deseja deletar este certificado?")) {
      try {
        await deletarCertificado.mutateAsync({ id: certificadoId });
        toast.success("Certificado deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar certificado:", error);
        toast.error("Erro ao deletar certificado");
      }
    }
  };

  const handleDownloadRunPDFs = async (runId: number, certificados: any[]) => {
    try {
      toast.info(`Funcionalidade de download em lote temporariamente desabilitada. Use o botão "Ver" para baixar certificados individuais.`);
      
      // TODO: Implementar download em lote usando client-side generation
      // Isso requer carregar cada certificado HTML e usar html2pdf para cada um
      // Por enquanto, usuário deve usar downloads individuais
      
    } catch (error) {
      console.error("Erro ao fazer download em lote:", error);
      toast.error("Erro ao fazer download em lote");
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
    return templatesData?.templates?.find((t: any) => t.id === templateId)?.nome || "Template não encontrado";
  };

  const getCSVName = (csvId: number) => {
    return csvsData?.csvs?.find((c: any) => c.id === csvId)?.nome || "CSV não encontrado";
  };

  const getRunName = (runId: number | null) => {
    if (!runId) return "Sem run";
    return runsData?.runs?.find((r: any) => r.id === runId)?.nome || "Run não encontrado";
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
      <Card>
        <CardHeader>
          <CardTitle>Certificados Gerados</CardTitle>
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
            <CardTitle>Certificados Gerados</CardTitle>
            <CardDescription>
              Visualize e gerencie os certificados organizados por runs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!certificadosData?.certificados || certificadosData.certificados.length === 0 ? (
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
                const runsTab = document.querySelector('[data-value="runs"]') as HTMLElement;
                if (runsTab) runsTab.click();
              }}
            >
              <FileText className="h-4 h-4 mr-2" />
              Ir para Runs
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agrupar certificados por run */}
            {(() => {
              // Agrupar certificados por runId
              const certificadosPorRun = certificadosData.certificados.reduce((acc: any, certificado: any) => {
                const runId = certificado.runId || 'sem-run';
                if (!acc[runId]) {
                  acc[runId] = [];
                }
                acc[runId].push(certificado);
                return acc;
              }, {});

              // Ordenar runs por data de criação (mais recente primeiro)
              const runsOrdenadas = Object.keys(certificadosPorRun).sort((a, b) => {
                if (a === 'sem-run') return 1;
                if (b === 'sem-run') return -1;
                
                const runA = runsData?.runs?.find((r: any) => r.id === parseInt(a));
                const runB = runsData?.runs?.find((r: any) => r.id === parseInt(b));
                
                if (!runA || !runB) return 0;
                return new Date(runB.criadoEm).getTime() - new Date(runA.criadoEm).getTime();
              });

              return runsOrdenadas.map((runId) => {
                const certificados = certificadosPorRun[runId];
                const run = runId !== 'sem-run' ? runsData?.runs?.find((r: any) => r.id === parseInt(runId)) : null;
                
                return (
                  <div key={runId} className="border rounded-lg p-4 bg-gray-50">
                    {/* Header da Run */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {run ? `Run: ${run.nome}` : 'Certificados sem Run'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {run ? (
                            <>
                              Template: {getTemplateName(run.templateId)} | 
                              CSV: {getCSVName(run.csvId)} | 
                              Status: <Badge className={getStatusColor(run.status)}>{getStatusText(run.status)}</Badge>
                            </>
                          ) : 'Certificados criados manualmente'}
                        </p>
                        {run && (
                          <p className="text-xs text-gray-500 mt-1">
                            Criado: {formatDate(run.criadoEm)} | 
                            {run.iniciadoEm && ` Iniciado: ${formatDate(run.iniciadoEm)}`}
                            {run.concluidoEm && ` Concluído: ${formatDate(run.concluidoEm)}`}
                          </p>
                        )}
                      </div>
                      
                      {run && run.status === "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadRunPDFs(run.id, certificados)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Todos ({certificados.length})
                        </Button>
                      )}
                    </div>

                    {/* Lista de Certificados da Run */}
                    <div className="space-y-3">
                      {certificados.map((certificado: any) => (
                        <Card key={certificado.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">
                                    {certificado.nome || getStudentName(certificado.dados, certificado.linhaIndex)}
                                  </h4>
                                  <Badge className={getStatusColor(certificado.status)}>
                                    {getStatusText(certificado.status)}
                                  </Badge>
                                  {certificado.emailEnviado && (
                                    <Badge className="bg-green-100 text-green-800">
                                      Email Enviado
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Template:</span>
                                    <p>{getTemplateName(certificado.templateId)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">CSV:</span>
                                    <p>{getCSVName(certificado.csvId)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Linha:</span>
                                    <p>{certificado.linhaIndex + 1}</p>
                                  </div>
                                </div>
                                
                                <div className="mt-2 text-xs text-gray-500">
                                  <span>Criado: {formatDate(certificado.criadoEm)}</span>
                                  {certificado.verificadoEm && (
                                    <span className="ml-4">Verificado: {formatDate(certificado.verificadoEm)}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/certificado/${certificado.id}`} target="_blank" rel="noopener noreferrer">
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
                                  onClick={() => handleDeleteCertificado(certificado.id)}
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
                                href={`/certificado/${certificado.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {`${window.location.origin}/certificado/${certificado.id}`}
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
