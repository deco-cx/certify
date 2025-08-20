# 🎓 Decofier - Sistema de Certificados Digitais

Uma plataforma completa para geração, gerenciamento e verificação de certificados digitais com templates HTML personalizáveis, construída com Deco + Cloudflare Workers.

## ✨ Funcionalidades Principais

- **Templates HTML Personalizáveis**: Crie certificados únicos com HTML e CSS
- **Processamento em Lote**: Gere centenas de certificados simultaneamente via CSV
- **Verificação Online**: Sistema de verificação oficial com URLs únicas
- **Gerenciamento de Turmas**: Organize projetos por turmas e classes
- **Envio de Emails**: Sistema integrado para envio automático de certificados
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos

## 🚀 Como Usar

### 1. **Criar Turma**
- Acesse a seção "Turmas" e crie uma nova turma para seu projeto

### 2. **Upload de Template HTML**
- Faça upload de um arquivo HTML com placeholders como `{{name}}`
- O sistema substituirá automaticamente os placeholders pelos dados dos alunos

### 3. **Upload de CSV**
- Envie um arquivo CSV com os dados dos alunos
- Especifique qual coluna contém o nome do aluno

### 4. **Geração Automática**
- Execute a geração em lote
- O sistema criará certificados únicos para cada aluno

### 5. **Verificação Online**
- Cada certificado recebe uma URL única para verificação oficial
- Os certificados podem ser compartilhados e verificados online

## 📋 Estrutura do Projeto

```
Decofier/
├── server/           # Backend Deco + Cloudflare Workers
│   ├── tools/        # Ferramentas MCP para operações
│   ├── workflows/    # Fluxos de trabalho automatizados
│   ├── schema.ts     # Schema do banco SQLite (Drizzle)
│   └── main.ts       # Servidor principal
├── view/             # Frontend React + Tailwind CSS
│   ├── src/          # Código fonte React
│   ├── components/   # Componentes UI reutilizáveis
│   └── routes/       # Rotas da aplicação
└── public/           # Arquivos estáticos
```

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, TanStack Router
- **Backend**: Deco MCP Server, Cloudflare Workers
- **Database**: SQLite com Drizzle ORM
- **UI**: shadcn/ui components, Lucide React icons
- **Deploy**: Cloudflare Workers

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- **Desktop**: Interface completa com todas as funcionalidades
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Interface otimizada para smartphones

## 🔐 Verificação de Autenticidade

Cada certificado possui:
- **URL Única**: Link oficial para verificação
- **Verificação Online**: Sistema de validação em tempo real
- **Histórico de Verificações**: Rastreamento de quando foi verificado

## 📧 Sistema de Emails

- **Templates Personalizáveis**: Configure assunto, corpo e assinatura
- **Envio Automático**: Sistema integrado para envio em massa
- **Rastreamento**: Controle de quais emails foram enviados

## 🚀 Deploy

O projeto está configurado para deploy automático no Cloudflare Workers:

1. **Cloudflare Workers**: Backend serverless com banco de dados SQLite
2. **Deco Platform**: Integração com ecossistema Deco para AI e ferramentas
3. **Storage**: Sistema de arquivos integrado ao Cloudflare

## 🎯 Desenvolvimento

### Comandos Disponíveis

- `npm run dev` - Inicia o ambiente de desenvolvimento
- `npm run gen` - Gera tipos para integrações Deco
- `npm run gen:self` - Gera tipos para suas próprias tools/workflows
- `npm run deploy` - Deploy para produção

### Estrutura de Domínios

O projeto segue uma arquitetura baseada em domínios:
- **Turmas**: Gerenciamento de classes educacionais
- **Templates**: Gerenciamento de modelos HTML
- **CSVs**: Processamento de dados em lote
- **Certificados**: Geração e verificação de certificados
- **Emails**: Sistema de campanhas e envio

## 📝 Licença

Este projeto é de uso interno e educacional.

---

**Decofier** - Transformando a forma como você gera e gerencia certificados digitais! 🎓✨
