/**
 * Certificados-related tools for managing generated certificates.
 * 
 * This file contains all tools related to certificados operations including:
 * - Listing certificates by turma
 * - Getting certificate details
 * - Updating certificate status
 * - Deleting certificates
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db.ts";
import { certificadosTable, turmasTable, templatesTable, csvsTable, runsTable } from "../schema.ts";
import type { Env } from "../main.ts";

export const createListarCertificadosTool = (env: Env) =>
  createTool({
    id: "LISTAR_CERTIFICADOS",
    description: "List all certificates for a specific turma",
    inputSchema: z.object({
      turmaId: z.number(),
    }),
    outputSchema: z.object({
      certificados: z.array(z.object({
        id: z.number(),
        runId: z.number().nullable(),
        turmaId: z.number(),
        templateId: z.number(),
        csvId: z.number(),
        linhaIndex: z.number(),
        dados: z.string(),
        nome: z.string().nullable(),
        arquivoUrl: z.string().nullable(),
        arquivoId: z.string().nullable(),
        status: z.string().nullable(),
        generateUrl: z.string().nullable(),
        verificadoEm: z.string().nullable(),
        emailEnviado: z.boolean(),
        emailDestinatario: z.string().nullable(),
        criadoEm: z.string(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const certificados = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.turmaId, context.turmaId))
          .orderBy(certificadosTable.criadoEm);

        return {
          certificados: certificados.map(cert => ({
            id: cert.id,
            runId: cert.runId,
            turmaId: cert.turmaId,
            templateId: cert.templateId,
            csvId: cert.csvId,
            linhaIndex: cert.linhaIndex,
            dados: cert.dados,
            nome: cert.nome,
            arquivoUrl: cert.arquivoUrl,
            arquivoId: cert.arquivoId,
            status: cert.status,
            generateUrl: cert.generateUrl,
            verificadoEm: cert.verificadoEm?.toISOString() || null,
            emailEnviado: Boolean(cert.emailEnviado),
            emailDestinatario: cert.emailDestinatario,
            criadoEm: cert.criadoEm?.toISOString() || new Date().toISOString(),
          })),
        };
      } catch (error) {
        console.error("Error listing certificates:", error);
        throw new Error("Failed to list certificates");
      }
    },
  });

export const createBuscarCertificadoPorIdTool = (env: Env) =>
  createTool({
    id: "BUSCAR_CERTIFICADO_POR_ID",
    description: "Get a specific certificate by ID",
    inputSchema: z.object({
      id: z.number(),
    }),
    outputSchema: z.object({
      certificado: z.object({
        id: z.number(),
        runId: z.number().nullable(),
        turmaId: z.number(),
        templateId: z.number(),
        csvId: z.number(),
        linhaIndex: z.number(),
        dados: z.string(),
        nome: z.string().nullable(),
        arquivoUrl: z.string().nullable(),
        arquivoId: z.string().nullable(),
        status: z.string().nullable(),
        generateUrl: z.string().nullable(),
        verificadoEm: z.string().nullable(),
        emailEnviado: z.boolean(),
        emailDestinatario: z.string().nullable(),
        criadoEm: z.string(),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const certificados = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.id, context.id))
          .limit(1);

        if (certificados.length === 0) {
          throw new Error("Certificate not found");
        }

        const cert = certificados[0];
        return {
          certificado: {
            id: cert.id,
            runId: cert.runId,
            turmaId: cert.turmaId,
            templateId: cert.templateId,
            csvId: cert.csvId,
            linhaIndex: cert.linhaIndex,
            dados: cert.dados,
            nome: cert.nome,
            arquivoUrl: cert.arquivoUrl,
            arquivoId: cert.arquivoId,
            status: cert.status,
            generateUrl: cert.generateUrl,
            verificadoEm: cert.verificadoEm?.toISOString() || null,
            emailEnviado: Boolean(cert.emailEnviado),
            emailDestinatario: cert.emailDestinatario,
            criadoEm: cert.criadoEm?.toISOString() || new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error finding certificate:", error);
        throw new Error("Failed to find certificate");
      }
    },
  });

export const createCriarCertificadoTool = (env: Env) =>
  createTool({
    id: "CRIAR_CERTIFICADO",
    description: "Create a new certificate record",
    inputSchema: z.object({
      runId: z.number().optional(),
      turmaId: z.number(),
      templateId: z.number(),
      csvId: z.number(),
      linhaIndex: z.number(),
      dados: z.string(),
      nome: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoId: z.string().optional(),
      status: z.string().optional(),
      generateUrl: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      runId: z.number().nullable(),
      turmaId: z.number(),
      templateId: z.number(),
      csvId: z.number(),
      linhaIndex: z.number(),
      dados: z.string(),
      nome: z.string().nullable(),
      arquivoUrl: z.string().nullable(),
      arquivoId: z.string().nullable(),
      status: z.string().nullable(),
      generateUrl: z.string().nullable(),
      verificadoEm: z.string().nullable(),
      emailEnviado: z.boolean(),
      emailDestinatario: z.string().nullable(),
      criadoEm: z.string(),
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

        // Verify CSV exists
        const csvs = await db.select()
          .from(csvsTable)
          .where(eq(csvsTable.id, context.csvId))
          .limit(1);
        
        if (csvs.length === 0) {
          throw new Error("CSV not found");
        }

        const agora = new Date();
        const insertData: any = {
          turmaId: context.turmaId,
          templateId: context.templateId,
          csvId: context.csvId,
          linhaIndex: context.linhaIndex,
          dados: context.dados,
          nome: context.nome || null,
          arquivoUrl: context.arquivoUrl || null,
          arquivoId: context.arquivoId || null,
          status: (context.status as "pending" | "processing" | "completed" | "error") || "pending",
          generateUrl: context.generateUrl || null,
          verificadoEm: null,
          emailEnviado: 0,
          emailDestinatario: null,
          criadoEm: agora,
        };

        // Only add runId if it exists
        if (context.runId !== undefined) {
          insertData.runId = context.runId;
        }

        const newCertificado = await db.insert(certificadosTable).values(insertData).returning({
          id: certificadosTable.id,
          runId: certificadosTable.runId,
          turmaId: certificadosTable.turmaId,
          templateId: certificadosTable.templateId,
          csvId: certificadosTable.csvId,
          linhaIndex: certificadosTable.linhaIndex,
          dados: certificadosTable.dados,
          nome: certificadosTable.nome,
          arquivoUrl: certificadosTable.arquivoUrl,
          arquivoId: certificadosTable.arquivoId,
          status: certificadosTable.status,
          generateUrl: certificadosTable.generateUrl,
          verificadoEm: certificadosTable.verificadoEm,
          emailEnviado: certificadosTable.emailEnviado,
          emailDestinatario: certificadosTable.emailDestinatario,
          criadoEm: certificadosTable.criadoEm,
        });

        const certificado = newCertificado[0];
        return {
          id: certificado.id,
          runId: certificado.runId,
          turmaId: certificado.turmaId,
          templateId: certificado.templateId,
          csvId: certificado.csvId,
          linhaIndex: certificado.linhaIndex,
          dados: certificado.dados,
          nome: certificado.nome,
          arquivoUrl: certificado.arquivoUrl,
          arquivoId: certificado.arquivoId,
          status: certificado.status,
          generateUrl: certificado.generateUrl,
          verificadoEm: certificado.verificadoEm?.toISOString() || null,
          emailEnviado: Boolean(certificado.emailEnviado),
          emailDestinatario: certificado.emailDestinatario,
          criadoEm: certificado.criadoEm?.toISOString() || agora.toISOString(),
        };
      } catch (error) {
        console.error("Error creating certificate:", error);
        throw new Error("Failed to create certificate");
      }
    },
  });

export const createAtualizarCertificadoTool = (env: Env) =>
  createTool({
    id: "ATUALIZAR_CERTIFICADO",
    description: "Update certificate status and information",
    inputSchema: z.object({
      id: z.number(),
      status: z.string().optional(),
      arquivoUrl: z.string().optional(),
      arquivoId: z.string().optional(),
      generateUrl: z.string().optional(),
      verificadoEm: z.string().optional(),
      emailEnviado: z.boolean().optional(),
      emailDestinatario: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      status: z.string().nullable(),
      arquivoUrl: z.string().nullable(),
      arquivoId: z.string().nullable(),
      generateUrl: z.string().nullable(),
      verificadoEm: z.string().nullable(),
      emailEnviado: z.boolean(),
      emailDestinatario: z.string().nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Check if certificate exists
        const existing = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Certificate not found");
        }

        const updateData: any = {};
        
        if (context.status !== undefined) updateData.status = context.status;
        if (context.arquivoUrl !== undefined) updateData.arquivoUrl = context.arquivoUrl;
        if (context.arquivoId !== undefined) updateData.arquivoId = context.arquivoId;
        if (context.generateUrl !== undefined) updateData.generateUrl = context.generateUrl;
        if (context.verificadoEm !== undefined) updateData.verificadoEm = context.verificadoEm ? new Date(context.verificadoEm) : null;
        if (context.emailEnviado !== undefined) updateData.emailEnviado = context.emailEnviado ? 1 : 0;
        if (context.emailDestinatario !== undefined) updateData.emailDestinatario = context.emailDestinatario;

        const updated = await db.update(certificadosTable)
          .set(updateData)
          .where(eq(certificadosTable.id, context.id))
          .returning({
            id: certificadosTable.id,
            status: certificadosTable.status,
            arquivoUrl: certificadosTable.arquivoUrl,
            arquivoId: certificadosTable.arquivoId,
            generateUrl: certificadosTable.generateUrl,
            verificadoEm: certificadosTable.verificadoEm,
            emailEnviado: certificadosTable.emailEnviado,
            emailDestinatario: certificadosTable.emailDestinatario,
          });

        const cert = updated[0];
        return {
          id: cert.id,
          status: cert.status,
          arquivoUrl: cert.arquivoUrl,
          arquivoId: cert.arquivoId,
          generateUrl: cert.generateUrl,
          verificadoEm: cert.verificadoEm?.toISOString() || null,
          emailEnviado: Boolean(cert.emailEnviado),
          emailDestinatario: cert.emailDestinatario,
        };
      } catch (error) {
        console.error("Error updating certificate:", error);
        throw new Error("Failed to update certificate");
      }
    },
  });

export const createDeletarCertificadoTool = (env: Env) =>
  createTool({
    id: "DELETAR_CERTIFICADO",
    description: "Delete a certificate",
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
        // Check if certificate exists
        const existing = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.id, context.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Certificate not found");
        }

        await db.delete(certificadosTable).where(eq(certificadosTable.id, context.id));
        
        return {
          success: true,
          deletedId: context.id,
        };
      } catch (error) {
        console.error("Error deleting certificate:", error);
        throw new Error("Failed to delete certificate");
      }
    },
  });

// Export all certificados-related tools
export const certificadosTools = [
  createListarCertificadosTool,
  createBuscarCertificadoPorIdTool,
  createCriarCertificadoTool,
  createAtualizarCertificadoTool,
  createDeletarCertificadoTool,
];
