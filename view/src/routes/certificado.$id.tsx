import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Share2, Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
  useBuscarCertificadoPorId,
  useGerarPdfCertificado,
  useGerarPngCertificado,
} from "@/hooks/useCertificados";

function CertificadoPage() {
  const { id } = useParams({ from: "/certificado/$id" });
  const navigate = useNavigate();
  const [iframeLoading, setIframeLoading] = useState(true);

  const { data: certificadoData, isLoading: isLoadingCertificado } =
    useBuscarCertificadoPorId(id);
  const gerarPdfMutation = useGerarPdfCertificado();
  const gerarPngMutation = useGerarPngCertificado();

  const certificado = certificadoData?.certificado;
  const htmlContent = certificado?.html;

  const handleDownloadPdf = async () => {
    if (!certificado) return;

    try {
      toast.info("Gerando PDF... Aguarde alguns segundos.");

      const result = await gerarPdfMutation.mutateAsync({ id: certificado.id });

      if (result.pdfUrl) {
        // Open the PDF URL in a new tab/window to download
        window.open(result.pdfUrl, "_blank");
        toast.success("PDF gerado com sucesso!");
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
        // Open the PNG URL in a new tab/window to download
        window.open(result.pngUrl, "_blank");
        toast.success("PNG gerado com sucesso!");
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificado - ${certificado?.nome}`,
        url: window.location.href,
      });
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  if (isLoadingCertificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto">
          </div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Carregando certificado...
          </p>
        </div>
      </div>
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
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                Certificado de {certificado.nome || `Aluno ${certificado.id}`}
              </h1>
              <p className="text-sm text-gray-600">
                Gerado em{" "}
                {new Date(certificado.criadoEm).toLocaleDateString("pt-BR")}
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

              <Button
                variant="outline"
                onClick={handleShare}
                className="flex flex-col items-center gap-1 py-3 px-2 h-auto"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-medium">Compartilhar</span>
              </Button>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:block">
            <div className="flex items-start justify-between">
              {/* Left side - Title and info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Certificado de {certificado.nome || `Aluno ${certificado.id}`}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerado em{" "}
                    {new Date(certificado.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                
                {/* Status badges */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Certificado Válido</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verificado pela Decofier</span>
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
                    {gerarPdfMutation.isPending ? "Gerando PDF..." : "Baixar PDF"}
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
                    {gerarPngMutation.isPending ? "Gerando PNG..." : "Baixar PNG"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 h-10 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Compartilhar</span>
                </Button>
              </div>
            </div>
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
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 animate-[fadeIn_0.3s_ease]">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2">
                          </div>
                          <p className="text-sm">Carregando certificado...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      id="certificate-iframe"
                      srcDoc={htmlContent}
                      className="w-full h-full border-none bg-white"
                      title={`Certificado de ${certificado.nome || "aluno"}`}
                      onLoad={handleIframeLoad}
                      style={{ display: iframeLoading ? "none" : "block" }}
                    />
                  </div>
                  {/* Indicador de carregamento e instruções */}
                  <div className="mt-4 p-3 bg-gray-100 rounded-md text-center text-sm text-gray-600 sm:text-xs sm:p-2">
                    <p>
                      📱 <strong>Dica:</strong>{" "}
                      Use o zoom do navegador para visualizar melhor o
                      certificado em dispositivos móveis
                    </p>
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
