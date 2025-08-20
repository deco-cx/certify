import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCriarRun } from "../hooks/useRuns";
import { useListarTemplates } from "../hooks/useTemplates";
import { useListarCSVs } from "../hooks/useCSVs";
import { X } from "lucide-react";

interface CreateRunModalProps {
  turmaId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRunModal({ turmaId, isOpen, onClose }: CreateRunModalProps) {
  const [nome, setNome] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [csvId, setCsvId] = useState<number | null>(null);
  const [nameColumn, setNameColumn] = useState<string | undefined>(undefined);

  const { data: templatesData } = useListarTemplates(turmaId);
  const { data: csvsData } = useListarCSVs(turmaId);
  const criarRun = useCriarRun();

  // Debug logs
  console.log("CreateRunModal render:", {
    isOpen,
    turmaId,
    templatesData,
    csvsData,
    templateId,
    csvId,
    nameColumn
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !templateId || !csvId || !nameColumn) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      await criarRun.mutateAsync({
        turmaId,
        nome,
        templateId,
        csvId,
        nameColumn,
      });
      
      // Reset form
      setNome("");
      setTemplateId(null);
      setCsvId(null);
      setNameColumn(undefined);
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Erro ao criar run:", error);
      alert("Erro ao criar run");
    }
  };

  const handleClose = () => {
    // Reset form
    setNome("");
    setTemplateId(null);
    setCsvId(null);
    setNameColumn(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Novo Run de Certificados</CardTitle>
              <CardDescription>
                Configure um novo processo de geração de certificados
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Run *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Geração Janeiro 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="template">Template HTML *</Label>
              <select
                id="template"
                value={templateId?.toString() || ""}
                onChange={(e) => setTemplateId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um template</option>
                {templatesData?.templates && templatesData.templates.length > 0 ? (
                  templatesData.templates.map((template: any) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.nome}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum template disponível</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="csv">Arquivo CSV *</Label>
              <select
                id="csv"
                value={csvId?.toString() || ""}
                onChange={(e) => setCsvId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um arquivo CSV</option>
                {csvsData?.csvs && csvsData.csvs.length > 0 ? (
                  csvsData.csvs.map((csv: any) => (
                    <option key={csv.id} value={csv.id.toString()}>
                      {csv.nome}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum CSV disponível</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="nameColumn">Coluna do Nome *</Label>
              <select
                id="nameColumn"
                value={nameColumn || ""}
                onChange={(e) => setNameColumn(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!csvId}
              >
                <option value="">Selecione a coluna que contém os nomes</option>
                                  {csvId && csvsData?.csvs?.find((c: any) => c.id === csvId)?.colunas ? (
                  (() => {
                    try {
                      // As colunas são salvas como string separada por vírgulas, não JSON
                      const colunas = csvsData.csvs.find((c: any) => c.id === csvId)!.colunas.split(',').map((col: string) => col.trim());
                      if (colunas.length > 0) {
                        return colunas.map((coluna: string) => (
                          <option key={coluna} value={coluna}>
                            {coluna}
                          </option>
                        ));
                      } else {
                        return <option value="" disabled>CSV não possui colunas válidas</option>;
                      }
                    } catch (error) {
                      console.error('Erro ao processar colunas do CSV:', error);
                      return <option value="" disabled>Erro ao processar colunas do CSV</option>;
                    }
                  })()
                ) : (
                  <option value="" disabled>Selecione um CSV primeiro</option>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={criarRun.isPending || !nome || !templateId || !csvId || !nameColumn}
              >
                {criarRun.isPending ? "Criando..." : "Criar Run"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
