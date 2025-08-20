import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, QrCode, ExternalLink, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { client } from "@/lib/rpc";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import "./certificado-mobile.css";

function CertificadoPage() {
  const { id } = useParams({ from: "/certificado/$id" });
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);

  const { data: certificadoData, isLoading: isLoadingCertificado } = useQuery({
    queryKey: ["certificado", id],
    queryFn: () => client.BUSCAR_CERTIFICADO_POR_ID({ id: parseInt(id) }),
    enabled: !!id,
  });

  const certificado = certificadoData?.certificado;

  useEffect(() => {
    if (certificado?.arquivoUrl) {
      fetch(certificado.arquivoUrl)
        .then(res => res.text())
        .then(html => {
          setHtmlContent(html);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Erro ao carregar certificado:", error);
          setIsLoading(false);
        });
    } else if (certificado && !isLoadingCertificado) {
      setIsLoading(false);
    }
  }, [certificado?.arquivoUrl, certificado, isLoadingCertificado]);

  const handleDownloadHtml = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${certificado?.nome || "aluno"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      console.log('Iniciando geração de PDF client-side...');
      
      // Debug: verificar se o iframe existe
      const iframe = document.querySelector('#certificate-iframe') as HTMLIFrameElement;
      console.log('Iframe encontrado:', iframe);
      
      if (!iframe) {
        toast.error('Iframe não encontrado. Aguarde o carregamento.');
        return;
      }

      if (!iframe.contentDocument) {
        toast.error('Conteúdo do iframe não acessível. Aguarde o carregamento.');
        return;
      }

      console.log('Iframe document:', iframe.contentDocument);
      console.log('Iframe body:', iframe.contentDocument.body);

      // Versão simples: baixar apenas o HTML primeiro
      const htmlContent = iframe.contentDocument.documentElement.outerHTML;
      
      if (!htmlContent) {
        toast.error('Conteúdo HTML não encontrado.');
        return;
      }

      // Por enquanto, baixar como HTML para verificar se funciona
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${certificado?.nome || 'aluno'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('HTML baixado com sucesso! (Teste)');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(`Erro ao gerar PDF: ${error.message}`);
    }
  };

  const handleDownloadPng = async () => {
    try {
      console.log('Teste PNG - ainda não implementado');
      toast.info('Função PNG em teste. Use o botão PDF por enquanto.');
    } catch (error) {
      console.error('Erro ao gerar PNG:', error);
      toast.error('Erro ao gerar PNG. Tente novamente.');
    }
  };

  const handleDownloadJpg = async () => {
    try {
      console.log('Teste JPG - ainda não implementado');
      toast.info('Função JPG em teste. Use o botão PDF por enquanto.');
    } catch (error) {
      console.error('Erro ao gerar JPG:', error);
      toast.error('Erro ao gerar JPG. Tente novamente.');
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

  if (isLoading || isLoadingCertificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (!certificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Certificado não encontrado</h1>
          <Button onClick={() => navigate({ to: "/" })}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Seção esquerda - Informações */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/" })}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Certificado de {certificado.nome || `Aluno ${certificado.id}`}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Gerado em {new Date(certificado.criadoEm).toLocaleDateString('pt-BR')}
                </p>
                {/* Selos de Certificado Válido */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <Shield className="h-3 w-3" />
                    <span className="hidden sm:inline">Certificado Válido</span>
                    <span className="sm:hidden">Válido</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Verificado pela Decofier</span>
                    <span className="sm:hidden">Verificado</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção direita - Botões de ação */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:space-x-2">
              {/* Botões de Download */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadPng}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">PNG</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadJpg}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-8 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">JPG</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-8"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">HTML</span>
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden">Compartilhar</span>
              </Button>
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
              <span className="hidden sm:inline">Verificação Oficial do Certificado</span>
              <span className="sm:hidden">Verificação do Certificado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Informações de Debug */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
              <h4 className="font-semibold mb-2">Informações de Debug:</h4>
              <div className="space-y-1">
                <p><strong>ID:</strong> {certificado.id}</p>
                <p><strong>Status:</strong> {certificado.status || 'N/A'}</p>
                <p><strong>Arquivo URL:</strong> {certificado.arquivoUrl ? '✅ Configurado' : '❌ Não configurado'}</p>                                                                                                 
                <p><strong>HTML Content:</strong> {htmlContent ? `✅ Carregado (${htmlContent.length} chars)` : '❌ Não carregado'}</p>                                                                                 
                <p><strong>URL de Verificação:</strong> {`${window.location.origin}/certificado/${certificado.id}`}</p>                                                                                      
              </div>
            </div>

            {htmlContent ? (
              <div className="certificado-container">
                {/* Container responsivo para o iframe */}
                <div className="certificado-wrapper">
                  {iframeLoading && (
                    <div className="certificado-loading">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Carregando certificado...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    id="certificate-iframe"
                    srcDoc={htmlContent}
                    className="certificado-iframe"
                    title={`Certificado de ${certificado.nome || 'aluno'}`}
                    onLoad={handleIframeLoad}
                    style={{ display: iframeLoading ? 'none' : 'block' }}
                  />
                </div>
                {/* Indicador de carregamento e instruções */}
                <div className="certificado-tips">
                  <p>
                    📱 <strong>Dica:</strong> Use o zoom do navegador para visualizar melhor o certificado em dispositivos móveis
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600 text-sm sm:text-base">Certificado não disponível</p>
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
