import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UploadTemplateProps {
  turmaId: number;
  onClose: () => void;
}

export function UploadTemplate({ turmaId, onClose }: UploadTemplateProps) {
  const [nome, setNome] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Criar template
  const criarTemplateMutation = useMutation({
    mutationFn: (
      data: { turmaId: number; nome: string; html: string; campos?: string },
    ) => client.CRIAR_TEMPLATE(data),
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["templates", turmaId] });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao criar template:", error);
      toast.error("Erro ao criar template. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    if (!htmlContent.trim()) {
      toast.error("Conteúdo HTML é obrigatório");
      return;
    }

    setIsUploading(true);

    try {
      // Extrair campos do HTML (placeholders como {{nome}}, {{email}}, etc.)
      const campos = extrairCamposHTML(htmlContent);

      await criarTemplateMutation.mutateAsync({
        turmaId,
        nome: nome.trim(),
        html: htmlContent,
        campos: campos.join(", "),
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro no upload. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const extrairCamposHTML = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const campos: string[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (!campos.includes(match[1])) {
        campos.push(match[1]);
      }
    }

    return campos;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/html" && !file.name.endsWith(".html")) {
      toast.error("Por favor, selecione um arquivo HTML válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);

      // Auto-preencher nome se estiver vazio
      if (!nome.trim()) {
        setNome(file.name.replace(".html", ""));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Upload de Template HTML</CardTitle>
            <CardDescription>
              Faça upload de um arquivo HTML para criar um template de
              certificado
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
              <Label htmlFor="file">Arquivo HTML</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file"
                  type="file"
                  accept=".html,text/html"
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
                Selecione um arquivo HTML com placeholders como {"{{nome}}"},
                {" "}
                {"{{email}}"}, etc.
              </p>
            </div>

            {/* Nome do template */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Template</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Certificado Padrão 2025"
                required
              />
            </div>

            {/* Preview do HTML */}
            {htmlContent && (
              <div className="space-y-2">
                <Label>Preview do HTML</Label>
                <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {htmlContent}
                  </pre>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Campos detectados:{" "}
                    {extrairCamposHTML(htmlContent).join(", ") || "Nenhum"}
                  </span>
                </div>
              </div>
            )}

            {/* Editor de HTML (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="htmlContent">Editar HTML (opcional)</Label>
              <Textarea
                id="htmlContent"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Cole ou edite o HTML aqui..."
                rows={8}
                className="font-mono text-sm"
              />
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
                disabled={isUploading || !nome.trim() || !htmlContent.trim()}
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
                      Criar Template
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
