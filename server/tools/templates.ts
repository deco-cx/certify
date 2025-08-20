/**
 * Templates-related tools for managing HTML templates for certificates.
 * 
 * This file contains all tools related to template operations including:
 * - Creating new templates
 * - Listing templates by turma
 * - Updating template information
 * - Deleting templates
 * - Getting template details
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { templatesTable, turmasTable } from "../schema.ts";
import { eq, and } from "drizzle-orm";

export const createListarTemplatesTool = (env: Env) =>
  createTool({
    id: "LISTAR_TEMPLATES",
    description: "List all templates for a specific turma",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      templates: z.array(z.object({
        id: z.number(),
        turmaId: z.number(),
        nome: z.string(),
        arquivoUrl: z.string(),
        arquivoId: z.string().nullable(),
        tipo: z.string().nullable(),
        campos: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const templates = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.turmaId, context.turmaId))
          .orderBy(templatesTable.criadoEm);
        
        return {
          templates: templates.map(template => ({
            id: template.id,
            turmaId: template.turmaId,
            nome: template.nome,
            arquivoUrl: template.arquivoUrl,
            arquivoId: template.arquivoId,
            tipo: template.tipo,
            campos: template.campos,
            criadoEm: template.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: template.atualizadoEm?.toISOString() || new Date().toISOString(),
          })),
        };
      } catch (error) {
        console.error("Error listing templates:", error);
        throw new Error("Failed to list templates");
      }
    },
  });

export const createBuscarTemplatePorIdTool = (env: Env) =>
  createTool({
    id: "BUSCAR_TEMPLATE_POR_ID",
    description: "Get a specific template by its ID",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      template: z.object({
        id: z.number(),
        turmaId: z.number(),
        nome: z.string(),
        arquivoUrl: z.string(),
        arquivoId: z.string().nullable(),
        tipo: z.string().nullable(),
        campos: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      }).nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const templates = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.id, context.id))
          .limit(1);
        
        if (templates.length === 0) {
          return { template: null };
        }
        
        const template = templates[0];
        return {
          template: {
            id: template.id,
            turmaId: template.turmaId,
            nome: template.nome,
            arquivoUrl: template.arquivoUrl,
            arquivoId: template.arquivoId,
            tipo: template.tipo,
            campos: template.campos,
            criadoEm: template.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: template.atualizadoEm?.toISOString() || new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error finding template:", error);
        throw new Error("Failed to find template");
      }
    },
  });

export const createCriarTemplateTool = (env: Env) =>
  createTool({
    id: "CRIAR_TEMPLATE",
    description: "Create a new HTML template for certificates",
    inputSchema: z.object({
      turmaId: z.number(),
      nome: z.string(),
      arquivoUrl: z.string(),
      arquivoId: z.string().optional(),
      tipo: z.string().optional(),
      campos: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      turmaId: z.number(),
      nome: z.string(),
      arquivoUrl: z.string(),
      arquivoId: z.string().nullable(),
      tipo: z.string().nullable(),
      campos: z.string().nullable(),
      criadoEm: z.string(),
      atualizadoEm: z.string(),
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
        const newTemplate = await db.insert(templatesTable).values({
          turmaId: context.turmaId,
          nome: context.nome,
          arquivoUrl: context.arquivoUrl,
          arquivoId: context.arquivoId || null,
          tipo: (context.tipo as "html") || "html",
          campos: context.campos || null,
          criadoEm: agora,
          atualizadoEm: agora,
        }).returning({ 
          id: templatesTable.id,
          turmaId: templatesTable.turmaId,
          nome: templatesTable.nome,
          arquivoUrl: templatesTable.arquivoUrl,
          arquivoId: templatesTable.arquivoId,
          tipo: templatesTable.tipo,
          campos: templatesTable.campos,
          criadoEm: templatesTable.criadoEm,
          atualizadoEm: templatesTable.atualizadoEm,
        });
        
        const template = newTemplate[0];
        return {
          id: template.id,
          turmaId: template.turmaId,
          nome: template.nome,
          arquivoUrl: template.arquivoUrl,
          arquivoId: template.arquivoId,
          tipo: template.tipo,
          campos: template.campos,
          criadoEm: template.criadoEm?.toISOString() || agora.toISOString(),
          atualizadoEm: template.atualizadoEm?.toISOString() || agora.toISOString(),
        };
      } catch (error) {
        console.error("Error creating template:", error);
        throw new Error("Failed to create template");
      }
    },
  });

export const createAtualizarTemplateTool = (env: Env) =>
  createTool({
    id: "ATUALIZAR_TEMPLATE",
    description: "Update an existing template's information",
    inputSchema: z.object({
      id: z.number(),
      nome: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoId: z.string().optional(),
      tipo: z.string().optional(),
      campos: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      template: z.object({
        id: z.number(),
        turmaId: z.number(),
        nome: z.string(),
        arquivoUrl: z.string(),
        arquivoId: z.string().nullable(),
        tipo: z.string().nullable(),
        campos: z.string().nullable(),
        criadoEm: z.string(),
        atualizadoEm: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Check if template exists
        const existing = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.id, context.id))
          .limit(1);
        
        if (existing.length === 0) {
          throw new Error("Template not found");
        }
        
        const updates: any = {};
        if (context.nome !== undefined) updates.nome = context.nome;
        if (context.arquivoUrl !== undefined) updates.arquivoUrl = context.arquivoUrl;
        if (context.arquivoId !== undefined) updates.arquivoId = context.arquivoId;
        if (context.tipo !== undefined) updates.tipo = context.tipo;
        if (context.campos !== undefined) updates.campos = context.campos;
        updates.atualizadoEm = new Date();
        
        const updated = await db.update(templatesTable)
          .set(updates)
          .where(eq(templatesTable.id, context.id))
          .returning();
        
        const template = updated[0];
        return {
          success: true,
          template: {
            id: template.id,
            turmaId: template.turmaId,
            nome: template.nome,
            arquivoUrl: template.arquivoUrl,
            arquivoId: template.arquivoId,
            tipo: template.tipo,
            campos: template.campos,
            criadoEm: template.criadoEm?.toISOString() || new Date().toISOString(),
            atualizadoEm: template.atualizadoEm?.toISOString() || new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error updating template:", error);
        throw new Error("Failed to update template");
      }
    },
  });

export const createDeletarTemplateTool = (env: Env) =>
  createTool({
    id: "DELETAR_TEMPLATE",
    description: "Delete a template and all its associated data",
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
        // Check if template exists
        const existing = await db.select()
          .from(templatesTable)
          .where(eq(templatesTable.id, context.id))
          .limit(1);
        
        if (existing.length === 0) {
          throw new Error("Template not found");
        }
        
        await db.delete(templatesTable).where(eq(templatesTable.id, context.id));
        
        return {
          success: true,
          deletedId: context.id,
        };
      } catch (error) {
        console.error("Error deleting template:", error);
        throw new Error("Failed to delete template");
      }
    },
  });

// Export all templates-related tools
export const templatesTools = [
  createListarTemplatesTool,
  createBuscarTemplatePorIdTool,
  createCriarTemplateTool,
  createAtualizarTemplateTool,
  createDeletarTemplateTool,
];
