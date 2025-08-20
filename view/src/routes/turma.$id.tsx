import { createRoute, type RootRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Upload, Users, Play, Mail, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { UploadTemplate } from "@/components/upload-template";
import { UploadCSV } from "@/components/upload-csv";
import { ViewTemplate } from "@/components/view-template";
import { RunsList } from "@/components/runs-list";
import { CertificadosList } from "@/components/certificados-list";

function TurmaDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/turma/$id" });
  const [showUploadTemplate, setShowUploadTemplate] = useState(false);
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Buscar dados da turma
  const { data: turmaData, isLoading } = useQuery({
    queryKey: ["turma", id],
    queryFn: () => client.BUSCAR_TURMA_POR_ID({ id: parseInt(id) }),
  });

  const turma = turmaData?.turma;

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const formatarData = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Turma não encontrada</h2>
          <p className="text-gray-600 mb-4">A turma solicitada não foi encontrada.</p>
          <Button onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{turma.nome}</h1>
                <p className="text-sm text-gray-600">
                  {turma.descricao || "Gerenciar projetos de certificados"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações da Turma */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-lg text-gray-900">{turma.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Criada em</p>
                  <p className="text-lg text-gray-900">{formatarData(turma.criadoEm)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última atualização</p>
                  <p className="text-lg text-gray-900">{formatarData(turma.atualizadoEm)}</p>
                </div>
                {turma.descricao && (
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p className="text-gray-900">{turma.descricao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Funcionalidades */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="csvs">Dados CSV</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>

          {/* Tab Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Templates HTML
                </CardTitle>
                <CardDescription>
                  Gerencie os templates HTML para geração de certificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesList 
                  turmaId={turma.id} 
                  onShowUpload={() => setShowUploadTemplate(true)}
                  onViewTemplate={(template) => {
                    setSelectedTemplate(template);
                    setShowViewTemplate(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab CSVs */}
          <TabsContent value="csvs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Dados CSV
                </CardTitle>
                <CardDescription>
                  Gerencie os arquivos CSV com dados dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CSVsList 
                  turmaId={turma.id} 
                  onShowUpload={() => setShowUploadCSV(true)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Runs */}
          <TabsContent value="runs">
            <RunsList turmaId={turma.id} />
          </TabsContent>

          {/* Tab Certificados */}
          <TabsContent value="certificados">
            <CertificadosList turmaId={turma.id} />
          </TabsContent>

          {/* Tab Emails */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Campanhas de Email
                </CardTitle>
                <CardDescription>
                  Configure e envie emails com os certificados gerados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma campanha de email criada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Primeiro, gere os certificados para então enviar por email
                  </p>
                  <Button 
                    disabled 
                    onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Criar Campanha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Upload de Template */}
      {showUploadTemplate && (
        <UploadTemplate 
          turmaId={turma.id} 
          onClose={() => setShowUploadTemplate(false)} 
        />
      )}

      {/* Modal de Upload de CSV */}
      {showUploadCSV && (
        <UploadCSV 
          turmaId={turma.id} 
          onClose={() => setShowUploadCSV(false)} 
        />
      )}

      {/* Modal de Visualização de Template */}
      {showViewTemplate && selectedTemplate && (
        <ViewTemplate 
          template={selectedTemplate}
          onClose={() => {
            setShowViewTemplate(false);
            setSelectedTemplate(null);
          }} 
        />
      )}
    </div>
  );
}

// Componente para listar templates
function TemplatesList({ turmaId, onShowUpload, onViewTemplate }: { 
  turmaId: number; 
  onShowUpload: () => void;
  onViewTemplate: (template: any) => void;
}) {
  const queryClient = useQueryClient();

  // Buscar templates da turma
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["templates", turmaId],
    queryFn: () => client.LISTAR_TEMPLATES({ turmaId }),
  });

  // Deletar template
  const deletarTemplateMutation = useMutation({
    mutationFn: (id: number) => client.DELETAR_TEMPLATE({ id }),
    onSuccess: () => {
      toast.success("Template excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["templates", turmaId] });
    },
    onError: (error) => {
      console.error("Erro ao excluir template:", error);
      toast.error("Erro ao excluir template. Tente novamente.");
    },
  });

  const templates = templatesData?.templates || [];

  const formatarData = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum template enviado ainda
        </h3>
        <p className="text-gray-600 mb-6">
          Faça upload de um arquivo HTML com placeholders para começar
        </p>
        <Button onClick={onShowUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload de Template
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium">Templates Disponíveis</h4>
        <Button onClick={onShowUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template: any) => (
          <Card key={template.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{template.nome}</h5>
                <p className="text-sm text-gray-500">
                  Criado em {formatarData(template.criadoEm)}
                </p>
                {template.campos && (
                  <p className="text-xs text-gray-400 mt-1">
                    Campos: {template.campos}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewTemplate(template)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletarTemplateMutation.mutate(template.id)}
                  disabled={deletarTemplateMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Componente para listar CSVs
function CSVsList({ turmaId, onShowUpload }: { turmaId: number; onShowUpload: () => void }) {
  const queryClient = useQueryClient();

  // Buscar CSVs da turma
  const { data: csvsData, isLoading } = useQuery({
    queryKey: ["csvs", turmaId],
    queryFn: () => client.LISTAR_CSVS({ turmaId }),
  });

  // Deletar CSV
  const deletarCSVMutation = useMutation({
    mutationFn: (id: number) => client.DELETAR_CSV({ id }),
    onSuccess: () => {
      toast.success("CSV excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["csvs", turmaId] });
    },
    onError: (error) => {
      console.error("Erro ao excluir CSV:", error);
      toast.error("Erro ao excluir CSV. Tente novamente.");
    },
  });

  const csvs = csvsData?.csvs || [];

  const formatarData = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando CSVs...</p>
      </div>
    );
  }

  if (csvs.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum arquivo CSV enviado ainda
        </h3>
        <p className="text-gray-600 mb-6">
          Faça upload de um arquivo CSV com os dados dos alunos
        </p>
        <Button onClick={onShowUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload de CSV
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium">Arquivos CSV Disponíveis</h4>
        <Button onClick={onShowUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Novo CSV
        </Button>
      </div>

      <div className="grid gap-4">
        {csvs.map((csv: any) => (
          <Card key={csv.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{csv.nome}</h5>
                <p className="text-sm text-gray-500">
                  Criado em {formatarData(csv.criadoEm)}
                </p>
                {csv.processadoEm && (
                  <p className="text-xs text-green-600 mt-1">
                    Processado em {formatarData(csv.processadoEm)}
                  </p>
                )}
                {csv.colunas && (
                  <p className="text-xs text-gray-400 mt-1">
                    Colunas: {csv.colunas}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletarCSVMutation.mutate(csv.id)}
                  disabled={deletarCSVMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Export function that creates the route
export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/turma/$id",
    component: TurmaDetalhesPage,
    getParentRoute: () => parentRoute,
  });
