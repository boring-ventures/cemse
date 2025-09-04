const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Configure server for large file uploads
  const server = createServer(async (req, res) => {
    try {
      // Set higher timeout for large uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes

      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Handle large file uploads for specific routes
      if (pathname === "/api/files/upload/course-files") {
        // Configure for large file uploads
        req.setMaxListeners(0);

        // Set headers for large file handling
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Content-Length"
        );

        // Handle preflight request
        if (req.method === "OPTIONS") {
          res.writeHead(200);
          res.end();
          return;
        }

        // Check content length for POST requests
        if (req.method === "POST") {
          const contentLength = req.headers["content-length"];
          if (contentLength) {
            const sizeInBytes = parseInt(contentLength);
            const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);

            console.log(
              `📁 Server: File upload request size: ${sizeInGB.toFixed(2)} GB`
            );

            // Allow up to 2GB for course file uploads
            if (sizeInGB > 2) {
              console.log(
                `📁 Server: File too large, rejecting: ${sizeInGB.toFixed(2)} GB`
              );
              res.writeHead(413, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  error:
                    "El archivo es demasiado grande. Máximo 2GB por archivo.",
                })
              );
              return;
            }
          }
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Configure server settings for large uploads
  server.maxHeaderSize = 64 * 1024; // 64KB header size
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds

  server
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Configured for large file uploads (up to 2GB)`);
    });
});
