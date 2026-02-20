import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  console.log(`[AUTH] GET ${req.url}`);
  return handler.GET(req);
};

export const POST = async (req: Request) => {
  console.log(`[AUTH] POST ${req.url}`);
  try {
    const res = await handler.POST(req);
    console.log(`[AUTH] POST ${req.url} - Status: ${res.status}`);
    return res;
  } catch (error) {
    console.error(`[AUTH] POST ${req.url} - Error:`, error);
    throw error;
  }
};
