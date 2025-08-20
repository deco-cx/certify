import {
  drizzle,
  migrateWithoutTransaction,
} from "@deco/workers-runtime/drizzle";
import type { Env } from "./main";
import migrations from "./drizzle/migrations";

export const getDb = async (env: Env) => {
  const db = drizzle({
    DECO_CHAT_WORKSPACE_DB: {
      query: env.DATABASE.DATABASES_RUN_SQL,
    },
  } as any);
  await migrateWithoutTransaction(db, migrations);
  return db;
};
