import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        privacidade: "politica-de-privacidade.html",
        exameAuditivo: "exame-auditivo-sus.html",
        aparelhoAuditivo: "aparelho-auditivo-sus.html",
        reabilitacaoAuditiva: "reabilitacao-auditiva-sus.html",
      },
    },
  },
});
