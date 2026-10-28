import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SITE_MODE } from "./lib/site-mode";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function renderUnreachableHtml(host: string): string {
  const domain = host.replace(/:\d+$/, "") || "margajewelry.in";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>This site can’t be reached</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #202124;
      color: #e8eaed;
      margin: 0;
      padding: 40px 24px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      width: 100%;
      margin-top: 60px;
    }
    .icon {
      width: 48px;
      height: 48px;
      fill: #9aa0a6;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 22px;
      font-weight: 500;
      margin: 0 0 16px 0;
      color: #e8eaed;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #9aa0a6;
      margin: 0 0 20px 0;
    }
    ul {
      margin: 0 0 24px 0;
      padding-left: 20px;
      color: #9aa0a6;
      font-size: 14px;
      line-height: 1.6;
    }
    .error-code {
      font-size: 12px;
      color: #9aa0a6;
      font-family: Menlo, Monaco, Consolas, monospace;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="icon" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
    <h1>This site can’t be reached</h1>
    <p><strong style="color:#e8eaed;">${domain}</strong> refused to connect.</p>
    <p>Try:</p>
    <ul>
      <li>Checking the connection</li>
      <li>Checking the proxy and the firewall</li>
    </ul>
    <div class="error-code">ERR_CONNECTION_REFUSED</div>
  </div>
</body>
</html>`;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // When SITE_MODE is "UNREACHABLE", reject public requests with HTTP 503 & connection refused screen
      if (SITE_MODE === "UNREACHABLE" && !url.pathname.startsWith("/admin") && !url.pathname.startsWith("/assets/")) {
        return new Response(renderUnreachableHtml(url.host), {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
