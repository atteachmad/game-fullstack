import type { Language } from "@/types";

/** Hanya bahasa yang bisa berjalan langsung di browser yang punya preview. */
const PREVIEWABLE: ReadonlySet<Language> = new Set<Language>(["html", "css", "javascript"]);

export function isPreviewable(language: Language): boolean {
  return PREVIEWABLE.has(language);
}

/** Markup contoh yang dipakai agar kode CSS punya sasaran untuk ditata. */
export const DEFAULT_CSS_DEMO_HTML = `<button>Tekan saya</button>
<div class="card">Kartu contoh</div>`;

const BASE_STYLE = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 20px;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #e8e9ff;
    background: #10132a;
    line-height: 1.6;
  }
`;

/** Skrip penangkap console: mengalihkan log dan error ke elemen #__out. */
const CONSOLE_CAPTURE = `
(function () {
  var out = document.getElementById("__out");
  function fmt(value) {
    if (typeof value === "string") return value;
    try {
      var json = JSON.stringify(value);
      return json === undefined ? String(value) : json;
    } catch (e) {
      return String(value);
    }
  }
  function write(cls, args) {
    if (!out) return;
    var line = document.createElement("div");
    line.className = cls;
    line.textContent = Array.prototype.map.call(args, fmt).join(" ");
    out.appendChild(line);
  }
  console.log = function () { write("log", arguments); };
  console.info = function () { write("log", arguments); };
  console.warn = function () { write("warn", arguments); };
  console.error = function () { write("err", arguments); };
  window.onerror = function (message) {
    write("err", ["Error: " + message]);
    return true;
  };
})();
`;

const JS_STYLE = `
  #__out {
    margin: 0;
    padding: 16px;
    border-radius: 12px;
    background: #05060f;
    font-family: ui-monospace, "JetBrains Mono", monospace;
    font-size: 13px;
    white-space: pre-wrap;
  }
  #__out:empty::before {
    content: "(belum ada output, gunakan console.log)";
    color: #6b6f9c;
  }
  #__out .log { color: #a3e635; }
  #__out .warn { color: #fbbf24; }
  #__out .err { color: #fb7185; }
`;

const CSS_STAGE_STYLE = `
  body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px; }
`;

function wrapDocument(head: string, body: string): string {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${BASE_STYLE}</style>
${head}
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Membuat dokumen HTML lengkap untuk iframe preview.
 * Iframe harus memakai sandbox="allow-scripts" (tanpa allow-same-origin).
 */
export function buildPreviewDocument(
  language: Language,
  code: string,
  options: { html?: string } = {}
): string {
  switch (language) {
    case "html":
      return wrapDocument("", code);

    case "css": {
      const safeCss = code.replace(/<\/style/gi, "<\\/style");
      const markup = options.html ?? DEFAULT_CSS_DEMO_HTML;
      return wrapDocument(
        `<style>${CSS_STAGE_STYLE}</style>\n<style>${safeCss}</style>`,
        markup
      );
    }

    case "javascript": {
      const safeJs = code.replace(/<\/script/gi, "<\\/script");
      return wrapDocument(
        `<style>${JS_STYLE}</style>`,
        `<pre id="__out"></pre>
<script>${CONSOLE_CAPTURE}</script>
<script>${safeJs}</script>`
      );
    }

    default:
      return "";
  }
}