/**
 * Email-related tools for managing email campaigns and sending certificates.
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { 
  campanhasEmailTable, 
  runsTable, 
  certificadosTable,
  csvsTable 
} from "../schema.ts";

export const createCriarCampanhaEmailTool = (env: Env) =>
  createPrivateTool({
    id: "CRIAR_CAMPANHA_EMAIL",
    description: "Criar uma nova campanha de email para envio de certificados",
    inputSchema: z.object({
      turmaId: z.number(),
      runId: z.number(),
      nome: z.string(),
      assunto: z.string(),
      mensagem: z.string(),
      templateHtml: z.string().optional(),
      tipoTemplate: z.enum(["texto", "html"]).default("texto"),
    }),
    outputSchema: z.object({
      campanhaId: z.number(),
      success: z.boolean(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const run = await db.select()
          .from(runsTable)
          .where(eq(runsTable.id, context.runId))
          .limit(1);

        if (run.length === 0) {
          throw new Error("Run não encontrada");
        }

        if (run[0].status !== "completed") {
          throw new Error("A run deve estar completa para criar campanha de email");
        }

        const certificados = await db.select()
          .from(certificadosTable)
          .where(and(
            eq(certificadosTable.runId, context.runId),
            eq(certificadosTable.status, "completed")
          ));

        if (certificados.length === 0) {
          throw new Error("Nenhum certificado gerado para esta run");
        }

        const novaCampanha = await db.insert(campanhasEmailTable).values({
          turmaId: context.turmaId,
          runId: context.runId,
          nome: context.nome,
          assunto: context.assunto,
          mensagem: context.mensagem,
          templateHtml: context.templateHtml,
          tipoTemplate: context.tipoTemplate,
          status: "draft",
          totalEmails: certificados.length,
          emailsEnviados: 0,
          criadoEm: new Date(),
        }).returning({ id: campanhasEmailTable.id });

        return {
          campanhaId: novaCampanha[0].id,
          success: true,
          message: `Campanha criada com sucesso. ${certificados.length} emails serão enviados.`,
        };
      } catch (error) {
        console.error("Erro ao criar campanha:", error);
        throw new Error(`Erro ao criar campanha: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

export const createListarCampanhasEmailTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_CAMPANHAS_EMAIL",
    description: "Listar todas as campanhas de email de uma turma",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      campanhas: z.array(z.object({
        id: z.number(),
        turmaId: z.number(),
        runId: z.number(),
        nome: z.string(),
        assunto: z.string(),
        mensagem: z.string(),
        templateHtml: z.string().nullable(),
        tipoTemplate: z.string(),
        status: z.string(),
        totalEmails: z.number(),
        emailsEnviados: z.number(),
        criadoEm: z.string(),
        iniciadoEm: z.string().nullable(),
        concluidoEm: z.string().nullable(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const campanhas = await db.select()
          .from(campanhasEmailTable)
          .where(eq(campanhasEmailTable.turmaId, context.turmaId));

        return {
          campanhas: campanhas.map(campanha => ({
            id: campanha.id,
            turmaId: campanha.turmaId,
            runId: campanha.runId,
            nome: campanha.nome,
            assunto: campanha.assunto,
            mensagem: campanha.mensagem,
            templateHtml: campanha.templateHtml,
            tipoTemplate: campanha.tipoTemplate || "texto",
            status: campanha.status || "draft",
            totalEmails: campanha.totalEmails,
            emailsEnviados: campanha.emailsEnviados,
            criadoEm: campanha.criadoEm.toISOString(),
            iniciadoEm: campanha.iniciadoEm?.toISOString() || null,
            concluidoEm: campanha.concluidoEm?.toISOString() || null,
          })),
        };
      } catch (error) {
        console.error("Erro ao listar campanhas:", error);
        throw new Error(`Erro ao listar campanhas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

export const createBuscarRunsCompletasEmailTool = (env: Env) =>
  createPrivateTool({
    id: "BUSCAR_RUNS_COMPLETAS_EMAIL",
    description: "Buscar runs completas de uma turma para criação de campanhas de email",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      runs: z.array(z.object({
        id: z.number(),
        nome: z.string(),
        totalAlunos: z.number(),
        certificadosGerados: z.number(),
        concluidoEm: z.string().nullable(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const runs = await db.select()
          .from(runsTable)
          .where(and(
            eq(runsTable.turmaId, context.turmaId),
            eq(runsTable.status, "completed")
          ));

        return {
          runs: runs.map(run => ({
            id: run.id,
            nome: run.nome,
            totalAlunos: run.totalAlunos,
            certificadosGerados: run.certificadosGerados,
            concluidoEm: run.concluidoEm?.toISOString() || null,
          })),
        };
      } catch (error) {
        console.error("Erro ao buscar runs completas:", error);
        throw new Error(`Erro ao buscar runs completas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

export const createEnviarCampanhaEmailTool = (env: Env) =>
  createPrivateTool({
    id: "ENVIAR_CAMPANHA_EMAIL",
    description: "Enviar emails de uma campanha usando Resend",
    inputSchema: z.object({
      campanhaId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      emailsEnviados: z.number(),
      emailsFalharam: z.number(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Buscar a campanha
        const campanha = await db.select()
          .from(campanhasEmailTable)
          .where(eq(campanhasEmailTable.id, context.campanhaId))
          .limit(1);

        if (campanha.length === 0) {
          throw new Error("Campanha não encontrada");
        }

        const campanhaData = campanha[0];

        if (campanhaData.status === "completed") {
          throw new Error("Campanha já foi enviada");
        }

        // Marcar campanha como enviando
        await db.update(campanhasEmailTable)
          .set({ 
            status: "sending",
            iniciadoEm: new Date(),
          })
          .where(eq(campanhasEmailTable.id, context.campanhaId));

        // Buscar certificados da run
        const certificados = await db.select()
          .from(certificadosTable)
          .where(and(
            eq(certificadosTable.runId, campanhaData.runId),
            eq(certificadosTable.status, "completed")
          ));

        let emailsEnviados = 0;
        let emailsFalharam = 0;

    
        // Enviar emails
        for (const certificado of certificados) {
          if (!certificado.emailDestinatario) {
            console.warn(`Certificado ${certificado.id} não tem email destinatário`);
            emailsFalharam++;
            continue;
          }

          try {
            // Processar placeholders na mensagem
            let mensagemProcessada = campanhaData.mensagem;
            let templateHtmlProcessado = campanhaData.templateHtml || null;
            let assuntoProcessado = campanhaData.assunto;

            // Dados do certificado
            const dadosCertificado = JSON.parse(certificado.dados || "{}");
            
            // Função para substituir placeholders
            const substituirPlaceholders = (texto: string) => {
              return texto
                .replace(/@nome/g, certificado.nome || dadosCertificado.nome || "")
                .replace(/@email/g, certificado.emailDestinatario)
                .replace(/@link_certificado/g, `https://deco.chat/deco-camp-certificados/${certificado.id}`);
            };

            // Substituir placeholders básicos
            mensagemProcessada = substituirPlaceholders(mensagemProcessada);
            assuntoProcessado = substituirPlaceholders(assuntoProcessado);
            if (templateHtmlProcessado) {
              templateHtmlProcessado = substituirPlaceholders(templateHtmlProcessado);
            }

            // Buscar dados do CSV se necessário (para placeholders adicionais)
            if (certificado.csvId) {
              try {
                const csv = await db.select()
                  .from(csvsTable)
                  .where(eq(csvsTable.id, certificado.csvId))
                  .limit(1);

                if (csv.length > 0 && csv[0].dados) {
                  try {
                    const dadosCsv = JSON.parse(csv[0].dados);
                    if (Array.isArray(dadosCsv) && dadosCsv[certificado.linhaIndex]) {
                      const linhaCsv = dadosCsv[certificado.linhaIndex];
                      
                      Object.keys(linhaCsv).forEach(coluna => {
                        const placeholder = `@${coluna}`;
                        const valor = String(linhaCsv[coluna] || "");
                        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                        
                        mensagemProcessada = mensagemProcessada.replace(regex, valor);
                        assuntoProcessado = assuntoProcessado.replace(regex, valor);
                        if (templateHtmlProcessado) {
                          templateHtmlProcessado = templateHtmlProcessado.replace(regex, valor);
                        }
                      });
                    }
                  } catch (jsonError) {
                    console.warn(`Erro ao fazer parse dos dados do CSV ID ${certificado.csvId}:`, jsonError);
                  }
                }
              } catch (csvError) {
                console.warn(`Erro ao buscar CSV ID ${certificado.csvId}:`, csvError);
              }
            }

            // Determinar conteúdo do email baseado no tipo de template
            const emailContent = {
              from: "Deco Camp <daniel@deco.chat>",
              to: certificado.emailDestinatario,
              subject: assuntoProcessado,
              html: templateHtmlProcessado || mensagemProcessada.replace(/\n/g, '<br>'),
              text: mensagemProcessada,
            };

            // Enviar email via Resend
            const emailResult = await env.RESEND["resend-actions-emails-send-ts"](emailContent);

            emailsEnviados++;

            // Marcar certificado como email enviado
            await db.update(certificadosTable)
              .set({ 
                emailEnviado: true,
              })
              .where(eq(certificadosTable.id, certificado.id));

          } catch (emailError) {
            console.error(`Erro ao enviar email para ${certificado.emailDestinatario}:`, emailError);
            emailsFalharam++;
          }
        }

        // Atualizar campanha como completa
        await db.update(campanhasEmailTable)
          .set({ 
            status: emailsFalharam === 0 ? "completed" : "error",
            emailsEnviados: emailsEnviados,
            concluidoEm: new Date(),
          })
          .where(eq(campanhasEmailTable.id, context.campanhaId));

        return {
          success: true,
          emailsEnviados,
          emailsFalharam,
          message: `Campanha processada: ${emailsEnviados} emails enviados, ${emailsFalharam} falharam.`,
        };

      } catch (error) {
        console.error("Erro ao enviar campanha:", error);
        
        // Marcar campanha como erro
        await db.update(campanhasEmailTable)
          .set({ 
            status: "error",
            concluidoEm: new Date(),
          })
          .where(eq(campanhasEmailTable.id, context.campanhaId));

        throw new Error(`Erro ao enviar campanha: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

export const createDeletarCampanhaEmailTool = (env: Env) =>
  createPrivateTool({
    id: "DELETAR_CAMPANHA_EMAIL",
    description: "Deletar uma campanha de email",
    inputSchema: z.object({
      campanhaId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Verificar se a campanha existe
        const campanha = await db.select()
          .from(campanhasEmailTable)
          .where(eq(campanhasEmailTable.id, context.campanhaId))
          .limit(1);

        if (campanha.length === 0) {
          throw new Error("Campanha não encontrada");
        }

        const campanhaData = campanha[0];

        // Não permitir deletar campanhas que estão sendo enviadas
        if (campanhaData.status === "sending") {
          throw new Error("Não é possível deletar uma campanha que está sendo enviada");
        }

        // Deletar a campanha
        await db.delete(campanhasEmailTable)
          .where(eq(campanhasEmailTable.id, context.campanhaId));

        return {
          success: true,
          message: "Campanha deletada com sucesso",
        };
      } catch (error) {
        console.error("Erro ao deletar campanha:", error);
        throw new Error(`Erro ao deletar campanha: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

export const emailsTools = [
  createCriarCampanhaEmailTool,
  createListarCampanhasEmailTool,
  createEnviarCampanhaEmailTool,
  createBuscarRunsCompletasEmailTool,
  createDeletarCampanhaEmailTool,
];
