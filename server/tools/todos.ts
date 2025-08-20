/**
 * Turmas-related tools for managing educational classes and projects.
 *
 * This file contains all tools related to turmas operations including:
 * - Creating new turmas
 * - Listing all turmas
 * - Updating turma information
 * - Deleting turmas
 * - Getting turma details
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { turmasTable } from "../schema.ts";
import { eq } from "drizzle-orm";

export const createListarTurmasTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_TURMAS",
    description: "List all turmas (educational classes) in the system",
    inputSchema: z.object({}),
    outputSchema: z.object({
      turmas: z.array(z.object({
        id: z.number(),
        nome: z.string(),
        descricao: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const turmas = await db.select().from(turmasTable).orderBy(
          turmasTable.criadoEm,
        );

        return {
          turmas: turmas.map((turma) => ({
            id: turma.id,
            nome: turma.nome,
            descricao: turma.descricao,
            criadoEm: turma.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: turma.atualizadoEm?.toISOString() ||
              new Date().toISOString(),
          })),
        };
      } catch (error) {
        console.error("Error listing turmas:", error);
        throw new Error("Failed to list turmas");
      }
    },
  });

export const createBuscarTurmaPorIdTool = (env: Env) =>
  createPrivateTool({
    id: "BUSCAR_TURMA_POR_ID",
    description: "Get a specific turma by its ID",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      turma: z.object({
        id: z.number(),
        nome: z.string(),
        descricao: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      }).nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const turmas = await db.select()
          .from(turmasTable)
          .where(eq(turmasTable.id, context.id))
          .limit(1);

        if (turmas.length === 0) {
          return { turma: null };
        }

        const turma = turmas[0];
        return {
          turma: {
            id: turma.id,
            nome: turma.nome,
            descricao: turma.descricao,
            criadoEm: turma.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: turma.atualizadoEm?.toISOString() ||
              new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error finding turma:", error);
        throw new Error("Failed to find turma");
      }
    },
  });

export const createCriarTurmaTool = (env: Env) =>
  createPrivateTool({
    id: "CRIAR_TURMA",
    description: "Create a new turma (educational class)",
    inputSchema: z.object({
      nome: z.string(),
      descricao: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      nome: z.string(),
      descricao: z.string().nullable(),
      criadoEm: z.string(),
      atualizadoEm: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        const agora = new Date();
        const newTurma = await db.insert(turmasTable).values({
          nome: context.nome,
          descricao: context.descricao || null,
          criadoEm: agora,
          atualizadoEm: agora,
        }).returning({
          id: turmasTable.id,
          nome: turmasTable.nome,
          descricao: turmasTable.descricao,
          criadoEm: turmasTable.criadoEm,
          atualizadoEm: turmasTable.atualizadoEm,
        });

        const turma = newTurma[0];
        return {
          id: turma.id,
          nome: turma.nome,
          descricao: turma.descricao,
          criadoEm: turma.criadoEm?.toISOString() || agora.toISOString(),
          atualizadoEm: turma.atualizadoEm?.toISOString() ||
            agora.toISOString(),
        };
      } catch (error) {
        console.error("Error creating turma:", error);
        throw new Error("Failed to create turma");
      }
    },
  });

export const createAtualizarTurmaTool = (env: Env) =>
  createPrivateTool({
    id: "ATUALIZAR_TURMA",
    description: "Update an existing turma's information",
    inputSchema: z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      turma: z.object({
        id: z.number(),
        nome: z.string(),
        descricao: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);

      try {
        // Check if turma exists
        const existing = await db.select()
          .from(turmasTable)
          .where(eq(turmasTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Turma not found");
        }

        const updates: any = {};
        if (context.nome !== undefined) updates.nome = context.nome;
        if (context.descricao !== undefined) {
          updates.descricao = context.descricao;
        }
        updates.atualizadoEm = new Date();

        const updated = await db.update(turmasTable)
          .set(updates)
          .where(eq(turmasTable.id, context.id))
          .returning();

        const turma = updated[0];
        return {
          success: true,
          turma: {
            id: turma.id,
            nome: turma.nome,
            descricao: turma.descricao,
            criadoEm: turma.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: turma.atualizadoEm?.toISOString() ||
              new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error updating turma:", error);
        throw new Error("Failed to update turma");
      }
    },
  });

export const createDeletarTurmaTool = (env: Env) =>
  createPrivateTool({
    id: "DELETAR_TURMA",
    description: "Delete a turma and all its associated data",
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
        // Check if turma exists
        const existing = await db.select()
          .from(turmasTable)
          .where(eq(turmasTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Turma not found");
        }

        await db.delete(turmasTable).where(eq(turmasTable.id, context.id));

        return {
          success: true,
          deletedId: context.id,
        };
      } catch (error) {
        console.error("Error deleting turma:", error);
        throw new Error("Failed to delete turma");
      }
    },
  });

// Export all turmas-related tools
export const turmasTools = [
  createListarTurmasTool,
  createBuscarTurmaPorIdTool,
  createCriarTurmaTool,
  createAtualizarTurmaTool,
  createDeletarTurmaTool,
];
