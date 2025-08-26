import restart from "vite-plugin-restart";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default {
  root: "src/", // Sources files (typically where index.html is)
  publicDir: "../static/", // Path from "root" to static assets
  server: {
    host: "0.0.0.0", // Explicitly bind to all network interfaces
    port: 3001, // Different port to avoid conflicts with ThreeJS project
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
    https: true, // Needed for WebXR / Quest
  },
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [
    restart({ restart: ["../static/**"] }), // Restart server on static file change
    basicSsl(),
  ],
};
