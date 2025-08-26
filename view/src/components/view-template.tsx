import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check, Code, Copy, Eye, X } from "lucide-react";
import { toast } from "sonner";

interface ViewTemplateProps {
  template: {
    id: number;
    nome: string;
    html: string; // Campo correto do servidor
    campos: string | null;
  };
  onClose: () => void;
}

export function ViewTemplate({ template, onClose }: ViewTemplateProps) {
  const [copied, setCopied] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  // Usar o HTML diretamente do template
  const htmlContent = template.html;

  // Detectar placeholders no HTML
  const detectPlaceholders = (html: string) => {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;

    while ((match = placeholderRegex.exec(html)) !== null) {
      placeholders.push(match[1]);
    }

    return [...new Set(placeholders)]; // Remove duplicatas
  };

  const placeholders = detectPlaceholders(htmlContent);

  // Substituir placeholders por valores de exemplo para preview
  const getPreviewHtml = () => {
    let previewHtml = htmlContent;

    placeholders.forEach((placeholder) => {
      const exampleValue = getExampleValue(placeholder);
      previewHtml = previewHtml.replace(
        new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"),
        `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 4px; color: #92400e; font-weight: 500;">${exampleValue}</span>`,
      );
    });

    return previewHtml;
  };

  const getExampleValue = (placeholder: string) => {
    const examples: Record<string, string> = {
      "nome": "João Silva",
      "curso": "Desenvolvimento Web",
      "carga_horaria": "40 horas",
      "data_conclusao": "15/01/2025",
      "codigo_verificacao": "CERT123456",
      "email": "joao@email.com",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "endereco": "Rua das Flores, 123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567",
      "telefone": "(11) 99999-9999",
      "data_nascimento": "01/01/1990",
      "idade": "35 anos",
      "profissao": "Desenvolvedor",
      "empresa": "Tech Solutions",
      "cargo": "Senior Developer",
      "departamento": "TI",
      "supervisor": "Maria Santos",
      "instrutor": "Carlos Oliveira",
      "coordenador": "Ana Costa",
      "diretor": "Roberto Lima",
      "reitor": "Dr. José Silva",
      "periodo": "2024.2",
      "semestre": "2º Semestre",
      "ano": "2024",
      "nota": "9.5",
      "conceito": "Excelente",
      "status": "Aprovado",
      "ch": "40",
      "creditos": "3",
      "modulo": "Módulo 3",
      "frequencia": "90%",
      "presenca": "18 de 20 aulas",
      "name": "João Silva", // Adicionado para o campo "name" que aparece no print
    };

    return examples[placeholder] || `[${placeholder}]`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      toast.success("HTML copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar HTML");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar Template: {template.nome}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied
                ? <Check className="h-4 w-4 mr-2" />
                : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {/* Informações do template */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Informações do Template
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span>{" "}
                {template.nome}
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>{" "}
                {template.id}
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">
                  Campos detectados:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {placeholders.map((placeholder) => (
                    <span
                      key={placeholder}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {placeholder}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs para Preview e Código */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="codigo" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Código HTML
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
                  <div className="text-sm text-gray-600">Preview com dados de exemplo:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Orientação:</span>
                    <Select value={orientation} onValueChange={(value) => setOrientation(value as 'portrait' | 'landscape')}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Retrato</SelectItem>
                        <SelectItem value="landscape">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div 
                  className="bg-white overflow-hidden"
                  style={{
                    width: '100%',
                    position: 'relative',
                    ...(orientation === 'landscape' && { 
                      maxWidth: '1200px',
                      aspectRatio: '16/9'
                    }),
                    ...(orientation === 'portrait' && { 
                      maxWidth: '800px',
                      aspectRatio: '3/4'
                    })
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      padding: '20px',
                      overflow: 'auto',
                      boxSizing: 'border-box'
                    }}
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="codigo" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    <code>{htmlContent}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Como usar este template
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Os campos destacados em{" "}
                <span className="bg-yellow-200 px-1 rounded">amarelo</span>{" "}
                são placeholders que serão substituídos
              </li>
              <li>
                • Use o formato{" "}
                <code className="bg-blue-100 px-1 rounded">
                  {"{{nome_campo}}"}
                </code>{" "}
                para criar novos campos
              </li>
              <li>
                • Os dados serão inseridos automaticamente ao gerar certificados
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
