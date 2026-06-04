import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";

async function bootstrap() {
  validateEnv();
  await connectToDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`AI Powered Expense Tracker API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
