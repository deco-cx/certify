/**
 * CSVs-related tools for managing student data files.
 *
 * This file contains all tools related to CSV operations including:
 * - Creating new CSV records
 * - Listing CSVs by turma
 * - Updating CSV information
 * - Deleting CSVs
 * - Getting CSV details
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { csvsTable, turmasTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const createListarCSVsTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_CSVS",
    description: "List all CSVs for a specific turma",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      csvs: z.array(z.object({
        id: z.number(),
        turmaId: z.number(),
        templateId: z.number().nullable(),
        nome: z.string(),
        dados: z.string(),
        colunas: z.string(),
        criadoEm: z.string(),
        processadoEm: z.string().nullable(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.turmaId, context.turmaId))
          .orderBy(csvsTable.criadoEm);

        return {
          csvs: csvs.map((csv) => ({
            id: csv.id,
            turmaId: csv.turmaId,
            templateId: csv.templateId,
            nome: csv.nome,
            dados: csv.dados,
            colunas: csv.colunas,
            criadoEm: csv.criadoEm?.toISOString() || new Date().toISOString(),
            processadoEm: csv.processadoEm?.toISOString() || null,
          })),
        };
      } catch (error) {
        console.error("Error listing CSVs:", error);
        throw new Error("Failed to list CSVs");
      }
    },
  });

export const createBuscarCSVPorIdTool = (env: Env) =>
  createPrivateTool({
    id: "BUSCAR_CSV_POR_ID",
    description: "Get a specific CSV by its ID",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      csv: z.object({
        id: z.number(),
        turmaId: z.number(),
        templateId: z.number().nullable(),
        nome: z.string(),
        dados: z.string(),
        colunas: z.string(),
        criadoEm: z.string(),
        processadoEm: z.string().nullable(),
      }).nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.id))
          .limit(1);

        if (csvs.length === 0) {
          return { csv: null };
        }

        const csv = csvs[0];
        return {
          csv: {
            id: csv.id,
            turmaId: csv.turmaId,
            templateId: csv.templateId,
            nome: csv.nome,
            dados: csv.dados,
            colunas: csv.colunas,
            criadoEm: csv.criadoEm?.toISOString() || new Date().toISOString(),
            processadoEm: csv.processadoEm?.toISOString() || null,
          },
        };
      } catch (error) {
        console.error("Error finding CSV:", error);
        throw new Error("Failed to find CSV");
      }
    },
  });

export const createCriarCSVTool = (env: Env) =>
  createPrivateTool({
    id: "CRIAR_CSV",
    description: "Create a new CSV record for student data",
    inputSchema: z.object({
      turmaId: z.number(),
      templateId: z.number().optional(),
      nome: z.string(),
      dados: z.string(),
      colunas: z.string(),
    }),
    outputSchema: z.object({
      id: z.number(),
      turmaId: z.number(),
      templateId: z.number().nullable(),
      nome: z.string(),
      dados: z.string(),
      colunas: z.string(),
      criadoEm: z.string(),
      processadoEm: z.string().nullable(),
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

        const agora = new Date();
        const newCSV = await db.insert(csvsTable).values({
          turmaId: context.turmaId,
          templateId: context.templateId || null,
          nome: context.nome,
          dados: context.dados,
          colunas: context.colunas,
          criadoEm: agora,
          processadoEm: null,
        }).returning({
          id: csvsTable.id,
          turmaId: csvsTable.turmaId,
          templateId: csvsTable.templateId,
          nome: csvsTable.nome,
          dados: csvsTable.dados,
          colunas: csvsTable.colunas,
          criadoEm: csvsTable.criadoEm,
          processadoEm: csvsTable.processadoEm,
        });

        const csv = newCSV[0];
        return {
          id: csv.id,
          turmaId: csv.turmaId,
          templateId: csv.templateId,
          nome: csv.nome,
          dados: csv.dados,
          colunas: csv.colunas,
          criadoEm: csv.criadoEm?.toISOString() || agora.toISOString(),
          processadoEm: csv.processadoEm?.toISOString() || null,
        };
      } catch (error) {
        console.error("Error creating CSV:", error);
        throw new Error("Failed to create CSV");
      }
    },
  });

export const createAtualizarCSVTool = (env: Env) =>
  createPrivateTool({
    id: "ATUALIZAR_CSV",
    description: "Update an existing CSV's information",
    inputSchema: z.object({
      id: z.number(),
      nome: z.string().optional(),
      dados: z.string().optional(),
      colunas: z.string().optional(),
      templateId: z.number().optional(),
      processadoEm: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      csv: z.object({
        id: z.number(),
        turmaId: z.number(),
        templateId: z.number().nullable(),
        nome: z.string(),
        dados: z.string(),
        colunas: z.string(),
        criadoEm: z.string(),
        processadoEm: z.string().nullable(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Check if CSV exists
        const existing = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("CSV not found");
        }

        const updates: any = {};
        if (context.nome !== undefined) updates.nome = context.nome;
        if (context.dados !== undefined) updates.dados = context.dados;
        if (context.colunas !== undefined) updates.colunas = context.colunas;
        if (context.templateId !== undefined) {
          updates.templateId = context.templateId;
        }
        if (context.processadoEm !== undefined) {
          updates.processadoEm = context.processadoEm
            ? new Date(context.processadoEm)
            : null;
        }

        const updated = await db.update(csvsTable)
          .set(updates)
          .where(eq(csvsTable.id, context.id))
          .returning();

        const csv = updated[0];
        return {
          success: true,
          csv: {
            id: csv.id,
            turmaId: csv.turmaId,
            templateId: csv.templateId,
            nome: csv.nome,
            dados: csv.dados,
            colunas: csv.colunas,
            criadoEm: csv.criadoEm?.toISOString() || new Date().toISOString(),
            processadoEm: csv.processadoEm?.toISOString() || null,
          },
        };
      } catch (error) {
        console.error("Error updating CSV:", error);
        throw new Error("Failed to update CSV");
      }
    },
  });

export const createDeletarCSVTool = (env: Env) =>
  createPrivateTool({
    id: "DELETAR_CSV",
    description: "Delete a CSV and all its associated data",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedId: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Check if CSV exists
        const existing = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("CSV not found");
        }

        await db.delete(csvsTable).where(eq(csvsTable.id, context.id));

        return {
          success: true,
          deletedId: context.id,
        };
      } catch (error) {
        console.error("Error deleting CSV:", error);
        throw new Error("Failed to delete CSV");
      }
    },
  });

export const createMigrarCSVAntigoTool = (env: Env) =>
  createPrivateTool({
    id: "MIGRAR_CSV_ANTIGO",
    description: "Migrate old CSV format (string) to new JSON format",
    inputSchema: z.object({
      csvId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      dadosConvertidos: z.number(),
      colunasConvertidas: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Buscar CSV
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.csvId))
          .limit(1);

        if (csvs.length === 0) {
          throw new Error("CSV not found");
        }

        const csv = csvs[0];
        
        // Verificar se já está no formato novo
        try {
          const dadosTeste = JSON.parse(csv.dados);
          const colunasTeste = JSON.parse(csv.colunas);
          if (Array.isArray(dadosTeste) && Array.isArray(colunasTeste)) {
            return {
              success: true,
              message: "CSV já está no formato novo",
              dadosConvertidos: dadosTeste.length,
              colunasConvertidas: colunasTeste.length,
            };
          }
        } catch {
          // CSV está no formato antigo, continuar com a migração
        }

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

        // Atualizar CSV com novo formato
        await db.update(csvsTable)
          .set({
            dados: JSON.stringify(dadosArray),
            colunas: JSON.stringify(colunasArray),
          })
          .where(eq(csvsTable.id, context.csvId));

        return {
          success: true,
          message: "CSV migrado com sucesso para o novo formato",
          dadosConvertidos: dadosArray.length,
          colunasConvertidas: colunasArray.length,
        };
      } catch (error) {
        console.error("Error migrating CSV:", error);
        throw new Error("Failed to migrate CSV");
      }
    },
  });

// Export all CSVs-related tools
export const csvsTools = [
  createListarCSVsTool,
  createBuscarCSVPorIdTool,
  createCriarCSVTool,
  createAtualizarCSVTool,
  createDeletarCSVTool,
  createMigrarCSVAntigoTool,
];
