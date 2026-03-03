import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

const app = await buildApp({ logger: false });

try {
  await app.listen({ port, host });
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
