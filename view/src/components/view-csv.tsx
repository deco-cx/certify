import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Copy, Eye, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ViewCSVProps {
  csv: {
    id: number;
    turmaId: number;
    templateId: number | null;
    nome: string;
    dados: string; // JSON string com os dados
    colunas: string; // JSON string com as colunas
    criadoEm: string;
    processadoEm?: string | null;
  };
  onClose: () => void;
}

export function ViewCSV({ csv, onClose }: ViewCSVProps) {
  const [copied, setCopied] = useState(false);

  // Parsear dados do CSV
  const parseCSVData = () => {
    try {
      // Verificar se os dados existem
      if (!csv.dados || !csv.colunas) {
        console.error("Dados ou colunas estão vazios");
        return { dados: [], colunas: [] };
      }

      // Tentar primeiro o formato novo (JSON)
      try {
        const dados = JSON.parse(csv.dados);
        const colunas = JSON.parse(csv.colunas);
        
        // Validar estrutura dos dados
        if (Array.isArray(dados) && Array.isArray(colunas)) {
          console.log("Formato JSON detectado e parseado com sucesso");
          return { dados, colunas };
        }
      } catch (error) {
        console.log("Formato JSON não detectado, tentando formato antigo...");
      }

      // Tentar formato antigo (string CSV)
      try {
        console.log("Tentando parsear formato antigo (CSV string)...");
        
        // Parsear colunas (pode ser string simples ou JSON)
        let colunasArray: string[];
        try {
          colunasArray = JSON.parse(csv.colunas);
        } catch {
          // Se não for JSON, tentar como string separada por vírgulas
          colunasArray = csv.colunas.split(",").map(col => col.trim());
        }

        // Parsear dados CSV
        const linhas = csv.dados.trim().split("\n");
        const dadosArray = [];
        
        // Pular a primeira linha se for cabeçalho
        const startIndex = linhas[0].includes(colunasArray[0]) ? 1 : 0;
        
        for (let i = startIndex; i < linhas.length; i++) {
          const linha = linhas[i].trim();
          if (linha) {
            const valores = linha.split(",").map(val => val.trim().replace(/"/g, ""));
            const registro: any = {};
            
            colunasArray.forEach((coluna, index) => {
              registro[coluna] = valores[index] || "";
            });
            
            dadosArray.push(registro);
          }
        }

        console.log("Formato antigo parseado com sucesso:", {
          dados: dadosArray.length,
          colunas: colunasArray.length
        });

        return { dados: dadosArray, colunas: colunasArray };
      } catch (error) {
        console.error("Erro ao parsear formato antigo:", error);
        return { dados: [], colunas: [] };
      }
    } catch (error) {
      console.error("Erro geral ao parsear dados do CSV:", error);
      return { dados: [], colunas: [] };
    }
  };

  const { dados, colunas } = parseCSVData();

  // Verificar se há dados válidos
  if (dados.length === 0 || colunas.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Eye className="h-5 w-5" />
              Erro ao Carregar CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">
                Não foi possível carregar os dados do CSV
              </h4>
              <p className="text-red-700 text-sm mb-3">
                Este arquivo foi criado com um formato antigo que não é mais compatível.
                Para resolver, você deve:
              </p>
              <ul className="text-red-700 text-sm space-y-1 mb-3">
                <li>• Deletar este arquivo CSV antigo</li>
                <li>• Fazer upload novamente do mesmo arquivo</li>
                <li>• O novo formato será automaticamente compatível</li>
              </ul>
              <div className="mt-3 text-xs text-red-600 bg-red-100 p-3 rounded">
                <p><strong>Nome do arquivo:</strong> {csv.nome}</p>
                <p><strong>ID:</strong> {csv.id}</p>
                <p><strong>Dados brutos:</strong> {csv.dados ? `${csv.dados.length} caracteres` : 'Ausente'}</p>
                <p><strong>Colunas brutas:</strong> {csv.colunas ? `${csv.colunas.length} caracteres` : 'Ausente'}</p>
                <p><strong>Formato detectado:</strong> {csv.dados?.startsWith('[') ? 'JSON' : 'CSV String'}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  toast.info("Para resolver, delete este CSV antigo e faça upload novamente do mesmo arquivo.");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Como Resolver
              </Button>
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = async () => {
    try {
      const csvText = dados.map((row: any) => 
        colunas.map((col: string) => row[col] || '').join(',')
      ).join('\n');
      
      const headerRow = colunas.join(',');
      const fullCSV = `${headerRow}\n${csvText}`;
      
      await navigator.clipboard.writeText(fullCSV);
      setCopied(true);
      toast.success("Dados CSV copiados para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar dados CSV");
    }
  };

  const formatarData = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar CSV: {csv.nome}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {/* Informações do CSV */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Informações do Arquivo CSV
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span>{" "}
                {csv.nome}
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>{" "}
                {csv.id}
              </div>
              <div>
                <span className="font-medium text-gray-700">Criado em:</span>{" "}
                {formatarData(csv.criadoEm)}
              </div>
              {csv.processadoEm && (
                <div>
                  <span className="font-medium text-gray-700">Processado em:</span>{" "}
                  {formatarData(csv.processadoEm)}
                </div>
              )}
              <div className="col-span-2">
                <span className="font-medium text-gray-700">
                  Colunas detectadas:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {colunas.map((coluna: string) => (
                    <span
                      key={coluna}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {coluna}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">
                  Total de registros:
                </span>{" "}
                <span className="text-blue-600 font-semibold">{dados.length}</span>
              </div>
            </div>
          </div>

          {/* Visualização dos Dados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Dados do CSV ({dados.length} registros)
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar CSV
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {colunas.map((coluna: string) => (
                        <th key={coluna} className="px-4 py-3 text-left font-medium text-gray-900">
                          {coluna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dados.slice(0, 100).map((row: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {colunas.map((coluna: string) => (
                          <td key={coluna} className="px-4 py-3 text-gray-700 max-w-xs truncate">
                            {row[coluna] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dados.length > 100 && (
                  <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-600 border-t">
                    Mostrando os primeiros 100 registros de {dados.length} total
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
