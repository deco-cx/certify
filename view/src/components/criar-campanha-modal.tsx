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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Send, Info, Code, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCriarCampanhaEmail, useBuscarRunsCompletasEmail } from "@/hooks/useEmails";

interface CriarCampanhaModalProps {
  turmaId: number;
  onClose: () => void;
}

export function CriarCampanhaModal({ turmaId, onClose }: CriarCampanhaModalProps) {
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState(`Olá @nome!

Parabéns! Seu certificado já está disponível.

Você pode acessá-lo através do link: @link_certificado

Atenciosamente,
Equipe`);
  const [templateHtml, setTemplateHtml] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Certificado</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Parabéns, @nome!</h1>
            <p>Seu certificado está pronto</p>
        </div>
        <div class="content">
            <p>Olá <strong>@nome</strong>,</p>
            <p>É com grande prazer que informamos que seu certificado já está disponível para download!</p>
            <p>Você pode acessá-lo clicando no botão abaixo:</p>
            <a href="@link_certificado" class="button">🏆 Ver Meu Certificado</a>
            <p>Parabéns pela conquista!</p>
        </div>
        <div class="footer">
            <p>Este email foi enviado para @email</p>
            <p>© 2024 Certify - Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>`);
  const [tipoTemplate, setTipoTemplate] = useState<"texto" | "html">("texto");
  const [runSelecionada, setRunSelecionada] = useState("");

  const { data: runsData, isLoading: loadingRuns } = useBuscarRunsCompletasEmail(turmaId);
  const criarCampanhaMutation = useCriarCampanhaEmail();

  const runs = runsData?.runs || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !assunto.trim() || !mensagem.trim() || !runSelecionada) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (tipoTemplate === "html" && !templateHtml.trim()) {
      toast.error("O template HTML é obrigatório quando o tipo HTML está selecionado");
      return;
    }

    try {
      const result = await criarCampanhaMutation.mutateAsync({
        turmaId,
        runId: parseInt(runSelecionada),
        nome: nome.trim(),
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        templateHtml: tipoTemplate === "html" ? templateHtml.trim() : undefined,
        tipoTemplate,
      });

      toast.success(result.message);
      onClose();
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha. Tente novamente.");
    }
  };

  const inserirPlaceholder = (placeholder: string, target: "mensagem" | "html" = "mensagem") => {
    const textareaName = target === "mensagem" ? 'textarea[name="mensagem"]' : 'textarea[name="templateHtml"]';
    const textarea = document.querySelector(textareaName) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      
      if (target === "mensagem") {
        setMensagem(newText);
      } else {
        setTemplateHtml(newText);
      }
      
      // Restaurar posição do cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const getPreviewHtml = () => {
    return templateHtml
      .replace(/@nome/g, "João Silva")
      .replace(/@email/g, "joao@exemplo.com")
      .replace(/@link_certificado/g, "https://deco.chat/deco-camp-certificados/exemplo-123");
  };

  const placeholders = [
    { label: "Nome do aluno", value: "@nome" },
    { label: "Email do aluno", value: "@email" },
    { label: "Link do certificado", value: "@link_certificado" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Criar Campanha de Email
              </CardTitle>
              <CardDescription>
                Configure uma nova campanha para enviar certificados por email
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção de Run */}
              <div className="space-y-2">
                <Label htmlFor="run">Run de Certificados</Label>
                {loadingRuns ? (
                  <div className="text-sm text-gray-500">Carregando runs...</div>
                ) : runs.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Nenhuma run completa encontrada. Gere certificados primeiro.
                  </div>
                ) : (
                  <Select value={runSelecionada} onValueChange={setRunSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma run" />
                    </SelectTrigger>
                    <SelectContent>
                      {runs.map((run) => (
                        <SelectItem key={run.id} value={run.id.toString()}>
                          {run.nome} ({run.certificadosGerados} certificados)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Nome da Campanha */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Campanha</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Envio Certificados - Janeiro 2024"
                  required
                />
              </div>
            </div>

            {/* Assunto */}
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto do Email</Label>
              <Input
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Ex: Seu certificado está pronto!"
                required
              />
              <div className="text-xs text-gray-500">
                Você pode usar @nome para incluir o nome do aluno no assunto
              </div>
            </div>

            {/* Tipo de Template */}
            <div className="space-y-2">
              <Label>Tipo de Template</Label>
              <Select value={tipoTemplate} onValueChange={(value: "texto" | "html") => setTipoTemplate(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Texto Simples
                    </div>
                  </SelectItem>
                  <SelectItem value="html">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2" />
                      Template HTML
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conteúdo do Template */}
            <div className="space-y-4">
              <Label>Conteúdo do Email</Label>
              
              {tipoTemplate === "texto" ? (
                // Template de Texto
                <div className="space-y-4">
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={8}
                    required
                  />
                  
                  {/* Placeholders para texto */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Variáveis disponíveis:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {placeholders.map((placeholder) => (
                        <Button
                          key={placeholder.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => inserirPlaceholder(placeholder.value, "mensagem")}
                          className="text-xs"
                        >
                          {placeholder.value}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Template HTML
                <Tabs defaultValue="codigo" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="codigo" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Código HTML
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="codigo" className="space-y-4">
                    <Textarea
                      id="templateHtml"
                      name="templateHtml"
                      value={templateHtml}
                      onChange={(e) => setTemplateHtml(e.target.value)}
                      placeholder="Digite seu código HTML..."
                      rows={12}
                      className="font-mono text-sm"
                      required={tipoTemplate === "html"}
                    />
                    
                    {/* Placeholders para HTML */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">
                        Variáveis disponíveis:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {placeholders.map((placeholder) => (
                          <Button
                            key={placeholder.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inserirPlaceholder(placeholder.value, "html")}
                            className="text-xs"
                          >
                            {placeholder.value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-sm text-gray-600 mb-2">Preview com dados de exemplo:</div>
                      <div 
                        className="bg-white border rounded p-4 max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Dicas:</p>
                    <ul className="space-y-1">
                      <li>• Use @nome para inserir o nome do aluno</li>
                      <li>• Use @email para inserir o email do aluno</li>
                      <li>• Use @link_certificado para o link direto do certificado</li>
                      <li>• Você também pode usar qualquer campo do CSV original (ex: @empresa, @curso)</li>
                      {tipoTemplate === "html" && (
                        <li>• Para templates HTML, use CSS inline ou tag &lt;style&gt; para melhor compatibilidade</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criarCampanhaMutation.isPending || runs.length === 0}
                className="flex-1"
              >
                {criarCampanhaMutation.isPending ? "Criando..." : "Criar Campanha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
