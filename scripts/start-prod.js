#!/usr/bin/env node

const { spawn } = require("child_process");

const port = process.env.PORT || "3000";
const node = process.execPath;
const nextCli = require.resolve("next/dist/bin/next");

const next = spawn(node, [nextCli, "start", "-p", port, "-H", "0.0.0.0"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

process.on("SIGTERM", () => next.kill("SIGTERM"));
process.on("SIGINT", () => next.kill("SIGINT"));
next.on("exit", (code) => process.exit(code ?? 0));
