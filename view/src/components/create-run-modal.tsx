import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCriarRun } from "../hooks/useRuns";
import { useListarTemplates } from "../hooks/useTemplates";
import { useListarCSVs } from "../hooks/useCSVs";
import { X } from "lucide-react";

interface CreateRunModalProps {
  turmaId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRunModal(
  { turmaId, isOpen, onClose }: CreateRunModalProps,
) {
  const [nome, setNome] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [csvId, setCsvId] = useState<number | null>(null);
  const [nameColumn, setNameColumn] = useState<string | undefined>(undefined);
  const [emailColumn, setEmailColumn] = useState<string | undefined>(undefined);

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
    nameColumn,
    emailColumn,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !templateId || !csvId || !nameColumn || !emailColumn) {
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
        emailColumn,
      });

      // Reset form
      setNome("");
      setTemplateId(null);
      setCsvId(null);
      setNameColumn(undefined);
      setEmailColumn(undefined);
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
    setEmailColumn(undefined);
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
              <Label htmlFor="nome" className="mb-1">Nome do Run *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Geração Janeiro 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="template" className="mb-1">Template HTML *</Label>
              <Select
                value={templateId?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "no-templates") return;
                  setTemplateId(value ? parseInt(value) : null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templatesData?.templates &&
                      templatesData.templates.length > 0
                    ? (
                      templatesData.templates.map((template: any) => (
                        <SelectItem
                          key={template.id}
                          value={template.id.toString()}
                        >
                          {template.nome}
                        </SelectItem>
                      ))
                    )
                    : (
                      <SelectItem value="no-templates" disabled>
                        Nenhum template disponível
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="csv" className="mb-1">Arquivo CSV *</Label>
              <Select
                value={csvId?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "no-csvs") return;
                  setCsvId(value ? parseInt(value) : null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um arquivo CSV" />
                </SelectTrigger>
                <SelectContent>
                  {csvsData?.csvs && csvsData.csvs.length > 0
                    ? (
                      csvsData.csvs.map((csv: any) => (
                        <SelectItem key={csv.id} value={csv.id.toString()}>
                          {csv.nome}
                        </SelectItem>
                      ))
                    )
                    : (
                      <SelectItem value="no-csvs" disabled>
                        Nenhum CSV disponível
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nameColumn" className="mb-1">
                Coluna do Nome *
              </Label>
              <Select
                value={nameColumn || ""}
                onValueChange={(value) => {
                  if (
                    value === "no-columns" || value === "error-columns" ||
                    value === "select-csv-first"
                  ) return;
                  setNameColumn(value || undefined);
                }}
                disabled={!csvId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a coluna que contém os nomes" />
                </SelectTrigger>
                <SelectContent>
                  {csvId &&
                      csvsData?.csvs?.find((c: any) => c.id === csvId)?.colunas
                    ? (
                      (() => {
                        try {
                          // Parse colunas - pode ser JSON array ou string separada por vírgulas
                          const colunasRaw = csvsData.csvs.find((c: any) =>
                            c.id === csvId
                          )!.colunas;
                          
                          let colunas: string[];
                          try {
                            const colunasParsed = JSON.parse(colunasRaw);
                            if (Array.isArray(colunasParsed)) {
                              colunas = colunasParsed;
                            } else {
                              throw new Error("Colunas não é um array JSON válido");
                            }
                          } catch {
                            // Formato antigo: string separada por vírgulas
                            colunas = colunasRaw.split(",").map((col: string) =>
                              col.trim()
                            );
                          }
                          
                          if (colunas.length > 0) {
                            return colunas.map((coluna: string) => (
                              <SelectItem key={coluna} value={coluna}>
                                {coluna}
                              </SelectItem>
                            ));
                          } else {
                            return (
                              <SelectItem value="no-columns" disabled>
                                CSV não possui colunas válidas
                              </SelectItem>
                            );
                          }
                        } catch (error) {
                          console.error(
                            "Erro ao processar colunas do CSV:",
                            error,
                          );
                          return (
                            <SelectItem value="error-columns" disabled>
                              Erro ao processar colunas do CSV
                            </SelectItem>
                          );
                        }
                      })()
                    )
                    : (
                      <SelectItem value="select-csv-first" disabled>
                        Selecione um CSV primeiro
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="emailColumn" className="mb-1">
                Coluna do Email *
              </Label>
              <Select
                value={emailColumn || ""}
                onValueChange={(value) => {
                  if (
                    value === "no-columns-email" ||
                    value === "error-columns-email" ||
                    value === "select-csv-first-email"
                  ) return;
                  setEmailColumn(value || undefined);
                }}
                disabled={!csvId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a coluna que contém os emails" />
                </SelectTrigger>
                <SelectContent>
                  {csvId &&
                      csvsData?.csvs?.find((c: any) => c.id === csvId)?.colunas
                    ? (
                      (() => {
                        try {
                          // Parse colunas - pode ser JSON array ou string separada por vírgulas
                          const colunasRaw = csvsData.csvs.find((c: any) =>
                            c.id === csvId
                          )!.colunas;
                          
                          let colunas: string[];
                          try {
                            const colunasParsed = JSON.parse(colunasRaw);
                            if (Array.isArray(colunasParsed)) {
                              colunas = colunasParsed;
                            } else {
                              throw new Error("Colunas não é um array JSON válido");
                            }
                          } catch {
                            // Formato antigo: string separada por vírgulas
                            colunas = colunasRaw.split(",").map((col: string) =>
                              col.trim()
                            );
                          }
                          
                          if (colunas.length > 0) {
                            return colunas.map((coluna: string) => (
                              <SelectItem key={coluna} value={coluna}>
                                {coluna}
                              </SelectItem>
                            ));
                          } else {
                            return (
                              <SelectItem value="no-columns-email" disabled>
                                CSV não possui colunas válidas
                              </SelectItem>
                            );
                          }
                        } catch (error) {
                          console.error(
                            "Erro ao processar colunas do CSV:",
                            error,
                          );
                          return (
                            <SelectItem value="error-columns-email" disabled>
                              Erro ao processar colunas do CSV
                            </SelectItem>
                          );
                        }
                      })()
                    )
                    : (
                      <SelectItem value="select-csv-first-email" disabled>
                        Selecione um CSV primeiro
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criarRun.isPending || !nome || !templateId ||
                  !csvId || !nameColumn}
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
