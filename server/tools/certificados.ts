/**
 * Certificados-related tools for managing generated certificates.
 *
 * This file contains all tools related to certificados operations including:
 * - Listing certificates by turma (private)
 * - Getting certificate details by ID (public)
 * - Updating certificate status (private)
 * - Deleting certificates (private)
 * - Generating PDF and PNG certificates (public)
 */
import { createPrivateTool, createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../db.ts";
import {
  certificadosTable,
  csvsTable,
  runsTable,
  templatesTable,
  turmasTable,
} from "../schema.ts";
import type { Env } from "../main.ts";

export const createListarCertificadosTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_CERTIFICADOS",
    description:
      "List all certificates for a specific turma, optionally filtered by run",
    inputSchema: z.object({
      turmaId: z.number(),
      runId: z.number().optional(),
    }),
    outputSchema: z.object({
      certificados: z.array(z.object({
        id: z.string(),
        runId: z.number().nullable(),
        turmaId: z.number(),
        templateId: z.number(),
        csvId: z.number(),
        linhaIndex: z.number(),
        dados: z.string(),
        nome: z.string().nullable(),
        html: z.string().nullable(),
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
        let certificados;

        // Build query based on filters
        if (context.runId !== undefined) {
          // Filter by specific runId (including null for runId = 0)
          if (context.runId === 0) {
            certificados = await db.select()
              .from(certificadosTable)
              .where(and(
                eq(certificadosTable.turmaId, context.turmaId),
                isNull(certificadosTable.runId),
              ))
              .orderBy(certificadosTable.criadoEm);
          } else {
            certificados = await db.select()
              .from(certificadosTable)
              .where(and(
                eq(certificadosTable.turmaId, context.turmaId),
                eq(certificadosTable.runId, context.runId),
              ))
              .orderBy(certificadosTable.criadoEm);
          }
        } else {
          // No runId filter, show all certificates for the turma
          certificados = await db.select()
            .from(certificadosTable)
            .where(eq(certificadosTable.turmaId, context.turmaId))
            .orderBy(certificadosTable.criadoEm);
        }

        return {
          certificados: certificados.map((cert) => ({
            id: cert.id,
            runId: cert.runId,
            turmaId: cert.turmaId,
            templateId: cert.templateId,
            csvId: cert.csvId,
            linhaIndex: cert.linhaIndex,
            dados: cert.dados,
            nome: cert.nome,
            html: cert.html,
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
      id: z.string(),
    }),
    outputSchema: z.object({
      certificado: z.object({
        id: z.string(),
        runId: z.number().nullable(),
        turmaId: z.number(),
        templateId: z.number(),
        csvId: z.number(),
        linhaIndex: z.number(),
        dados: z.string(),
        nome: z.string().nullable(),
        html: z.string().nullable(),
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
            html: cert.html,
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
  createPrivateTool({
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
      html: z.string().optional(),
      status: z.string().optional(),
      generateUrl: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      runId: z.number().nullable(),
      turmaId: z.number(),
      templateId: z.number(),
      csvId: z.number(),
      linhaIndex: z.number(),
      dados: z.string(),
      nome: z.string().nullable(),
      html: z.string().nullable(),
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
          html: context.html || null,
          status: (context.status as
            | "pending"
            | "processing"
            | "completed"
            | "error") || "pending",
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

        const newCertificado = await db.insert(certificadosTable).values(
          insertData,
        ).returning({
          id: certificadosTable.id,
          runId: certificadosTable.runId,
          turmaId: certificadosTable.turmaId,
          templateId: certificadosTable.templateId,
          csvId: certificadosTable.csvId,
          linhaIndex: certificadosTable.linhaIndex,
          dados: certificadosTable.dados,
          nome: certificadosTable.nome,
          html: certificadosTable.html,
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
          html: certificado.html,
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
  createPrivateTool({
    id: "ATUALIZAR_CERTIFICADO",
    description: "Update certificate status and information",
    inputSchema: z.object({
      id: z.string(),
      status: z.string().optional(),
      html: z.string().optional(),
      generateUrl: z.string().optional(),
      verificadoEm: z.string().optional(),
      emailEnviado: z.boolean().optional(),
      emailDestinatario: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      status: z.string().nullable(),
      html: z.string().nullable(),
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
        if (context.html !== undefined) updateData.html = context.html;
        if (context.generateUrl !== undefined) {
          updateData.generateUrl = context.generateUrl;
        }
        if (context.verificadoEm !== undefined) {
          updateData.verificadoEm = context.verificadoEm
            ? new Date(context.verificadoEm)
            : null;
        }
        if (context.emailEnviado !== undefined) {
          updateData.emailEnviado = context.emailEnviado ? 1 : 0;
        }
        if (context.emailDestinatario !== undefined) {
          updateData.emailDestinatario = context.emailDestinatario;
        }

        const updated = await db.update(certificadosTable)
          .set(updateData)
          .where(eq(certificadosTable.id, context.id))
          .returning({
            id: certificadosTable.id,
            status: certificadosTable.status,
            html: certificadosTable.html,
            generateUrl: certificadosTable.generateUrl,
            verificadoEm: certificadosTable.verificadoEm,
            emailEnviado: certificadosTable.emailEnviado,
            emailDestinatario: certificadosTable.emailDestinatario,
          });

        const cert = updated[0];
        return {
          id: cert.id,
          status: cert.status,
          html: cert.html,
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
  createPrivateTool({
    id: "DELETAR_CERTIFICADO",
    description: "Delete a certificate",
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      deletedId: z.string(),
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

        await db.delete(certificadosTable).where(
          eq(certificadosTable.id, context.id),
        );

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

const getApi2pdfApiKey = (env: Env) => {
  const key = env.DECO_CHAT_REQUEST_CONTEXT.state?.api2pdfApiKey ||
    env.API2PDF_API_KEY;

  if (!key) {
    throw new Error("App not properly configured");
  }

  return key;
};

export const createGerarPdfCertificadoTool = (env: Env) =>
  createTool({
    id: "GERAR_PDF_CERTIFICADO",
    description: "Generate a PDF certificate",
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      pdfUrl: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      const api2pdfApiKey = getApi2pdfApiKey(env);

      try {
        const certificados = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.id, context.id))
          .limit(1);

        const html = certificados[0]?.html;
        if (!html) {
          throw new Error("Certificate HTML not found");
        }

        const payload = {
          FileName: "certificado.pdf",
          Inline: true,
          Storage: {
            Method: "PUT",
            Url: "",
          },
          Html: html,
          UseCustomStorage: false,
          Options: {
            Delay: 0,
            Scale: 1,
            DisplayHeaderFooter: false,
            HeaderTemplate: "<span></span>",
            FooterTemplate: "<span></span>",
            PrintBackground: true,
            Landscape: true,
            PageRanges: "",
            Width: "8.27in",
            Height: "11.69in",
            MarginTop: "0",
            MarginBottom: "0",
            MarginLeft: "0",
            MarginRight: "0",
            PreferCSSPageSize: false,
            OmitBackground: false,
            Tagged: true,
            Outline: false,
            UsePrintCss: true,
            PuppeteerWaitForMethod: "",
            PuppeteerWaitForValue: "",
          },
        };

        const response = await fetch(
          "https://v2.api2pdf.com/chrome/pdf/html?outputBinary=false",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": api2pdfApiKey,
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();
        const pdfUrl = data.FileUrl;

        return { pdfUrl };
      } catch (error) {
        console.error("Error generating PDF certificate:", error);
        throw new Error("Failed to generate PDF certificate");
      }
    },
  });

export const createGerarPngCertificadoTool = (env: Env) =>
  createTool({
    id: "GERAR_PNG_CERTIFICADO",
    description: "Generate a PNG certificate",
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      pngUrl: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      const api2pdfApiKey = getApi2pdfApiKey(env);

      try {
        const certificados = await db.select()
          .from(certificadosTable)
          .where(eq(certificadosTable.id, context.id))
          .limit(1);

        const html = certificados[0]?.html;
        if (!html) {
          throw new Error("Certificate HTML not found");
        }

        const payload = {
          FileName: "certificado.png",
          Inline: true,
          Storage: {
            Method: "PUT",
            Url: "",
          },
          Html: html,
          UseCustomStorage: false,
          Options: {
            Delay: 0,
            FullPage: true,
            ViewPortOptions: {
              Width: 1920,
              Height: 1080,
              IsMobile: false,
              DeviceScaleFactor: 1,
              IsLandscape: false,
              HasTouch: false,
            },
            PuppeteerWaitForMethod: "",
            PuppeteerWaitForValue: "",
          },
        };

        const response = await fetch(
          "https://v2.api2pdf.com/chrome/image/html?outputBinary=false",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": api2pdfApiKey,
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();
        const pngUrl = data.FileUrl;

        return { pngUrl };
      } catch (error) {
        console.error("Error generating PNG certificate:", error);
        throw new Error("Failed to generate PNG certificate");
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
  createGerarPdfCertificadoTool,
  createGerarPngCertificadoTool,
];
