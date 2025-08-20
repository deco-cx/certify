import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, FileText, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UploadCSVProps {
  turmaId: number;
  onClose: () => void;
}

export function UploadCSV({ turmaId, onClose }: UploadCSVProps) {
  const [nome, setNome] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [colunas, setColunas] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Criar CSV
  const criarCSVMutation = useMutation({
    mutationFn: (
      data: { turmaId: number; nome: string; dados: string; colunas: string },
    ) => client.CRIAR_CSV(data),
    onSuccess: () => {
      toast.success("CSV criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["csvs", turmaId] });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao criar CSV:", error);
      toast.error("Erro ao criar CSV. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Nome do arquivo é obrigatório");
      return;
    }

    if (!csvContent.trim()) {
      toast.error("Conteúdo CSV é obrigatório");
      return;
    }

    if (colunas.length === 0) {
      toast.error("Nenhuma coluna válida detectada no CSV");
      return;
    }

    setIsUploading(true);

    try {
      await criarCSVMutation.mutateAsync({
        turmaId,
        nome: nome.trim(),
        dados: csvContent,
        colunas: colunas.join(", "),
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro no upload. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const processarCSV = (content: string) => {
    const linhas = content.trim().split("\n");
    if (linhas.length === 0) return;

    const primeiraLinha = linhas[0];
    const colunasDetectadas = primeiraLinha.split(",").map((col) =>
      col.trim().replace(/"/g, "")
    );

    setColunas(colunasDetectadas);

    // Mostrar preview das primeiras linhas
    // Preview das primeiras linhas para validação (não usado por enquanto)

    toast.success(
      `CSV processado! ${colunasDetectadas.length} colunas detectadas: ${
        colunasDetectadas.join(", ")
      }`,
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Por favor, selecione um arquivo CSV válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);

      // Auto-preencher nome se estiver vazio
      if (!nome.trim()) {
        setNome(file.name.replace(".csv", ""));
      }

      // Processar CSV automaticamente
      processarCSV(content);
    };
    reader.readAsText(file);
  };

  const handleCSVInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    setCsvContent(content);

    if (content.trim()) {
      processarCSV(content);
    } else {
      setColunas([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Upload de Arquivo CSV</CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV com os dados dos alunos
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de arquivo */}
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo CSV</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Selecione um arquivo CSV com dados dos alunos (nome, email,
                curso, etc.)
              </p>
            </div>

            {/* Nome do arquivo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Arquivo</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Alunos Turma A 2025"
                required
              />
            </div>

            {/* Input direto de CSV */}
            <div className="space-y-2">
              <Label htmlFor="csvContent">
                Ou cole o conteúdo CSV diretamente
              </Label>
              <Input
                id="csvContent"
                type="text"
                value={csvContent}
                onChange={handleCSVInput}
                placeholder="nome,email,curso&#10;João,joao@email.com,Matemática&#10;Maria,maria@email.com,Física"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Cole o conteúdo CSV aqui ou faça upload de um arquivo
              </p>
            </div>

            {/* Colunas detectadas */}
            {colunas.length > 0 && (
              <div className="space-y-2">
                <Label>Colunas Detectadas</Label>
                <div className="flex flex-wrap gap-2">
                  {colunas.map((coluna, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {coluna}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {colunas.length} coluna{colunas.length !== 1 ? "s" : ""}
                    {" "}
                    detectada{colunas.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Preview do CSV */}
            {csvContent && (
              <div className="space-y-2">
                <Label>Preview do CSV</Label>
                <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {csvContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-2">
                    Formato Recomendado do CSV:
                  </h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Primeira linha deve conter os nomes das colunas</li>
                    <li>• Use vírgulas para separar valores</li>
                    <li>
                      • Colunas comuns: nome, email, curso, data_conclusao
                    </li>
                    <li>• Evite caracteres especiais nos nomes das colunas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !nome.trim() || !csvContent.trim() ||
                  colunas.length === 0}
                className="min-w-[120px]"
              >
                {isUploading
                  ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2">
                      </div>
                      Criando...
                    </>
                  )
                  : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Criar CSV
                    </>
                  )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
