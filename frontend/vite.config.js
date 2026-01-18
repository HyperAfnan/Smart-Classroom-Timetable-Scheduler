import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
   return {
      server: {
         host: true,
         port: 5173
      },
      plugins: [
         react({
            jsxImportSource:
               mode === "development"
                  ? "@welldone-software/why-did-you-render"
                  : "react",
         }),
         tailwindcss(),
      ],
      resolve: {
         alias: {
            "@": path.resolve(__dirname, "./src"),
         },
      },
   };
});
