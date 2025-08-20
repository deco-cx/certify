import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Download,
  ExternalLink,
  Shield,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
  useBuscarCertificadoPorId,
  useGerarPdfCertificado,
  useGerarPngCertificado,
} from "@/hooks/useCertificados";
import { useBuscarRunPorId } from "@/hooks/useRuns";
import { LinkedInButton } from "@/components/linkedin-button";
import { UnicornLoading } from "@/components/unicorn-loading";

function CertificadoPage() {
  const { id } = useParams({ from: "/certificado/$id" });
  const navigate = useNavigate();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);

  const { data: certificadoData, isLoading: isLoadingCertificado } =
    useBuscarCertificadoPorId(id);
  const gerarPdfMutation = useGerarPdfCertificado();
  const gerarPngMutation = useGerarPngCertificado();

  const certificado = certificadoData?.certificado;
  const htmlContent = certificado?.html;

  // Buscar dados da run para o título do certificado
  const { data: runData } = useBuscarRunPorId(certificado?.runId || null);

  const handleDownloadPdf = async () => {
    if (!certificado) return;

    try {
      toast.info("Gerando PDF... Aguarde alguns segundos.");

      const result = await gerarPdfMutation.mutateAsync({ id: certificado.id });

      if (result.pdfUrl) {
        // Store the URL for fallback
        setPdfUrl(result.pdfUrl);

        // Try to open the PDF URL in a new tab/window
        const opened = window.open(result.pdfUrl, "_blank");

        if (opened) {
          toast.success("PDF gerado com sucesso!");
        } else {
          // If window.open failed (blocked by popup blocker)
          toast.success(
            "PDF gerado! Use o link abaixo se não abriu automaticamente.",
          );
        }
      } else {
        throw new Error("URL do PDF não foi retornada");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(
        `Erro ao gerar PDF: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      );
    }
  };

  const handleDownloadPng = async () => {
    if (!certificado) return;

    try {
      toast.info("Gerando PNG... Aguarde alguns segundos.");

      const result = await gerarPngMutation.mutateAsync({ id: certificado.id });

      if (result.pngUrl) {
        // Store the URL for fallback
        setPngUrl(result.pngUrl);

        // Try to open the PNG URL in a new tab/window
        const opened = window.open(result.pngUrl, "_blank");

        if (opened) {
          toast.success("PNG gerado com sucesso!");
        } else {
          // If window.open failed (blocked by popup blocker)
          toast.success(
            "PNG gerado! Use o link abaixo se não abriu automaticamente.",
          );
        }
      } else {
        throw new Error("URL do PNG não foi retornada");
      }
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
      toast.error(
        `Erro ao gerar PNG: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      );
    }
  };

  // Função para preparar dados para o LinkedIn
  const getLinkedInData = () => {
    if (!certificado) return null;

    const currentDate = new Date(certificado.criadoEm);
    // Usa dados da run se disponível, senão usa valores padrão
    const certificateName = runData?.run?.nome || "Certificado";
    const organizationName = "deco"; // Nome da organização para o LinkedIn

    return {
      organizationName,
      certificateName,
      issueYear: currentDate.getFullYear(),
      issueMonth: currentDate.getMonth() + 1, // LinkedIn usa 1-12
      certId: certificado.id,
      certUrl: window.location.href,
    };
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  if (isLoadingCertificado) {
    return (
      <UnicornLoading 
        message="Carregando certificado..." 
        fullScreen={true}
      />
    );
  }

  if (!certificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Certificado não encontrado
          </h1>
          <Button onClick={() => navigate({ to: "/" })}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          {/* Mobile layout */}
          <div className="space-y-4 sm:hidden">
            {/* Title and info section */}
            <div className="space-y-2">
              {runData?.run?.nome ? (
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                  {runData.run.nome}
                </h1>
              ) : (
                <div className="h-6 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
              )}
              <p className="text-sm text-gray-600">
                Certificado de {certificado.nome || `Aluno ${certificado.id}`}
              </p>
              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  <span>Certificado Válido</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verificado</span>
                </div>
              </div>
            </div>

            {/* Action buttons - Full width on mobile */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={gerarPdfMutation.isPending}
                className="flex flex-col items-center gap-1 py-3 px-2 h-auto bg-red-50 border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {gerarPdfMutation.isPending ? "Gerando..." : "PDF"}
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadPng}
                disabled={gerarPngMutation.isPending}
                className="flex flex-col items-center gap-1 py-3 px-2 h-auto bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {gerarPngMutation.isPending ? "Gerando..." : "PNG"}
                </span>
              </Button>

              {getLinkedInData() && (
                <LinkedInButton
                  {...getLinkedInData()!}
                  className="flex flex-col items-center gap-1 py-3 px-2 h-auto w-full"
                />
              )}
            </div>

            {/* Fallback download links - Mobile */}
            {(pdfUrl || pngUrl) && (
              <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">
                  Links diretos para download:
                </p>
                <div className="space-y-1">
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900 underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Baixar PDF
                    </a>
                  )}
                  {pngUrl && (
                    <a
                      href={pngUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900 underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Baixar PNG
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:block">
            <div className="flex items-start justify-between">
              {/* Left side - Title and info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  {runData?.run?.nome ? (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {runData.run.nome}
                    </h1>
                  ) : (
                    <div className="h-8 bg-gray-200 rounded-md animate-pulse w-2/3"></div>
                  )}
                  <p className="text-sm text-gray-600">
                    Certificado de {certificado.nome || `Aluno ${certificado.id}`}
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Certificado Válido
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Verificado pela Decofier
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-3 ml-6">
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  disabled={gerarPdfMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 h-10 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 disabled:opacity-50 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span className="font-medium">
                    {gerarPdfMutation.isPending
                      ? "Gerando PDF..."
                      : "Baixar PDF"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadPng}
                  disabled={gerarPngMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 h-10 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span className="font-medium">
                    {gerarPngMutation.isPending
                      ? "Gerando PNG..."
                      : "Baixar PNG"}
                  </span>
                </Button>

                {getLinkedInData() && (
                  <LinkedInButton
                    {...getLinkedInData()!}
                    variant="desktop"
                    className="flex items-center gap-2 px-4 py-2 h-10 border-0"
                  />
                )}
              </div>
            </div>

            {/* Fallback download links - Desktop */}
            {(pdfUrl || pngUrl) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Links diretos para download:
                </p>
                <div className="flex items-center gap-4">
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 underline transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Baixar PDF
                    </a>
                  )}
                  {pngUrl && (
                    <a
                      href={pngUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 underline transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Baixar PNG
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="hidden sm:inline">
                Verificação Oficial do Certificado
              </span>
              <span className="sm:hidden">Verificação do Certificado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {htmlContent
              ? (
                <div className="w-full max-w-full mx-auto">
                  {/* Container responsivo para o iframe */}
                  <div className="relative w-full h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:shadow-black/10">
                    {iframeLoading && (
                      <div className="absolute inset-0 z-10">
                        <UnicornLoading 
                          message="Carregando certificado..." 
                          fullScreen={false}
                        />
                      </div>
                    )}
                    <iframe
                      id="certificate-iframe"
                      srcDoc={htmlContent}
                      className="w-full h-full border-none bg-white"
                      title={runData?.run?.nome || "Certificado"}
                      onLoad={handleIframeLoad}
                      style={{ display: iframeLoading ? "none" : "block" }}
                    />
                  </div>
                </div>
              )
              : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Certificado não disponível
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Export function that creates the route
export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/certificado/$id",
    component: CertificadoPage,
    getParentRoute: () => parentRoute,
  });
