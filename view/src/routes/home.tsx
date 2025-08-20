import {
  createRoute,
  type RootRoute,
  useNavigate,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Eye, FileText, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import LoggedProvider from "@/components/logged-provider";

interface Turma {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

function HomePage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // Buscar todas as turmas
  const { data: turmasData, isLoading } = useQuery({
    queryKey: ["turmas"],
    queryFn: () => client.LISTAR_TURMAS({}),
  });

  const turmas = turmasData?.turmas || [];

  // Deletar turma
  const deletarTurmaMutation = useMutation({
    mutationFn: (id: number) => client.DELETAR_TURMA({ id }),
    onSuccess: () => {
      toast.success("Turma excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["turmas"] });
    },
    onError: (error) => {
      console.error("Erro ao excluir turma:", error);
      toast.error("Erro ao excluir turma. Tente novamente.");
    },
  });

  const handleExcluirTurma = async (turmaId: number) => {
    deletarTurmaMutation.mutate(turmaId);
  };

  const formatarData = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Decofier</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da seção */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Minhas Turmas
            </h2>
            <p className="text-gray-600 text-lg">
              Gerencie suas turmas e projetos de certificados
            </p>
          </div>
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate({ to: "/nova-turma" })}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Turma
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total de Turmas
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {turmas.length}
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Templates Ativos
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {turmas.filter((t: Turma) => {
                      const criadoEm = new Date(t.criadoEm);
                      const trintaDiasAtras = new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000,
                      );
                      return criadoEm > trintaDiasAtras;
                    }).length}
                  </p>
                </div>
                <FileText className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Última Atividade
                  </p>
                  <p className="text-lg font-semibold text-purple-900">
                    {turmas.length > 0
                      ? formatarData(
                        Math.max(
                          ...turmas.map((t: Turma) =>
                            new Date(t.atualizadoEm).getTime()
                          ),
                        ).toString(),
                      )
                      : "N/A"}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Turmas */}
        {turmas.length > 0
          ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((turma: Turma) => (
                <Card
                  key={turma.id}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {turma.nome}
                        </CardTitle>
                        {turma.descricao && (
                          <CardDescription className="text-sm text-gray-600 line-clamp-2">
                            {turma.descricao}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Informações da turma */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Criada em {formatarData(turma.criadoEm)}
                      </div>
                      {turma.descricao && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                          {turma.descricao}
                        </div>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate({
                            to: "/turma/$id",
                            params: { id: turma.id.toString() },
                          })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Turma</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a turma "{turma
                                .nome}"? Esta ação não pode ser desfeita e
                              removerá todos os dados associados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluirTurma(turma.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          : (
            /* Estado vazio */
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma turma criada ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando sua primeira turma para organizar seus projetos
                  de certificados
                </p>
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => navigate({ to: "/nova-turma" })}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Turma
                </Button>
              </CardContent>
            </Card>
          )}
      </main>
    </div>
  );
}

function HomeWithAuth() {
  return (
    <LoggedProvider>
      <HomePage />
    </LoggedProvider>
  );
}

// Export function that creates the route
export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/",
    component: HomeWithAuth,
    getParentRoute: () => parentRoute,
  });
