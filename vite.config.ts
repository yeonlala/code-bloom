import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

function siteBase() {
  const raw = process.env.GITHUB_PAGES_BASE?.trim();
  if (!raw || raw === "/") return "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export default defineConfig({
  base: siteBase(),
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
