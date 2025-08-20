/* eslint-env node */
/* app/lib/utils.js */
"use server";

import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

// Use a typeof-guarded global lookup (no dynamic Function/eval)
const globalObj =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : typeof window !== "undefined"
    ? window
    : {};

// Create or reuse a cache object on the global
const cached = globalObj.__mongoose_cache || { conn: null, promise: null, listenersAttached: false };
globalObj.__mongoose_cache = cached;

export async function connect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;

    if (!cached.listenersAttached) {
      mongoose.connection.on("connected", () => console.log("MongoDB connected"));
      mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));
      mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
      cached.listenersAttached = true;
    }

    console.log("Database connected");
    return cached.conn;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

export default connect;
