/**
 * AI-related tools for generating content using AI models.
 *
 * This file contains all tools related to AI operations including:
 * - AI_GENERATE_OBJECT for structured content generation
 * - AI_GENERATE for text generation
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";

export const createAIGenerateObjectTool = (env: Env) =>
  createPrivateTool({
    id: "AI_GENERATE_OBJECT",
    description: "Generate structured objects using AI models with JSON schema validation",
    inputSchema: z.object({
      messages: z.array(z.object({
        id: z.string().optional(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        createdAt: z.string().optional(),
        experimental_attachments: z.array(z.object({
          name: z.string().optional(),
          contentType: z.string().optional(),
          url: z.string()
        })).optional()
      })),
      schema: z.record(z.any()),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      tools: z.record(z.array(z.string())).optional()
    }),
    outputSchema: z.object({
      object: z.record(z.any()).optional(),
      usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number(),
        transactionId: z.string()
      }),
      finishReason: z.string().optional()
    }),
    execute: async ({ context }) => {
      try {
        // Proxy to the actual deco platform AI tool
        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: context.messages,
          schema: context.schema,
          model: context.model,
          maxTokens: context.maxTokens,
          temperature: context.temperature,
          tools: context.tools
        });

        return result;
      } catch (error) {
        console.error("Error calling AI_GENERATE_OBJECT:", error);
        throw new Error("Failed to generate content with AI");
      }
    },
  });

export const createAIGenerateTool = (env: Env) =>
  createPrivateTool({
    id: "AI_GENERATE",
    description: "Generate text using AI models",
    inputSchema: z.object({
      message: z.string(),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
    }),
    outputSchema: z.object({
      text: z.string(),
      usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number(),
        transactionId: z.string()
      }),
      finishReason: z.string().optional()
    }),
    execute: async ({ context }) => {
      try {
        // Proxy to the actual deco platform AI tool
        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE({
          message: context.message,
          model: context.model,
          maxTokens: context.maxTokens,
          temperature: context.temperature,
        });

        return result;
      } catch (error) {
        console.error("Error calling AI_GENERATE:", error);
        throw new Error("Failed to generate text with AI");
      }
    },
  });

// Export all AI-related tools
export const aiTools = [
  createAIGenerateObjectTool,
  createAIGenerateTool,
];


