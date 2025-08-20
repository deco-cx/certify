import {
  createRoute,
  type RootRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import LoggedProvider from "@/components/logged-provider";

function NovaTurmaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  // Criar turma
  const criarTurmaMutation = useMutation({
    mutationFn: (data: { nome: string; descricao?: string }) =>
      client.CRIAR_TURMA(data),
    onSuccess: () => {
      toast.success("Turma criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["turmas"] });
      navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Erro ao criar turma:", error);
      toast.error("Erro ao criar turma. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Nome da turma é obrigatório");
      return;
    }

    criarTurmaMutation.mutate({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
    });
  };

  const handleBack = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Nova Turma</h1>
              <p className="text-sm text-gray-600">
                Crie uma nova turma para organizar seus projetos de certificados
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Turma</CardTitle>
            <CardDescription>
              Preencha as informações básicas para criar uma nova turma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Turma */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome da Turma *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Turma AEL1 - Agosto 2025"
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500">
                  Nome que identificará esta turma no sistema
                </p>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição opcional da turma, curso ou projeto..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Adicione informações adicionais sobre esta turma
                </p>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={criarTurmaMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={criarTurmaMutation.isPending || !nome.trim()}
                  className="min-w-[120px]"
                >
                  {criarTurmaMutation.isPending
                    ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2">
                        </div>
                        Criando...
                      </>
                    )
                    : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Criar Turma
                      </>
                    )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
            <CardDescription>
              Após criar a turma, você poderá:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Upload de Template HTML
                  </h4>
                  <p className="text-sm text-gray-600">
                    Faça upload de um arquivo HTML com placeholders para os
                    certificados
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Upload de CSV</h4>
                  <p className="text-sm text-gray-600">
                    Carregue um arquivo CSV com os dados dos alunos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Geração em Lote</h4>
                  <p className="text-sm text-gray-600">
                    Execute a geração automática de certificados para todos os
                    alunos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function NovaTurmaWithAuth() {
  return (
    <LoggedProvider>
      <NovaTurmaPage />
    </LoggedProvider>
  )
}

// Export function that creates the route
export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/nova-turma",
    component: NovaTurmaWithAuth,
    getParentRoute: () => parentRoute,
  });
