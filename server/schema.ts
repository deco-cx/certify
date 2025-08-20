/**
 * This file is used to define the schema for the database.
 *
 * After making changes to this file, run `npm run db:generate` to generate the migration file.
 * Then, by just using the app, the migration is lazily ensured at runtime.
 */
import { integer, sqliteTable, text, real } from "@deco/workers-runtime/drizzle";

// Turmas para organizar os projetos
export const turmasTable = sqliteTable("turmas", {
  id: integer("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
  atualizadoEm: integer("atualizado_em", { mode: 'timestamp' }).notNull(),
});

// Templates HTML com placeholders
export const templatesTable = sqliteTable("templates", {
  id: integer("id").primaryKey(),
  turmaId: integer("turma_id").notNull().references(() => turmasTable.id),
  nome: text("nome").notNull(),
  arquivoUrl: text("arquivo_url").notNull(),
  arquivoId: text("arquivo_id"),
  tipo: text("tipo", { enum: ["html"] }),
  campos: text("campos"), // JSON string para os campos
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
  atualizadoEm: integer("atualizado_em", { mode: 'timestamp' }).notNull(),
});

// CSVs processados
export const csvsTable = sqliteTable("csvs", {
  id: integer("id").primaryKey(),
  turmaId: integer("turma_id").notNull().references(() => turmasTable.id),
  templateId: integer("template_id").references(() => templatesTable.id),
  nome: text("nome").notNull(),
  dados: text("dados").notNull(), // JSON string para os dados
  colunas: text("colunas").notNull(), // JSON string para as colunas
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
  processadoEm: integer("processado_em", { mode: 'timestamp' }),
});

// Runs de geração de certificados
export const runsTable = sqliteTable("runs", {
  id: integer("id").primaryKey(),
  turmaId: integer("turma_id").notNull().references(() => turmasTable.id),
  nome: text("nome").notNull(),
  templateId: integer("template_id").notNull().references(() => templatesTable.id),
  csvId: integer("csv_id").notNull().references(() => csvsTable.id),
  nameColumn: text("name_column").notNull(),
  status: text("status", { enum: ["pending", "processing", "completed", "error"] }).notNull(),
  totalAlunos: integer("total_alunos").notNull(),
  certificadosGerados: integer("certificados_gerados").notNull(),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
  iniciadoEm: integer("iniciado_em", { mode: 'timestamp' }),
  concluidoEm: integer("concluido_em", { mode: 'timestamp' }),
});

// Certificados gerados
export const certificadosTable = sqliteTable("certificados", {
  id: integer("id").primaryKey(),
  runId: integer("run_id").references(() => runsTable.id),
  turmaId: integer("turma_id").notNull().references(() => turmasTable.id),
  templateId: integer("template_id").notNull().references(() => templatesTable.id),
  csvId: integer("csv_id").notNull().references(() => csvsTable.id),
  linhaIndex: integer("linha_index").notNull(),
  dados: text("dados").notNull(), // JSON string para os dados
  nome: text("nome"),
  arquivoUrl: text("arquivo_url"),
  arquivoId: text("arquivo_id"),
  status: text("status", { enum: ["pending", "processing", "completed", "error"] }),
  generateUrl: text("generate_url"),
  verificadoEm: integer("verificado_em", { mode: 'timestamp' }),
  emailEnviado: integer("email_enviado", { mode: 'boolean' }),
  emailDestinatario: text("email_destinatario"),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
});

// Campanhas de email
export const campanhasEmailTable = sqliteTable("campanhas_email", {
  id: integer("id").primaryKey(),
  turmaId: integer("turma_id").notNull().references(() => turmasTable.id),
  runId: integer("run_id").notNull().references(() => runsTable.id),
  nome: text("nome").notNull(),
  assunto: text("assunto").notNull(),
  mensagem: text("mensagem").notNull(),
  status: text("status", { enum: ["draft", "sending", "completed", "error"] }).notNull(),
  totalEmails: integer("total_emails").notNull(),
  emailsEnviados: integer("emails_enviados").notNull(),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).notNull(),
  iniciadoEm: integer("iniciado_em", { mode: 'timestamp' }),
  concluidoEm: integer("concluido_em", { mode: 'timestamp' }),
});

// Log de emails enviados
export const logsEmailTable = sqliteTable("logs_email", {
  id: integer("id").primaryKey(),
  campanhaId: integer("campanha_id").notNull().references(() => campanhasEmailTable.id),
  certificadoId: integer("certificado_id").notNull().references(() => certificadosTable.id),
  emailDestinatario: text("email_destinatario").notNull(),
  assunto: text("assunto").notNull(),
  mensagem: text("mensagem").notNull(),
  status: text("status", { enum: ["sent", "failed", "bounced"] }).notNull(),
  resendId: text("resend_id"),
  erro: text("erro"),
  enviadoEm: integer("enviado_em", { mode: 'timestamp' }).notNull(),
});
