/**
 * Central export point for all tools organized by domain.
 *
 * This file aggregates all tools from different domains into a single
 * export, making it easy to import all tools in main.ts while keeping
 * the domain separation.
 */
import { turmasTools } from "./todos.ts";
import { userTools } from "./user.ts";
import { templatesTools } from "./templates.ts";
import { csvsTools } from "./csvs.ts";
import { runsTools } from "./runs.ts";
import { certificadosTools } from "./certificados.ts";
import { emailsTools } from "./emails.ts";

export const tools = [
  ...turmasTools,
  ...userTools,
  ...templatesTools,
  ...csvsTools,
  ...runsTools,
  ...certificadosTools,
  ...emailsTools,
];

// Re-export for direct access
export { turmasTools } from "./todos.ts";
export { userTools } from "./user.ts";
export { templatesTools } from "./templates.ts";
export { csvsTools } from "./csvs.ts";
export { runsTools } from "./runs.ts";
export { certificadosTools } from "./certificados.ts";
export { emailsTools } from "./emails.ts";
