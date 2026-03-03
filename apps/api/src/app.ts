import Fastify, { type FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FsmInputError } from "@aashack/fsm";
import { modThree } from "./mod3.js";

export type AppOptions = Readonly<{
  logger?: boolean;
}>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isBinaryString(s: string): boolean {
  // Empty string is allowed and treated as 0.
  return /^[01]*$/.test(s);
}

/**
 * 
 * @param opts  Options for configuring the app, currently only supports enabling/disabling logging.
 * @returns A Fastify instance with the API routes and static file serving configured. The caller is responsible for calling `app.listen()` to start the server and `app.close()` to stop it.
 * 
 * This function sets up a Fastify server with the following features:
 */
export async function buildApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false });

  // Serve the tiny UI from / (no separate frontend build needed)
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/"
  });

  // Health check endpoint for monitoring and load balancers.
  app.get("/health", async () => ({ ok: true }));

  // API endpoint that computes the mod-3 remainder of a binary string using the FSM defined in mod3.ts.
  app.post("/api/mod3", async (req, reply) => {
    const body = (req.body ?? {}) as { input?: unknown };

    // Validate that the body has the expected shape and content.  
    // We want to catch these errors early and return a 400 Bad Request, 
    // rather than letting them propagate as unhandled exceptions.
    if (typeof body.input !== "string") {
      return reply.code(400).send(
        { 
          error: "Body must be JSON with a string field 'input'." 
        }
      );
    }
    // Validate that the input string contains only '0' and '1' characters, 
    // since that's what our FSM expects.
    if (!isBinaryString(body.input)) {
      return reply.code(400).send(
        { 
          error: "Input must contain only '0' and '1' characters." 
        }
      );
    }

    // If the input is valid, run it through the mod3 FSM and return the result.
    try {
      return reply.send(modThree(body.input));
    } catch (err) {
      if (err instanceof FsmInputError) {
        return reply.code(400).send(
          { 
            error: err.message 
          }
        );
      }
      req.log.error({ err }, "Unhandled error");
      // For any other unexpected errors, return a generic 500 Internal Server Error without exposing internal details.
      return reply.code(500).send(
        { 
          error: "Internal server error" 
        }
      );
    }
  });

  return app;
}
