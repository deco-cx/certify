import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, Code, Eye, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ViewTemplateProps {
  template: {
    id: number;
    nome: string;
    arquivoUrl: string;
    campos: string | null;
  };
  onClose: () => void;
}

export function ViewTemplate({ template, onClose }: ViewTemplateProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  // Extrair o HTML do arquivoUrl (data:text/html;base64,...)
  const getHtmlContent = () => {
    try {
      if (template.arquivoUrl.startsWith('data:text/html;base64,')) {
        const base64 = template.arquivoUrl.replace('data:text/html;base64,', '');
        return decodeURIComponent(escape(atob(base64)));
      }
      return template.arquivoUrl;
    } catch (error) {
      console.error('Erro ao decodificar HTML:', error);
      return '<p>Erro ao carregar template</p>';
    }
  };

  const htmlContent = getHtmlContent();

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

  // Substituir placeholders por valores de exemplo
  const getPreviewHtml = () => {
    let previewHtml = htmlContent;
    
    placeholders.forEach(placeholder => {
      const exampleValue = getExampleValue(placeholder);
      previewHtml = previewHtml.replace(
        new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'),
        `<span class="bg-yellow-200 px-1 rounded text-yellow-800 font-medium">${exampleValue}</span>`
      );
    });
    
    return previewHtml;
  };

  const getExampleValue = (placeholder: string) => {
    const examples: Record<string, string> = {
      'nome': 'João Silva',
      'curso': 'Desenvolvimento Web',
      'carga_horaria': '40 horas',
      'data_conclusao': '15/01/2025',
      'codigo_verificacao': 'CERT123456',
      'email': 'joao@email.com',
      'cpf': '123.456.789-00',
      'rg': '12.345.678-9',
      'endereco': 'Rua das Flores, 123',
      'cidade': 'São Paulo',
      'estado': 'SP',
      'cep': '01234-567',
      'telefone': '(11) 99999-9999',
      'data_nascimento': '01/01/1990',
      'idade': '35 anos',
      'profissao': 'Desenvolvedor',
      'empresa': 'Tech Solutions',
      'cargo': 'Senior Developer',
      'departamento': 'TI',
      'supervisor': 'Maria Santos',
      'instrutor': 'Carlos Oliveira',
      'coordenador': 'Ana Costa',
      'diretor': 'Roberto Lima',
      'reitor': 'Dr. José Silva',
      'decano': 'Prof. Maria Oliveira',
      'periodo': '2024.2',
      'semestre': '2º Semestre',
      'ano': '2024',
      'nota': '9.5',
      'conceito': 'Excelente',
      'status': 'Aprovado',
      'ch': '40',
      'creditos': '3',
      'modulo': 'Módulo 3',
      'unidade': 'Unidade 2',
      'aula': 'Aula 15',
      'tema': 'React Hooks',
      'objetivo': 'Aprender conceitos básicos',
      'metodologia': 'Aulas práticas',
      'recursos': 'Computador e internet',
      'bibliografia': 'Documentação oficial',
      'observacoes': 'Curso intensivo',
      'certificado': 'Certificado de Conclusão',
      'diploma': 'Diploma de Graduação',
      'declaracao': 'Declaração de Matrícula',
      'historico': 'Histórico Escolar',
      'boletim': 'Boletim de Notas',
      'frequencia': '90%',
      'presenca': '18 de 20 aulas',
      'atividade': 'Projeto Final',
      'trabalho': 'Trabalho de Conclusão',
      'prova': 'Prova Final',
      'exame': 'Exame de Qualificação',
      'defesa': 'Defesa de TCC',
      'banca': 'Banca Examinadora',
      'orientador': 'Prof. Dr. Silva',
      'coorientador': 'Prof. Me. Santos',
      'avaliador': 'Prof. Dr. Oliveira',
      'membro': 'Prof. Dr. Costa',
      'presidente': 'Prof. Dr. Lima',
      'secretario': 'Prof. Me. Ferreira',
      'relator': 'Prof. Dr. Rodrigues',
      'suplente': 'Prof. Me. Almeida',
      'convidado': 'Prof. Dr. Pereira',
      'especialista': 'Prof. Dr. Martins',
      'consultor': 'Prof. Dr. Gomes',
      'assessor': 'Prof. Me. Lopes',
      'coordenador_geral': 'Prof. Dr. Ribeiro',
      'diretor_geral': 'Prof. Dr. Carvalho',
      'reitor_geral': 'Prof. Dr. Alves',
      'decano_geral': 'Prof. Dr. Nascimento',
      'presidente_geral': 'Prof. Dr. Mendes',
      'secretario_geral': 'Prof. Me. Barbosa',
      'tesoureiro': 'Prof. Me. Rocha',
      'vice_presidente': 'Prof. Dr. Souza',
      'vice_diretor': 'Prof. Dr. Ferreira',
      'vice_reitor': 'Prof. Dr. Costa',
      'vice_decano': 'Prof. Dr. Silva',
      'adjunto': 'Prof. Dr. Oliveira',
      'assistente': 'Prof. Me. Santos',
      'auxiliar': 'Prof. Me. Lima',
      'estagiario': 'João Silva',
      'monitor': 'Maria Santos',
      'tutor': 'Carlos Oliveira',
      'mentor': 'Ana Costa',
      'coach': 'Roberto Lima',
      'consultor_educacional': 'Dr. José Silva',
      'pedagogo': 'Prof. Maria Oliveira',
      'psicopedagogo': 'Prof. Carlos Santos',
      'fonoaudiologo': 'Prof. Ana Lima',
      'terapeuta_ocupacional': 'Prof. Roberto Costa',
      'fisioterapeuta': 'Prof. José Oliveira',
      'enfermeiro': 'Prof. Maria Silva',
      'medico': 'Dr. Carlos Lima',
      'dentista': 'Dr. Ana Costa',
      'farmacia': 'Prof. Roberto Santos',
      'biologia': 'Prof. José Oliveira',
      'quimica': 'Prof. Maria Silva',
      'fisica': 'Prof. Carlos Lima',
      'matematica': 'Prof. Ana Costa',
      'historia': 'Prof. Roberto Santos',
      'geografia': 'Prof. José Oliveira',
      'portugues': 'Prof. Maria Silva',
      'ingles': 'Prof. Carlos Lima',
      'espanhol': 'Prof. Ana Costa',
      'frances': 'Prof. Roberto Santos',
      'alemao': 'Prof. José Oliveira',
      'italiano': 'Prof. Maria Silva',
      'latim': 'Prof. Carlos Lima',
      'grego': 'Prof. Ana Costa',
      'filosofia': 'Prof. Roberto Santos',
      'sociologia': 'Prof. José Oliveira',
      'antropologia': 'Prof. Maria Silva',
      'psicologia': 'Prof. Carlos Lima',
      'economia': 'Prof. Ana Costa',
      'administracao': 'Prof. Roberto Santos',
      'contabilidade': 'Prof. José Oliveira',
      'direito': 'Prof. Maria Silva',
      'engenharia': 'Prof. Carlos Lima',
      'arquitetura': 'Prof. Ana Costa',
      'design': 'Prof. Roberto Santos',
      'publicidade': 'Prof. José Oliveira',
      'jornalismo': 'Prof. Maria Silva',
      'radio': 'Prof. Carlos Lima',
      'tv': 'Prof. Ana Costa',
      'cinema': 'Prof. Roberto Santos',
      'teatro': 'Prof. José Oliveira',
      'musica': 'Prof. Maria Silva',
      'danca': 'Prof. Carlos Lima',
      'artes_plasticas': 'Prof. Ana Costa',
      'fotografia': 'Prof. Roberto Santos',
      'moda': 'Prof. José Oliveira',
      'gastronomia': 'Prof. Maria Silva',
      'turismo': 'Prof. Carlos Lima',
      'hotelaria': 'Prof. Ana Costa',
      'eventos': 'Prof. Roberto Santos',
      'esportes': 'Prof. José Oliveira',
      'educacao_fisica': 'Prof. Maria Silva',
      'fisioterapia': 'Prof. Carlos Lima',
      'enfermagem': 'Prof. Ana Costa',
      'medicina': 'Prof. Roberto Santos',
      'odontologia': 'Prof. José Oliveira',
      'biomedicina': 'Prof. Carlos Lima',
      'nutricao': 'Prof. Ana Costa',
      'terapia_ocupacional': 'Prof. José Oliveira',
      'fonoaudiologia': 'Prof. Maria Silva',
      'servico_social': 'Prof. Ana Costa',
      'pedagogia': 'Prof. Roberto Santos',
      'letras': 'Prof. José Oliveira',
      'engenharia_civil': 'Prof. Carlos Lima',
      'engenharia_mecanica': 'Prof. Ana Costa',
      'engenharia_eletrica': 'Prof. Roberto Santos',
      'engenharia_quimica': 'Prof. José Oliveira',
      'engenharia_producao': 'Prof. Maria Silva',
      'engenharia_computacao': 'Prof. Carlos Lima',
      'sistemas_informacao': 'Prof. Ana Costa',
      'ciencia_computacao': 'Prof. Roberto Santos',
      'engenharia_software': 'Prof. José Oliveira',
      'analise_desenvolvimento': 'Prof. Maria Silva',
      'redes_computadores': 'Prof. Carlos Lima',
      'seguranca_informacao': 'Prof. Ana Costa',
      'inteligencia_artificial': 'Prof. Roberto Santos',
      'machine_learning': 'Prof. José Oliveira',
      'data_science': 'Prof. Maria Silva',
      'big_data': 'Prof. Carlos Lima',
      'cloud_computing': 'Prof. Ana Costa',
      'devops': 'Prof. Roberto Santos',
      'mobile_development': 'Prof. José Oliveira',
      'web_development': 'Prof. Maria Silva',
      'frontend': 'Prof. Carlos Lima',
      'backend': 'Prof. Ana Costa',
      'fullstack': 'Prof. Roberto Santos',
      'ui_ux': 'Prof. José Oliveira',
      'product_design': 'Prof. Maria Silva',
      'user_research': 'Prof. Carlos Lima',
      'prototyping': 'Prof. Roberto Santos',
      'wireframing': 'Prof. José Oliveira',
      'information_architecture': 'Prof. Maria Silva',
      'interaction_design': 'Prof. Carlos Lima',
      'visual_design': 'Prof. Ana Costa',
      'graphic_design': 'Prof. Roberto Santos',
      'brand_design': 'Prof. José Oliveira',
      'logo_design': 'Prof. Maria Silva',
      'typography': 'Prof. Carlos Lima',
      'color_theory': 'Prof. Ana Costa',
      'layout_design': 'Prof. Roberto Santos',
      'print_design': 'Prof. José Oliveira',
      'digital_design': 'Prof. Maria Silva',
      '3d_modeling': 'Prof. Carlos Lima',
      'animation': 'Prof. Ana Costa',
      'video_editing': 'Prof. Roberto Santos',
      'sound_design': 'Prof. José Oliveira',
      'game_design': 'Prof. Maria Silva',
      'level_design': 'Prof. Carlos Lima',
      'character_design': 'Prof. Ana Costa',
      'storytelling': 'Prof. Roberto Santos',
      'narrative_design': 'Prof. José Oliveira',
      'world_building': 'Prof. Maria Silva',
      'quest_design': 'Prof. Carlos Lima',
      'combat_design': 'Prof. Ana Costa',
      'economy_design': 'Prof. Roberto Santos',
      'progression_design': 'Prof. José Oliveira',
      'balance_design': 'Prof. Maria Silva',
      'accessibility_design': 'Prof. Carlos Lima',
      'inclusive_design': 'Prof. Ana Costa',
      'universal_design': 'Prof. Roberto Santos',
      'human_centered_design': 'Prof. José Oliveira',
      'design_thinking': 'Prof. Maria Silva',
      'agile_methodology': 'Prof. Carlos Lima',
      'scrum': 'Prof. Ana Costa',
      'kanban': 'Prof. Roberto Santos',
      'lean': 'Prof. José Oliveira',
      'waterfall': 'Prof. Maria Silva',
      'spiral': 'Prof. Carlos Lima',
      'v_model': 'Prof. Ana Costa',
      'prototype_model': 'Prof. Roberto Santos',
      'incremental_model': 'Prof. José Oliveira',
      'evolutionary_model': 'Prof. Maria Silva',
      'concurrent_model': 'Prof. Carlos Lima',
      'component_model': 'Prof. Ana Costa',
      'formal_model': 'Prof. Roberto Santos',
      'transformational_model': 'Prof. José Oliveira',
      'reuse_model': 'Prof. Maria Silva',
      'client_server': 'Prof. Carlos Lima',
      'peer_to_peer': 'Prof. Ana Costa',
      'distributed_system': 'Prof. Roberto Santos',
      'microservices': 'Prof. José Oliveira',
      'monolithic': 'Prof. Maria Silva',
      'layered_architecture': 'Prof. Carlos Lima',
      'event_driven': 'Prof. Ana Costa',
      'domain_driven': 'Prof. Roberto Santos',
      'test_driven': 'Prof. José Oliveira',
      'behavior_driven': 'Prof. Maria Silva',
      'acceptance_testing': 'Prof. Carlos Lima',
      'unit_testing': 'Prof. Ana Costa',
      'integration_testing': 'Prof. Roberto Santos',
      'system_testing': 'Prof. José Oliveira',
      'regression_testing': 'Prof. Maria Silva',
      'smoke_testing': 'Prof. Carlos Lima',
      'sanity_testing': 'Prof. Ana Costa',
      'exploratory_testing': 'Prof. Roberto Santos',
      'ad_hoc_testing': 'Prof. José Oliveira',
      'monkey_testing': 'Prof. Maria Silva',
      'gorilla_testing': 'Prof. Carlos Lima',
      'fuzz_testing': 'Prof. Ana Costa',
      'stress_testing': 'Prof. Roberto Santos',
      'load_testing': 'Prof. José Oliveira',
      'performance_testing': 'Prof. Maria Silva',
      'security_testing': 'Prof. Carlos Lima',
      'penetration_testing': 'Prof. Ana Costa',
      'vulnerability_assessment': 'Prof. Roberto Santos',
      'risk_assessment': 'Prof. José Oliveira',
      'threat_modeling': 'Prof. Maria Silva',
      'security_audit': 'Prof. Carlos Lima',
      'compliance_testing': 'Prof. Ana Costa',
      'accessibility_testing': 'Prof. Roberto Santos',
      'user_acceptance': 'Prof. Maria Silva',
      'alpha_testing': 'Prof. Carlos Lima',
      'beta_testing': 'Prof. Ana Costa',
      'gamma_testing': 'Prof. Roberto Santos',
      'delta_testing': 'Prof. José Oliveira',
      'epsilon_testing': 'Prof. Maria Silva',
      'zeta_testing': 'Prof. Carlos Lima',
      'eta_testing': 'Prof. Ana Costa',
      'theta_testing': 'Prof. Roberto Santos',
      'iota_testing': 'Prof. José Oliveira',
      'kappa_testing': 'Prof. Maria Silva',
      'lambda_testing': 'Prof. Carlos Lima',
      'mu_testing': 'Prof. Ana Costa',
      'nu_testing': 'Prof. Roberto Santos',
      'xi_testing': 'Prof. José Oliveira',
      'omicron_testing': 'Prof. Maria Silva',
      'pi_testing': 'Prof. Carlos Lima',
      'rho_testing': 'Prof. Ana Costa',
      'sigma_testing': 'Prof. Roberto Santos',
      'tau_testing': 'Prof. José Oliveira',
      'upsilon_testing': 'Prof. Maria Silva',
      'phi_testing': 'Prof. Carlos Lima',
      'chi_testing': 'Prof. Ana Costa',
      'psi_testing': 'Prof. Roberto Santos',
      'omega_testing': 'Prof. José Oliveira'
    };
    
    return examples[placeholder] || `[${placeholder}]`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      toast.success('HTML copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar HTML');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar Template: {template.nome}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant={viewMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('code')}
            >
              <Code className="h-4 w-4 mr-2" />
              Código
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações do template */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informações do Template</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span> {template.nome}
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span> {template.id}
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Campos detectados:</span>
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

          {/* Conteúdo do template */}
          <div className="border rounded-lg overflow-hidden">
            {viewMode === 'preview' ? (
              <div className="bg-white p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>
            ) : (
              <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  <code>{htmlContent}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como usar este template</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Os campos destacados em <span className="bg-yellow-200 px-1 rounded">amarelo</span> são placeholders que serão substituídos</li>
                             <li>• Use o formato <code className="bg-blue-100 px-1 rounded">{'{{nome_campo}}'}</code> para criar novos campos</li>
              <li>• Os dados serão inseridos automaticamente ao gerar certificados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
