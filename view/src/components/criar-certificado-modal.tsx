import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Send, X, Download, Eye, Code, MessageSquare, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";
import { UnicornLoading } from "./unicorn-loading";

interface CriarCertificadoModalProps {
  turmaId: number;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CertificateRequirements {
  tipo: string;
  estilo: string;
  cores: string[];
  layout: string; 
  curso: string;
  assinante?: {
    nome: string;
    cargo: string;
  };
  imagens?: {
    logo?: string;
    texturaFundo?: string;
    outros?: string[];
  };
  isComplete: boolean;
}

export function CriarCertificadoModal({ turmaId, onClose }: CriarCertificadoModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [requirements, setRequirements] = useState<CertificateRequirements>({
    tipo: "",
    estilo: "",
    cores: [],
    layout: "",
    curso: "",
    assinante: {
      nome: "",
      cargo: ""
    },
    imagens: {
      logo: "",
      texturaFundo: "",
      outros: []
    },
    isComplete: false
  });
  const [conversationPhase, setConversationPhase] = useState<"collecting" | "generating" | "complete">("collecting");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simular carregamento da mensagem inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Olá! Vou te ajudar a criar um template de certificado personalizado e profissional.\n\n**Para começar, me diga:**\n• Que tipo de certificado você quer? (participação, conclusão, workshop, etc.)\n• Qual o estilo visual? (moderno, clássico, corporativo, tech, minimalista, etc.)\n• Quais cores principais? (ex: azul e branco, verde e dourado, escuro com branco, etc.)\n• Qual layout? (horizontal, vertical, quadrado)\n• Para qual curso? (ex: programação, design, marketing, etc.)\n• Quem vai assinar? (nome e cargo/função da pessoa, ex: \"João Silva, Diretor de Ensino\")\n\n**Dica:** Quanto mais detalhes você fornecer, mais personalizado e profissional será seu certificado!\n\nResponda de uma vez e eu crio seu template!",
          timestamp: new Date(),
        },
      ]);
    }, 1500); // 1.5 segundos de delay

    return () => clearTimeout(timer);
  }, []);

  const getPhaseIndicator = () => {
    switch (conversationPhase) {
      case "collecting":
        return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Coletando Informações</span>;
      case "generating":
        return (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
            Gerando Template
          </span>
        );
      case "complete":
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Template Pronto</span>;
      default:
        return null;
    }
  };

  // Mutation para salvar template
  const salvarTemplateMutation = useMutation({
    mutationFn: async (data: { nome: string; html: string; turmaId: number }) => {
      return await client.CRIAR_TEMPLATE(data);
    },
    onSuccess: () => {
      toast.success("Template salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["templates", turmaId] });
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao salvar template. Tente novamente.");
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);
    setIsTyping(true);

    try {
      if (conversationPhase === "collecting") {
        // Fase de coleta de informações
        await handleInformationCollection(inputMessage);
      } else if (conversationPhase === "generating") {
        // Fase de geração do template
        await generateTemplateFromRequirements();
      }
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const handleInformationCollection = async (userInput: string) => {
    try {
      console.log('🔍 INICIANDO COLETA DE INFORMAÇÕES');
      console.log('📝 Mensagem do usuário:', userInput);
      console.log('📋 Requisitos atuais:', requirements);

      const result = await client.AI_GENERATE_OBJECT({
        messages: [
          {
            role: "system",
            content: `Você é um assistente para criação de certificados. Analise a mensagem do usuário e extraia as informações necessárias.

            INFORMAÇÕES A EXTRAIR:
            - tipo: tipo de certificado (participação, conclusão, workshop, etc.)
            - estilo: estilo visual (tech, moderno, clássico, corporativo, etc.)
            - cores: array de cores mencionadas (ex: ["escuro", "branco", "#D0EC1A"])
            - layout: layout do certificado (horizontal, vertical, quadrado)
            - curso: nome EXATO do curso (ex: "Agentic Engineer L1") - será usado como TEXTO FIXO
            - assinante: objeto com nome e cargo da pessoa que assina (ex: {"nome": "João Silva", "cargo": "Diretor de Ensino"})
            - imagens: objeto com logo, texturaFundo, outros (se mencionados)
            
            REGRAS:
            1. Seja DIRETO e PRÁTICO
            2. Extraia TODAS as informações mencionadas na mensagem
            3. Se a mensagem contém informações suficientes (tipo + estilo + cores + assinante), marque isComplete como true
            4. Se faltam informações essenciais, marque isComplete como false
            5. SEMPRE tente extrair informações de assinatura (nome e cargo/função)
            6. O nome do curso será usado como TEXTO FIXO no certificado (não como placeholder)
            
            CONTEXTO ATUAL:
            Tipo: ${requirements.tipo || 'não informado'}
            Estilo: ${requirements.estilo || 'não informado'}
            Cores: ${requirements.cores.length > 0 ? requirements.cores.join(', ') : 'não informado'}
            Layout: ${requirements.layout || 'não informado'}
            Curso: ${requirements.curso || 'não informado'}
            Assinante: ${requirements.assinante ? `${requirements.assinante.nome} - ${requirements.assinante.cargo}` : 'não informado'}
            
            Resposta do usuário: "${userInput}"
            
            AÇÃO: Analise a mensagem e extraia as informações. Se tiver o básico (tipo + estilo + cores + assinante), marque isComplete como true.
            
            EXEMPLO DE RESPOSTA:
            Se o usuário disser: "Certificado de participação no curso Agentic Engineer L1, estilo tech, cor escura de fundo e fonte branca, layout horizontal, assinado por Maria Santos, Coordenadora Pedagógica"
            
            Você deve retornar:
            {
              "tipo": "participação",
              "estilo": "tech",
              "cores": ["escuro", "branco"],
              "layout": "horizontal",
              "curso": "Agentic Engineer L1",
              "assinante": {"nome": "Maria Santos", "cargo": "Coordenadora Pedagógica"},
              "imagens": {},
              "isComplete": true,
              "response": "Perfeito! Capturei todas as informações: certificado de participação, estilo tech, cores escuras com branco, layout horizontal, curso Agentic Engineer L1, assinado por Maria Santos, Coordenadora Pedagógica. Vou gerar seu template agora!"
            }`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        schema: {
          type: "object",
          properties: {
            tipo: { type: "string", description: "Tipo de certificado extraído" },
            estilo: { type: "string", description: "Estilo visual extraído" },
            cores: { type: "array", items: { type: "string" }, description: "Array de cores extraídas" },
            layout: { type: "string", description: "Layout extraído" },
            curso: { type: "string", description: "Nome EXATO do curso (será usado como texto fixo)" },
            assinante: { 
              type: "object",
              properties: {
                nome: { type: "string", description: "Nome da pessoa que assina" },
                cargo: { type: "string", description: "Cargo/função da pessoa que assina" }
              },
              description: "Informações da pessoa que assina o certificado"
            },
            imagens: { 
              type: "object",
              properties: {
                logo: { type: "string" },
                texturaFundo: { type: "string" },
                outros: { type: "array", items: { type: "string" } }
              }
            },
            isComplete: { type: "boolean", description: "Se tem informações suficientes para gerar" },
            response: { type: "string", description: "Resposta para o usuário" }
          },
          required: ["tipo", "estilo", "cores", "layout", "curso", "assinante", "isComplete", "response"]
        }
      });

      console.log('🤖 RESPOSTA DO AI:', result);

      if (result.object) {
        const updateReq = result.object;
        const response = updateReq.response as string;
        const isComplete = updateReq.isComplete as boolean;

        console.log('📊 DADOS EXTRAÍDOS:', {
          tipo: updateReq.tipo,
          estilo: updateReq.estilo,
          cores: updateReq.cores,
          layout: updateReq.layout,
          curso: updateReq.curso,
          imagens: updateReq.imagens,
          isComplete: isComplete
        });

        // Atualizar requisitos com as informações extraídas
        setRequirements(prev => {
          const updated = {
            ...prev,
            tipo: (updateReq.tipo as string) || prev.tipo,
            estilo: (updateReq.estilo as string) || prev.estilo,
            cores: (updateReq.cores as string[]) || prev.cores,
            layout: (updateReq.layout as string) || prev.layout,
            curso: (updateReq.curso as string) || prev.curso,
            assinante: (updateReq.assinante as { nome: string; cargo: string }) || prev.assinante,
            imagens: updateReq.imagens || prev.imagens,
            isComplete: isComplete
          };
          
          console.log('✅ REQUISITOS ATUALIZADOS:', updated);
          return updated;
        });

        // Adicionar resposta da IA
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }]);

        // Se tem informações suficientes, ir direto para geração
        if (isComplete) {
          console.log('🚀 INICIANDO GERAÇÃO - isComplete = true');
          setConversationPhase("generating");
          
          // Criar objeto com requisitos atualizados para passar diretamente
          const requisitosAtualizados = {
            tipo: (updateReq.tipo as string) || requirements.tipo,
            estilo: (updateReq.estilo as string) || requirements.estilo,
            cores: (updateReq.cores as string[]) || requirements.cores,
            layout: (updateReq.layout as string) || requirements.layout,
            curso: (updateReq.curso as string) || requirements.curso,
            assinante: (updateReq.assinante as { nome: string; cargo: string }) || requirements.assinante,
            imagens: updateReq.imagens || requirements.imagens,
            isComplete: isComplete
          };
          
          console.log('📋 REQUISITOS ATUALIZADOS PARA GERAÇÃO:', requisitosAtualizados);
          
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: "🎯 Perfeito! Agora tenho todas as informações necessárias. Vou gerar seu template personalizado...",
              timestamp: new Date(),
            }]);
            // Passar os requisitos atualizados diretamente
            generateTemplateFromRequirements(requisitosAtualizados);
          }, 1000);
        } else {
          console.log('⏳ AINDA COLETANDO - isComplete = false');
        }
      } else {
        console.log('❌ AI NÃO RETORNOU OBJETO VÁLIDO');
      }
    } catch (error) {
      console.error("❌ ERRO na coleta de informações:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Desculpe, tive um problema. Pode tentar novamente?",
        timestamp: new Date(),
      }]);
    }
  };

  const generateTemplateFromRequirements = async (requirementsParam?: CertificateRequirements) => {
    let progressInterval: NodeJS.Timeout | undefined;
    
    // Usar os requisitos passados como parâmetro ou o estado atual
    const requisitosParaGeracao = requirementsParam || requirements;
    
    try {
      console.log('🎨 INICIANDO GERAÇÃO DE TEMPLATE');
      console.log('📋 REQUISITOS PARA GERAÇÃO:', requisitosParaGeracao);
      
      setIsGeneratingTemplate(true);
      setGenerationProgress("Criando template personalizado...");
      
      // Progresso mais simples e rápido
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev.includes("Criando template")) return "Aplicando estilos e cores...";
          if (prev.includes("Aplicando estilos")) return "Finalizando...";
          return "Criando template personalizado...";
        });
      }, 2000); // 2 segundos para cada mensagem

      const promptContent = `Você é um especialista em HTML para certificados com vasta experiência em design gráfico e diagramação. Crie um template COMPLETO, LIMPO e FUNCIONAL baseado EXATAMENTE nos requisitos fornecidos.

      REQUISITOS COLETADOS (USE EXATAMENTE ESTES):
      Tipo: ${requisitosParaGeracao.tipo}
      Estilo: ${requisitosParaGeracao.estilo}
      Cores: ${requisitosParaGeracao.cores.join(', ')}
      Layout: ${requisitosParaGeracao.layout}
      Curso: ${requisitosParaGeracao.curso}
      Assinante: ${requisitosParaGeracao.assinante ? `${requisitosParaGeracao.assinante.nome} - ${requisitosParaGeracao.assinante.cargo}` : 'não informado'}
      ${requisitosParaGeracao.imagens ? `Imagens: ${JSON.stringify(requisitosParaGeracao.imagens)}` : ''}

      REGRAS CRÍTICAS DE DESIGN E DIAGRAMAÇÃO:
      1. HTML COMPLETO e VÁLIDO com DOCTYPE, html, head, body
      2. CSS inline OU em tag <style> (não misture)
      3. Placeholders SIMPLES: {{nome}}, {{data}}, {{carga_horaria}}
      4. NÃO use placeholders complexos como [outros[0] || '']
      5. Use EXATAMENTE as cores especificadas: ${requisitosParaGeracao.cores.join(', ')}
      6. Aplique EXATAMENTE o estilo solicitado: ${requisitosParaGeracao.estilo}
      7. Layout responsivo e elegante conforme solicitado: ${requisitosParaGeracao.layout}
      8. Estrutura clara: cabeçalho, conteúdo, rodapé com assinatura
      9. Espaçamento adequado entre elementos
      10. Aparência profissional e oficial
      11. NÃO use emojis ou elementos informais
      12. Personalize baseado EXATAMENTE no tipo: ${requisitosParaGeracao.tipo}
      13. Personalize baseado EXATAMENTE no curso: ${requisitosParaGeracao.curso}
      14. SEMPRE use as informações de assinatura fornecidas: ${requisitosParaGeracao.assinante ? `${requisitosParaGeracao.assinante.nome} como texto fixo e ${requisitosParaGeracao.assinante.cargo} como texto fixo` : 'use texto padrão para assinatura'}

      PRINCÍPIOS DE DIAGRAMAÇÃO PROFISSIONAL:
      15. HIERARQUIA VISUAL: Use tamanhos de fonte diferentes para criar hierarquia (h1 > h2 > p)
      16. ALINHAMENTO: Alinhe elementos de forma consistente (center, left, right)
      17. ESPAÇAMENTO: Use padding e margin consistentes (20px, 40px, 60px)
      18. PROPORÇÕES: Mantenha proporções equilibradas entre elementos
      19. CONTRASTE: Garanta contraste adequado entre texto e fundo
      20. RESPIRAÇÃO: Deixe "espaço para respirar" entre seções
      21. SIMETRIA: Use simetria quando apropriado para o estilo solicitado
      22. TIPOGRAFIA: Use fontes legíveis e tamanhos apropriados (16px+ para texto, 24px+ para títulos)
      23. CORES: Aplique cores de forma harmoniosa e com contraste adequado
      24. LAYOUT: Organize elementos de forma lógica e visualmente agradável
      25. RESPONSIVIDADE: Garanta que o layout funcione bem em diferentes tamanhos
      26. CONSISTÊNCIA: Mantenha padrões visuais consistentes em todo o certificado

      LAYOUT E ESTRUTURA (CRÍTICO):
      27. Use layout HORIZONTAL com elementos centralizados verticalmente
      28. O certificado deve ser RESPONSIVO e caber naturalmente na área de preview
      29. Use width: 100% e max-width: 700px para garantir que caiba
      30. Use aspect-ratio: 1.414 para manter proporção A4 horizontal
      31. Padding interno de 30px para espaçamento adequado
      32. Todos os elementos devem estar dentro dos limites do container
      33. NÃO deixe elementos "vazarem" para fora da área do certificado
      34. Use overflow: hidden se necessário para conter elementos
      35. ESTRUTURA DE FRASE: "Certificamos que" + NOME (tipografia maior e elegante) + continuação da frase
      36. NOME deve ter destaque visual com tipografia maior, mas elegante
      37. Logo deve ser posicionado no cabeçalho ou canto superior
      38. Textura de fundo deve ser aplicada como background-image do certificado

      ÁREA DE ASSINATURA (OBRIGATÓRIO):
      39. NÃO use nome de empresa - use NOME e CARGO/FUNÇÃO de uma pessoa
      40. Estrutura: "Nome da Pessoa" + "Cargo/Função" (ex: "João Silva" + "Diretor de Ensino")
      41. Posicione a assinatura no rodapé, CENTRALIZADA
      42. Use o nome e cargo FIXOS fornecidos pelo usuário (não placeholders)
      43. Separe nome e cargo com quebra de linha
      44. Aplique estilos consistentes com o resto do certificado
      45. Linha de assinatura deve ter tamanho APROPRIADO (não gigante)
      46. Nome da pessoa deve ter destaque moderado (não exagerado)
      47. Cargo/função deve ter tamanho menor e estilo mais sutil

      CORREÇÕES OBRIGATÓRIAS:
      48. NÃO use [curso] - use o nome fixo do curso informado: "${requisitosParaGeracao.curso}"
      49. NÃO use {{assinante_nome}} ou {{assinante_cargo}} - use os valores fixos: "${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.nome : 'Nome do Assinante'}" e "${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.cargo : 'Cargo do Assinante'}"
      50. NÃO use colchetes [] em nenhum placeholder - use chaves {{}} apenas para {{nome}}, {{data}}, {{carga_horaria}}
      51. Garanta que o certificado seja RESPONSIVO e se ajuste à área disponível
      52. Use espaçamento PROPORCIONAL entre seções
      53. Linha de assinatura deve ter tamanho APROPRIADO (não gigante)

      ${requisitosParaGeracao.imagens ? `
      IMPLEMENTAÇÃO DE IMAGENS (OBRIGATÓRIO):
      54. IMPLEMENTE as imagens fornecidas de forma elegante:
          - Logo: ${requisitosParaGeracao.imagens.logo || 'não fornecido'}
            * Posicione no cabeçalho (canto superior esquerdo ou centralizado)
            * Use tamanho apropriado (ex: width: 80px; height: auto;)
            * Mantenha proporção e qualidade
          - Textura de fundo: ${requisitosParaGeracao.imagens.texturaFundo || 'não fornecido'}
            * Aplique como background-image do container principal
            * Use background-size: cover ou contain conforme apropriado
            * NÃO aplique overlay automático - use a textura como está
            * SEMPRE mantenha as cores solicitadas pelo usuário (${requisitosParaGeracao.cores.join(', ')})
            * Ajuste apenas a opacidade ou contraste se necessário para manter legibilidade
            * A textura deve complementar, não substituir, as cores principais
          - Outras imagens: ${requisitosParaGeracao.imagens.outros ? requisitosParaGeracao.imagens.outros.join(', ') : 'não fornecidas'}
            * Integre de forma harmoniosa ao design
      
      EXEMPLO DE IMPLEMENTAÇÃO:
      .certificate {
        background-image: url('${requisitosParaGeracao.imagens?.texturaFundo || ''}');
        background-size: cover;
        background-position: center;
        position: relative;
        /* SEMPRE mantenha as cores solicitadas pelo usuário */
        color: ${requisitosParaGeracao.cores.includes('branco') ? 'white' : requisitosParaGeracao.cores.includes('preto') ? 'black' : '#2c3e50'};
        background-color: ${requisitosParaGeracao.cores.includes('preto') ? 'rgba(0,0,0,0.8)' : requisitosParaGeracao.cores.includes('azul') ? 'rgba(44,62,80,0.9)' : 'rgba(255,255,255,0.95)'};
      }
      .logo {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 80px;
        height: auto;
        z-index: 10;
      }
      ` : ''}

      EXEMPLO DE ESTRUTURA PROFISSIONAL:
      - <!DOCTYPE html> completo
      - <head> com meta charset, title e viewport
      - <body> com estrutura de certificado bem organizada
      - CSS inline ou em <style> tag com variáveis CSS quando possível
      - Placeholders simples: {{nome}}, {{data}}, {{carga_horaria}}
      - Layout HORIZONTAL com elementos centralizados verticalmente
      - Estrutura de frase: "Certificamos que" + NOME (tipografia maior) + continuação
      - Assinatura com nome e cargo FIXOS (não placeholders)
      - Espaçamento consistente e hierarquia visual clara
      - Logo posicionado no cabeçalho
      - Textura de fundo aplicada como background-image

      EXEMPLO DE TEMPLATE COM LAYOUT HORIZONTAL CENTRALIZADO:
      
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado</title>
          <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .certificate { 
            width: 100%;
            max-width: 700px;
            height: auto;
            aspect-ratio: 1.414; /* Proporção A4 horizontal otimizada para preview */
            margin: 0 auto; 
            padding: 30px; 
            border: 3px solid ${requisitosParaGeracao.cores.includes('preto') ? '#000' : requisitosParaGeracao.cores.includes('azul') ? '#2c3e50' : '#2c3e50'}; 
            background: ${requisitosParaGeracao.cores.includes('preto') ? 'rgba(0,0,0,0.9)' : requisitosParaGeracao.cores.includes('azul') ? 'rgba(44,62,80,0.95)' : 'white'};
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'white' : requisitosParaGeracao.cores.includes('preto') ? 'white' : '#2c3e50'};
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            ${requisitosParaGeracao.imagens?.texturaFundo ? `background-image: url('${requisitosParaGeracao.imagens.texturaFundo}'); background-size: cover; background-position: center;` : ''}
          }
          .logo {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 120px;
            height: auto;
            z-index: 10;
          }
          .header { 
            text-align: center; 
            flex: 0 0 20%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .header h1 { 
            font-size: 2.2em; 
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'white' : requisitosParaGeracao.cores.includes('preto') ? 'white' : '#2c3e50'}; 
            margin: 0;
            font-weight: 300;
            line-height: 1.2;
          }
          .header .course { 
            font-size: 1.3em; 
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.8)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.7)' : '#7f8c8d'};
            margin-top: 15px;
            font-weight: 400;
          }
          .content { 
            text-align: center; 
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            line-height: 1.6;
          }
          .certificate-text {
            max-width: 700px;
            margin: 0 auto;
          }
          .certificate-text .intro {
            font-size: 1.2em;
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.9)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.9)' : '#34495e'};
            margin-bottom: 12px;
          }
          .certificate-text .name {
            font-size: 2em;
            font-weight: 600;
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'white' : requisitosParaGeracao.cores.includes('preto') ? 'white' : '#2c3e50'};
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .certificate-text .continuation {
            font-size: 1.2em;
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.9)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.9)' : '#34495e'};
            margin-top: 12px;
          }
          .footer { 
            text-align: center; 
            flex: 0 0 20%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-top: 2px solid ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.3)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.3)' : '#ecf0f1'};
            padding-top: 20px;
          }
          .signature { 
            margin-top: 20px; 
            text-align: center;
          }
          .signature-line { 
            width: 200px; 
            height: 2px; 
            background: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.6)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.6)' : '#bdc3c7'}; 
            margin: 0 auto 15px; 
            border-radius: 1px;
          }
          .signature-name { 
            font-size: 1.1em; 
            font-weight: 600; 
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'white' : requisitosParaGeracao.cores.includes('preto') ? 'white' : '#2c3e50'}; 
            margin-bottom: 5px;
          }
          .signature-title { 
            font-size: 0.9em; 
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.8)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.7)' : '#7f8c8d'};
          }
          .date { 
            font-size: 1em; 
            color: ${requisitosParaGeracao.cores.includes('branco') ? 'rgba(255,255,255,0.7)' : requisitosParaGeracao.cores.includes('preto') ? 'rgba(255,255,255,0.6)' : '#95a5a6'}; 
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          ${requisitosParaGeracao.imagens?.logo ? `<img src="${requisitosParaGeracao.imagens.logo}" alt="Logo" class="logo">` : ''}
          <div class="header">
            <h1>Certificado de ${requisitosParaGeracao.tipo}</h1>
            <div class="course">${requisitosParaGeracao.curso}</div>
          </div>
          <div class="content">
            <div class="certificate-text">
              <div class="intro">Certificamos que</div>
              <div class="name">{{nome}}</div>
              <div class="continuation">participou com sucesso do curso de <strong>${requisitosParaGeracao.curso}</strong>.</div>
              <div class="continuation">Este certificado atesta a conclusão do programa com carga horária de {{carga_horaria}} horas.</div>
            </div>
          </div>
          <div class="footer">
            <div class="signature">
              <div class="signature-name">${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.nome : 'Nome do Assinante'}</div>
              <div class="signature-title">${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.cargo : 'Cargo do Assinante'}</div>
            </div>
            <div class="date">Emitido em {{data}}</div>
          </div>
        </div>
      </body>
      </html>

      IMPORTANTE: 
      - Gere o template EXATAMENTE conforme os requisitos fornecidos
      - SEMPRE inclua área de assinatura com nome e cargo de pessoa (não empresa)
      - Use LAYOUT HORIZONTAL com elementos centralizados verticalmente
      - ESTRUTURA DE FRASE: "Certificamos que" + NOME (tipografia maior) + continuação
      - Use práticas profissionais de diagramação e design
      - Mantenha consistência visual e espaçamento adequado
      - NÃO use colchetes [] - use chaves {{}} apenas para {{nome}}, {{data}}, {{carga_horaria}}
      - Use o nome FIXO do curso: "${requisitosParaGeracao.curso}"
      - Use o nome e cargo FIXOS da assinatura: "${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.nome : 'Nome do Assinante'}" e "${requisitosParaGeracao.assinante ? requisitosParaGeracao.assinante.cargo : 'Cargo do Assinante'}"
      - IMPLEMENTE as imagens fornecidas (logo e textura de fundo)
      - NÃO aplique overlay automático na textura de fundo - use como está
      - SEMPRE mantenha as cores solicitadas pelo usuário: ${requisitosParaGeracao.cores.join(', ')}
      - A textura de fundo deve complementar, não substituir, as cores principais
      - Linha de assinatura deve ter tamanho APROPRIADO (não gigante)
      - O certificado deve ser RESPONSIVO e caber naturalmente na área de preview
      - Use width: 100%, max-width: 700px e aspect-ratio: 1.414
      - Se o usuário pediu "estilo tech, cores escuras com fonte branca", NÃO gere "cores azul e cinza"
      - Use as informações capturadas corretamente

      Gere HTML VÁLIDO, LIMPO e PRONTO para uso, com design profissional, layout horizontal centralizado, estrutura de frase destacada, assinatura fixa, imagens implementadas corretamente, SEM overlay automático, SEMPRE mantendo as cores solicitadas pelo usuário e certificado RESPONSIVO que caiba naturalmente na área de preview.`;

      console.log('📝 PROMPT ENVIADO PARA GERAÇÃO:', promptContent);

      const result = await client.AI_GENERATE_OBJECT({
        messages: [
          {
            role: "system",
            content: promptContent
          }
        ],
        schema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "HTML completo do template de certificado com CSS inline e design profissional"
            },
            nome: {
              type: "string",
              description: "Nome sugerido para o template baseado nos requisitos"
            },
            descricao: {
              type: "string",
              description: "Descrição detalhada do template criado, incluindo características de design e assinatura"
            }
          },
          required: ["html", "nome", "descricao"]
        },
        temperature: 0.7,
        maxTokens: 4000
      });

      console.log('🤖 RESULTADO DA GERAÇÃO:', result);

      clearInterval(progressInterval);
      setGenerationProgress("Template gerado com sucesso!");

      if (result.object) {
        const html = result.object.html as string;
        const nome = result.object.nome as string;
        const descricao = result.object.descricao as string;
        
        console.log('📄 HTML GERADO:', html);
        console.log('🏷️ NOME DO TEMPLATE:', nome);
        console.log('📝 DESCRIÇÃO:', descricao);
        
        if (!html || html.trim() === "") {
          throw new Error("IA não retornou HTML válido");
        }
        
        setGeneratedHTML(html);
        setTemplateName(nome || "Novo Template");
        setConversationPhase("complete");
        
        // Adicionar mensagem de sucesso
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: `🎉 Perfeito! Criei seu template personalizado baseado em suas especificações:\n\n**Nome:** ${nome}\n**Descrição:** ${descricao}\n\nO template está pronto para visualização e pode ser salvo.`,
          timestamp: new Date(),
        }]);
      } else {
        console.log('❌ AI NÃO RETORNOU OBJETO VÁLIDO NA GERAÇÃO');
        throw new Error("IA não retornou dados válidos");
      }
    } catch (error) {
      console.error("Erro ao gerar template:", error);
      clearInterval(progressInterval);
      setGenerationProgress("Erro na geração do template");
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `❌ Desculpe, tive um problema ao gerar o template: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nPode tentar novamente ou reformular suas especificações?`,
        timestamp: new Date(),
      }]);
      
      // Voltar para fase de coleta em caso de erro
      setConversationPhase("collecting");
    } finally {
      setIsGeneratingTemplate(false);
      setTimeout(() => setGenerationProgress(""), 3000); // Limpar mensagem de progresso
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !generatedHTML.trim()) {
      toast.error("Nome e HTML são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      await salvarTemplateMutation.mutateAsync({
        nome: templateName.trim(),
        html: generatedHTML,
        turmaId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            {getPhaseIndicator()}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex gap-6 h-[calc(95vh-120px)]">
          {/* Chat com IA - Largura fixa */}
          <div className="w-96 flex-shrink-0 flex flex-col border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="https://assets.decocache.com/starting/3c65b809-2b99-4fa1-9aae-a954b5f9b326/agent_certify2.svg" 
                  alt="Agente Certify" 
                  className="w-12 h12 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">Agente Certify </h3>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Loading state inicial */}
              {isInitializing && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 truncate">Inicializando...</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  {message.role === "user" ? (
                    <div className="flex-1 flex justify-end">
                      <div className="bg-[#F4F4F4] rounded-lg px-4 py-2 max-w-[85%]">
                        <p className="text-gray-900 break-words leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.content.split('\n').map((line, index) => {
                          if (line.includes('**')) {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <div key={index} className="break-words leading-relaxed">
                                {parts.map((part, partIndex) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIndex} className="font-bold break-words">{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={partIndex} className="break-words">{part}</span>;
                                })}
                              </div>
                            );
                          }
                          if (line.startsWith('• ')) {
                            return <div key={index} className="flex items-start gap-2 mt-1">
                              <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                              <span className="break-words leading-relaxed">{line.slice(2)}</span>
                            </div>;
                          }
                          if (line.trim() === '') {
                            return <div key={index} className="h-2"></div>;
                          }
                          return <div key={index} className="break-words leading-relaxed">{line}</div>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading state com bolinhas */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 truncate">Digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isGenerating}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
                  className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de Preview/Code - Layout limpo e funcional */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header com botões */}
            <div className="flex items-center justify-between mb-4 px-2 flex-shrink-0">
              <h3 className="text-lg font-semibold">Preview do Template</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant={viewMode === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("code")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Código
                </Button>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-h-0">
              {/* Estado de Loading/Geração */}
              {isGeneratingTemplate && (
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="w-full h-96 flex items-center justify-center">
                    <UnicornLoading message="Gerando Template..." fullScreen={false} />
                  </div>
                  <div className="mt-4 text-center">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Gerando Template...</h4>
                    <p className="text-gray-600 text-center max-w-md">{generationProgress}</p>
                  </div>
                </div>
              )}

              {/* Preview do Template */}
              {!isGeneratingTemplate && generatedHTML && viewMode === "preview" && (
                <div className="h-full flex flex-col bg-white border rounded-lg">
                  {/* Área de Preview - Ocupando espaço disponível */}
                  <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center overflow-auto">
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          maxWidth: '1200px',
                          width: '95%',
                          aspectRatio: '1.414'
                        }}
                        dangerouslySetInnerHTML={{ __html: generatedHTML }}
                      />
                    </div>
                  </div>

                  {/* Área de Salvar Template - Sempre visível */}
                  {conversationPhase === "complete" && (
                    <div className="p-6 bg-white border-t flex-shrink-0">
                      <h4 className="font-semibold text-gray-900 mb-4">Salvar Template</h4>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label htmlFor="templateName" className="text-sm font-medium text-gray-700 mb-2 block">
                            Nome do Template
                          </Label>
                          <Input
                            id="templateName"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Digite um nome para o template"
                            className="w-full"
                          />
                        </div>
                        <Button
                          onClick={handleSaveTemplate}
                          disabled={!templateName.trim() || isSaving}
                          className="px-6"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Template
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Código HTML */}
              {!isGeneratingTemplate && generatedHTML && viewMode === "code" && (
                <div className="h-full bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">{generatedHTML}</pre>
                </div>
              )}

              {/* Estado Inicial */}
              {!isGeneratingTemplate && !generatedHTML && (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Template não gerado ainda</h4>
                  <p className="text-gray-600 text-center max-w-md">
                    Continue conversando com a IA para coletar as informações necessárias. 
                    Quando estiver pronto, ela gerará seu template personalizado aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
