// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuth from "next-auth";
import { baseAuthConfig } from "../../../../auth.config";
import { nodeProviders } from "../../../../auth.node";

const nextAuthConfig = {
  ...baseAuthConfig,
  providers: nodeProviders,
  session: { strategy: "jwt" },
};

let nextAuthResult;
let initError = null;

try {
  nextAuthResult = NextAuth(nextAuthConfig);
} catch (err) {
  initError = { message: err.message, stack: err.stack };
}

// Helper to resolve the correct handler function for methodName ("GET" or "POST")
function resolveHandler(methodName) {
  if (initError) {
    throw new Error("NextAuth init error: " + initError.message);
  }
  if (!nextAuthResult) {
    throw new Error("NextAuth returned falsy handler");
  }

  // shape A: { handlers: { GET, POST } }
  if (nextAuthResult.handlers && typeof nextAuthResult.handlers[methodName] === "function") {
    return (...args) => nextAuthResult.handlers[methodName](...args);
  }

  // shape B: { GET: fn, POST: fn }
  if (typeof nextAuthResult[methodName] === "function") {
    return (...args) => nextAuthResult[methodName](...args);
  }

  // shape C: nextAuthResult is itself a function (call it)
  if (typeof nextAuthResult === "function") {
    return (...args) => nextAuthResult(...args);
  }

  // nothing matched
  throw new Error(`NextAuth handler missing ${methodName} property — handler keys: ${Object.keys(nextAuthResult || {}).join(", ")}`);
}

export const GET = async (request) => {
  try {
    const fn = resolveHandler("GET");
    return await fn(request);
  } catch (err) {
    return new Response(JSON.stringify({ error: "GET handler error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST = async (request) => {
  try {
    const fn = resolveHandler("POST");
    return await fn(request);
  } catch (err) {
    return new Response(JSON.stringify({ error: "POST handler error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
