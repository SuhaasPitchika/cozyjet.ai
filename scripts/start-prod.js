#!/usr/bin/env node

const { spawn } = require("child_process");

const port = process.env.PORT || "3000";
const binary = process.platform === "win32" ? "node_modules/.bin/next.cmd" : "node_modules/.bin/next";

const next = spawn(binary, ["start", "-p", port, "-H", "0.0.0.0"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

process.on("SIGTERM", () => next.kill("SIGTERM"));
process.on("SIGINT", () => next.kill("SIGINT"));
next.on("exit", (code) => process.exit(code ?? 0));
