/**
 * Runs-related tools for managing certificate generation processes.
 *
 * This file contains all tools related to runs operations including:
 * - Creating runs for certificate generation
 * - Listing runs by turma
 * - Updating run status
 * - Deleting runs
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db.ts";
import {
  certificadosTable,
  campanhasEmailTable,
  csvsTable,
  logsEmailTable,
  runsTable,
  templatesTable,
  turmasTable,
} from "../schema.ts";
import type { Env } from "../main.ts";

export const createCriarRunTool = (env: Env) =>
  createPrivateTool({
    id: "CRIAR_RUN",
    description: "Create a new run for certificate generation",
    inputSchema: z.object({
      turmaId: z.number(),
      nome: z.string(),
      templateId: z.number(),
      csvId: z.number(),
      nameColumn: z.string(),
      emailColumn: z.string(),
    }),
    outputSchema: z.object({
      id: z.number(),
      turmaId: z.number(),
      nome: z.string(),
      templateId: z.number(),
      csvId: z.number(),
      nameColumn: z.string(),
      emailColumn: z.string().nullable(),
      status: z.string(),
      totalAlunos: z.number(),
      certificadosGerados: z.number(),
      criadoEm: z.string(),
      iniciadoEm: z.string().nullable(),
      concluidoEm: z.string().nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Verify turma exists
        const turmas = await db.select()
          .from(turmasTable)
          .where(eq(turmasTable.id, context.turmaId))
          .limit(1);

        if (turmas.length === 0) {
          throw new Error("Turma not found");
        }

        // Verify template exists
        const templates = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.id, context.templateId))
          .limit(1);

        if (templates.length === 0) {
          throw new Error("Template not found");
        }

        // Verify CSV exists and count students
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.csvId))
          .limit(1);

        if (csvs.length === 0) {
          throw new Error("CSV not found");
        }

        const csv = csvs[0];
        // As colunas são salvas como string separada por vírgulas, não JSON
        const colunas = csv.colunas.split(",").map((col) => col.trim());

        if (!colunas.includes(context.nameColumn)) {
          throw new Error(`Column '${context.nameColumn}' not found in CSV`);
        }

        // Count total students (lines in CSV minus header)
        // Os dados são salvos como string CSV, não JSON
        const linhas = csv.dados.trim().split("\n");
        const totalAlunos = linhas.length - 1; // Subtract header row

        const agora = new Date();
        const newRun = await db.insert(runsTable).values({
          turmaId: context.turmaId,
          nome: context.nome,
          templateId: context.templateId,
          csvId: context.csvId,
          nameColumn: context.nameColumn,
          emailColumn: context.emailColumn,
          status: "pending",
          totalAlunos,
          certificadosGerados: 0,
          criadoEm: agora,
          iniciadoEm: null,
          concluidoEm: null,
        }).returning({
          id: runsTable.id,
          turmaId: runsTable.turmaId,
          nome: runsTable.nome,
          templateId: runsTable.templateId,
          csvId: runsTable.csvId,
          nameColumn: runsTable.nameColumn,
          emailColumn: runsTable.emailColumn,
          status: runsTable.status,
          totalAlunos: runsTable.totalAlunos,
          certificadosGerados: runsTable.certificadosGerados,
          criadoEm: runsTable.criadoEm,
          iniciadoEm: runsTable.iniciadoEm,
          concluidoEm: runsTable.concluidoEm,
        });

        const run = newRun[0];
        return {
          id: run.id,
          turmaId: run.turmaId,
          nome: run.nome,
          templateId: run.templateId,
          csvId: run.csvId,
          nameColumn: run.nameColumn,
          emailColumn: run.emailColumn,
          status: run.status,
          totalAlunos: run.totalAlunos,
          certificadosGerados: run.certificadosGerados,
          criadoEm: run.criadoEm?.toISOString() || agora.toISOString(),
          iniciadoEm: run.iniciadoEm?.toISOString() || null,
          concluidoEm: run.concluidoEm?.toISOString() || null,
        };
      } catch (error) {
        console.error("Error creating run:", error);
        throw new Error("Failed to create run");
      }
    },
  });

export const createListarRunsTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_RUNS",
    description: "List all runs for a specific turma",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      runs: z.array(z.object({
        id: z.number(),
        turmaId: z.number(),
        nome: z.string(),
        templateId: z.number(),
        csvId: z.number(),
        nameColumn: z.string(),
        status: z.string(),
        totalAlunos: z.number(),
        certificadosGerados: z.number(),
        criadoEm: z.string(),
        iniciadoEm: z.string().nullable(),
        concluidoEm: z.string().nullable(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const runs = await db.select()
          .from(runsTable)
          .where(eq(runsTable.turmaId, context.turmaId))
          .orderBy(runsTable.criadoEm);

        return {
          runs: runs.map((run) => ({
            id: run.id,
            turmaId: run.turmaId,
            nome: run.nome,
            templateId: run.templateId,
            csvId: run.csvId,
            nameColumn: run.nameColumn,
            status: run.status,
            totalAlunos: run.totalAlunos,
            certificadosGerados: run.certificadosGerados,
            criadoEm: run.criadoEm?.toISOString() || new Date().toISOString(),
            iniciadoEm: run.iniciadoEm?.toISOString() || null,
            concluidoEm: run.concluidoEm?.toISOString() || null,
          })),
        };
      } catch (error) {
        console.error("Error listing runs:", error);
        throw new Error("Failed to list runs");
      }
    },
  });

export const createBuscarRunPorIdTool = (env: Env) =>
  createPrivateTool({
    id: "BUSCAR_RUN_POR_ID",
    description: "Get a specific run by ID",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      run: z.object({
        id: z.number(),
        turmaId: z.number(),
        nome: z.string(),
        templateId: z.number(),
        csvId: z.number(),
        nameColumn: z.string(),
        status: z.string(),
        totalAlunos: z.number(),
        certificadosGerados: z.number(),
        criadoEm: z.string(),
        iniciadoEm: z.string().nullable(),
        concluidoEm: z.string().nullable(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const runs = await db.select()
          .from(runsTable)
          .where(eq(runsTable.id, context.id))
          .limit(1);

        if (runs.length === 0) {
          throw new Error("Run not found");
        }

        const run = runs[0];
        return {
          run: {
            id: run.id,
            turmaId: run.turmaId,
            nome: run.nome,
            templateId: run.templateId,
            csvId: run.csvId,
            nameColumn: run.nameColumn,
            status: run.status,
            totalAlunos: run.totalAlunos,
            certificadosGerados: run.certificadosGerados,
            criadoEm: run.criadoEm?.toISOString() || new Date().toISOString(),
            iniciadoEm: run.iniciadoEm?.toISOString() || null,
            concluidoEm: run.concluidoEm?.toISOString() || null,
          },
        };
      } catch (error) {
        console.error("Error finding run:", error);
        throw new Error("Failed to find run");
      }
    },
  });

export const createAtualizarRunTool = (env: Env) =>
  createPrivateTool({
    id: "ATUALIZAR_RUN",
    description: "Update run status and progress",
    inputSchema: z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "completed", "error"])
        .optional(),
      certificadosGerados: z.number().optional(),
      iniciadoEm: z.string().optional(),
      concluidoEm: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      status: z.string(),
      certificadosGerados: z.number(),
      iniciadoEm: z.string().nullable(),
      concluidoEm: z.string().nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Check if run exists
        const existing = await db.select()
          .from(runsTable)
          .where(eq(runsTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Run not found");
        }

        const updateData: any = {};

        if (context.status !== undefined) updateData.status = context.status;
        if (context.certificadosGerados !== undefined) {
          updateData.certificadosGerados = context.certificadosGerados;
        }
        if (context.iniciadoEm !== undefined) {
          updateData.iniciadoEm = context.iniciadoEm
            ? new Date(context.iniciadoEm)
            : null;
        }
        if (context.concluidoEm !== undefined) {
          updateData.concluidoEm = context.concluidoEm
            ? new Date(context.concluidoEm)
            : null;
        }

        const updated = await db.update(runsTable)
          .set(updateData)
          .where(eq(runsTable.id, context.id))
          .returning({
            id: runsTable.id,
            status: runsTable.status,
            certificadosGerados: runsTable.certificadosGerados,
            iniciadoEm: runsTable.iniciadoEm,
            concluidoEm: runsTable.concluidoEm,
          });

        const run = updated[0];
        return {
          id: run.id,
          status: run.status,
          certificadosGerados: run.certificadosGerados,
          iniciadoEm: run.iniciadoEm?.toISOString() || null,
          concluidoEm: run.concluidoEm?.toISOString() || null,
        };
      } catch (error) {
        console.error("Error updating run:", error);
        throw new Error("Failed to update run");
      }
    },
  });

export const createDeletarRunTool = (env: Env) =>
  createPrivateTool({
    id: "DELETAR_RUN",
    description: "Delete a run and all associated certificates and email campaigns",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedId: z.number(),
      deletedCertificates: z.number(),
      deletedCampaigns: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Check if run exists
        const existing = await db.select()
          .from(runsTable)
          .where(eq(runsTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Run not found");
        }

        console.log(`Starting delete process for run ${context.id}`);

        // Count existing related data before deleting
        const campaigns = await db.select({ id: campanhasEmailTable.id })
          .from(campanhasEmailTable)
          .where(eq(campanhasEmailTable.runId, context.id));
        
        const certificates = await db.select({ id: certificadosTable.id })
          .from(certificadosTable)
          .where(eq(certificadosTable.runId, context.id));

        console.log(`Found ${campaigns.length} campaigns and ${certificates.length} certificates to delete`);

        // Start with a simple approach - no transaction first to identify issue
        try {
          // For each campaign, delete related logs first
          for (const campaign of campaigns) {
            try {
              await db.delete(logsEmailTable)
                .where(eq(logsEmailTable.campanhaId, campaign.id));
              console.log(`Deleted logs for campaign ${campaign.id}`);
            } catch (logError) {
              console.log(`No logs found for campaign ${campaign.id} or already deleted`);
            }
          }

          // Delete email campaigns
          if (campaigns.length > 0) {
            await db.delete(campanhasEmailTable)
              .where(eq(campanhasEmailTable.runId, context.id));
            console.log(`Deleted ${campaigns.length} campaigns`);
          }

          // Delete certificates 
          if (certificates.length > 0) {
            await db.delete(certificadosTable)
              .where(eq(certificadosTable.runId, context.id));
            console.log(`Deleted ${certificates.length} certificates`);
          }

          // Finally, delete the run itself
          await db.delete(runsTable)
            .where(eq(runsTable.id, context.id));
          
          console.log(`Successfully deleted run ${context.id}`);

        } catch (deleteError) {
          console.error(`Error during delete operations:`, deleteError);
          throw deleteError;
        }

        return {
          success: true,
          deletedId: context.id,
          deletedCertificates: certificates.length,
          deletedCampaigns: campaigns.length,
        };
      } catch (error) {
        console.error("Error deleting run:", error);
        throw new Error(`Failed to delete run: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

export const createExecutarRunTool = (env: Env) =>
  createPrivateTool({
    id: "EXECUTAR_RUN",
    description: "Execute a run to generate certificates",
    inputSchema: z.object({
      runId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      certificadosGerados: z.number(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Buscar a run
        const runs = await db.select()
          .from(runsTable)
          .where(eq(runsTable.id, context.runId))
          .limit(1);

        if (runs.length === 0) {
          throw new Error("Run not found");
        }

        const run = runs[0];

        // Verificar se a run já foi executada
        if (run.status === "completed" || run.status === "processing") {
          throw new Error("Run already executed or in progress");
        }

        // Buscar CSV
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, run.csvId))
          .limit(1);

        if (csvs.length === 0) {
          throw new Error("CSV not found");
        }

        const csv = csvs[0];

        // Buscar Template
        const templates = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.id, run.templateId))
          .limit(1);

        if (templates.length === 0) {
          throw new Error("Template not found");
        }

        const template = templates[0];

        // Atualizar status da run para processing
        await db.update(runsTable)
          .set({
            status: "processing",
            iniciadoEm: new Date(),
          })
          .where(eq(runsTable.id, context.runId));

        // Processar cada linha do CSV
        const linhas = csv.dados.trim().split("\n");
        const colunas = csv.colunas.split(",").map((col) => col.trim());

        // Encontrar índice da coluna do nome
        const nameColumnIndex = colunas.indexOf(run.nameColumn);
        const emailColumnIndex = run.emailColumn
          ? colunas.indexOf(run.emailColumn)
          : -1;
        if (nameColumnIndex === -1) {
          throw new Error(`Column '${run.nameColumn}' not found in CSV`);
        } else if (emailColumnIndex === -1) {
          throw new Error(`Column '${run.emailColumn}' not found in CSV`);
        }

        let certificadosGerados = 0;

        // Processar cada linha (pular cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
          const linha = linhas[i];
          if (!linha.trim()) continue;

          const valores = linha.split(",").map((val) =>
            val.trim().replace(/"/g, "")
          );
          const nome = valores[nameColumnIndex];
          const email = valores[emailColumnIndex];
          if (!nome || nome === "") continue;
          if (!email || email === "") continue;

          try {
            // Substituir placeholders pelos dados reais
            let htmlProcessado = template.html
              .replace(/\{\{name\}\}/g, nome)
              .replace(/\{\{nome\}\}/g, nome);

            // Substituir outros campos do CSV se existirem
            colunas.forEach((coluna, index) => {
              const valor = valores[index] || "";
              const placeholder = `{{${coluna}}}`;
              htmlProcessado = htmlProcessado.replace(
                new RegExp(placeholder, "g"),
                valor,
              );
            });

            // Criar certificado com HTML processado
            await db.insert(certificadosTable).values({
              id: crypto.randomUUID(),
              runId: run.id,
              turmaId: run.turmaId,
              templateId: run.templateId,
              csvId: run.csvId,
              linhaIndex: i - 1, // -1 porque pulamos o cabeçalho
              dados: JSON.stringify(valores), // Salvar como JSON string
              nome: nome,
              status: "completed",
              html: htmlProcessado, // HTML processado e personalizado
              generateUrl: `https://deco.chat/deco-camp-certificados/${i}`, // URL para visualização
              verificadoEm: null,
              emailEnviado: false,
              emailDestinatario: email,
              criadoEm: new Date(),
            });

            certificadosGerados++;
          } catch (error) {
            console.error(`Erro ao criar certificado para linha ${i}:`, error);
            // Continuar com o próximo
          }
        }

        // Atualizar status da run
        const statusFinal = certificadosGerados > 0 ? "completed" : "error";
        await db.update(runsTable)
          .set({
            status: statusFinal,
            certificadosGerados,
            concluidoEm: new Date(),
          })
          .where(eq(runsTable.id, context.runId));

        return {
          success: true,
          certificadosGerados,
          message:
            `Run executada com sucesso! ${certificadosGerados} certificados gerados.`,
        };
      } catch (error) {
        console.error("Error executing run:", error);

        // Atualizar status da run para error
        try {
          await db.update(runsTable)
            .set({
              status: "error",
              concluidoEm: new Date(),
            })
            .where(eq(runsTable.id, context.runId));
        } catch (updateError) {
          console.error("Error updating run status:", updateError);
        }

        throw new Error(
          `Failed to execute run: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  });

// Export all runs-related tools
export const runsTools = [
  createCriarRunTool,
  createListarRunsTool,
  createBuscarRunPorIdTool,
  createAtualizarRunTool,
  createDeletarRunTool,
  createExecutarRunTool,
];
