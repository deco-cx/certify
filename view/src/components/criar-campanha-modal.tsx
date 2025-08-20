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
import { X, Send, Info } from "lucide-react";
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

    try {
      const result = await criarCampanhaMutation.mutateAsync({
        turmaId,
        runId: parseInt(runSelecionada),
        nome: nome.trim(),
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
      });

      toast.success(result.message);
      onClose();
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha. Tente novamente.");
    }
  };

  const inserirPlaceholder = (placeholder: string) => {
    const textarea = document.querySelector('textarea[name="mensagem"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setMensagem(newText);
      
      // Restaurar posição do cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const placeholders = [
    { label: "Nome do aluno", value: "@nome" },
    { label: "Email do aluno", value: "@email" },
    { label: "Link do certificado", value: "@link_certificado" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
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

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={8}
                required
              />
              
              {/* Placeholders */}
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
                      onClick={() => inserirPlaceholder(placeholder.value)}
                      className="text-xs"
                    >
                      {placeholder.value}
                    </Button>
                  ))}
                </div>
              </div>
              
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
