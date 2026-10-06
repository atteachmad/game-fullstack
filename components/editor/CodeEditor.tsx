"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import {
  acceptCompletion,
  autocompletion,
  snippet,
  snippetCompletion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { vue } from "@codemirror/lang-vue";
import { EditorState, Prec, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

import SuggestionBox from "@/components/editor/SuggestionBox";
import {
  LANGUAGE_LABELS,
  getSuggestions,
  type CodeSuggestion,
} from "@/lib/data/suggestions";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

/** Karakter yang dianggap bagian dari "kata" saat menyaring saran. */
const WORD_BEFORE_CURSOR = /[\w$@:.<-]*$/;
const WORD_AT_CURSOR = /[\w$@:.<-]+/;

const FILE_NAME: Record<Language, string> = {
  html: "index.html",
  css: "style.css",
  javascript: "script.js",
  php: "index.php",
  react: "App.jsx",
  vue: "App.vue",
  laravel: "web.php",
  nextjs: "page.tsx",
};

function languageExtension(language: Language): Extension {
  switch (language) {
    case "html":
      return html();
    case "css":
      return css();
    case "javascript":
      return javascript();
    case "react":
      return javascript({ jsx: true });
    case "nextjs":
      return javascript({ jsx: true, typescript: true });
    case "vue":
      return vue();
    case "php":
    case "laravel":
      return php();
  }
}

function createCompletionSource(items: CodeSuggestion[]) {
  const options = items.map((entry) =>
    snippetCompletion(entry.template, {
      label: entry.label,
      detail: entry.detail,
      info: entry.info,
      type: entry.type,
      boost: 10,
    })
  );

  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(WORD_AT_CURSOR);
    if (!word && !context.explicit) return null;

    return {
      from: word ? word.from : context.pos,
      options,
      validFor: /^[\w$@:.<-]*$/,
    };
  };
}

const editorTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent" },
    ".cm-content": { caretColor: "#22d3ee", padding: "12px 0" },
    ".cm-cursor": { borderLeftColor: "#22d3ee" },
    ".cm-scroller": { lineHeight: "1.7" },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": { padding: "4px 10px" },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
      background: "linear-gradient(90deg, #7c3aed, #22d3ee)",
      color: "#fff",
    },
    ".cm-completionDetail": { opacity: "0.75", fontStyle: "normal", marginLeft: "0.8em" },
    ".cm-completionInfo": {
      background: "#181c3a",
      color: "#e8e9ff",
      border: "1px solid rgba(139,92,246,0.4)",
      borderRadius: "10px",
      padding: "8px 12px",
    },
  },
  { dark: true }
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  /** Tinggi area editor, mis. "320px". */
  height?: string;
  className?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  height = "320px",
  className,
}: CodeEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const [query, setQuery] = useState("");

  const items = useMemo(() => getSuggestions(language), [language]);

  const extensions = useMemo<Extension[]>(
    () => [
      languageExtension(language),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": `Editor kode ${LANGUAGE_LABELS[language]}`,
      }),
      editorTheme,
      // Menambah sumber saran milik kita di samping saran bawaan bahasa
      EditorState.languageData.of(() => [{ autocomplete: createCompletionSource(items) }]),
      autocompletion({ icons: true, activateOnTyping: true, maxRenderedOptions: 12 }),
      // Tab menerima saran bila popup terbuka; jika tidak, Tab berfungsi normal
      Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
      // Pantau kata di posisi kursor untuk kotak saran
      EditorView.updateListener.of((update) => {
        if (!update.docChanged && !update.selectionSet) return;
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        const match = WORD_BEFORE_CURSOR.exec(line.text.slice(0, head - line.from));
        setQuery(match ? match[0] : "");
      }),
    ],
    [language, items]
  );

  const visibleSuggestions = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return items.slice(0, 6);

    return items
      .filter((entry) => entry.label.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(b.label.toLowerCase().startsWith(q)) -
          Number(a.label.toLowerCase().startsWith(q))
      )
      .slice(0, 6);
  }, [items, query]);

  const handlePick = useCallback((suggestion: CodeSuggestion) => {
    const view = viewRef.current;
    if (!view) return;

    const head = view.state.selection.main.head;
    const line = view.state.doc.lineAt(head);
    const match = WORD_BEFORE_CURSOR.exec(line.text.slice(0, head - line.from));
    const from = head - (match ? match[0].length : 0);

    snippet(suggestion.template)(view, null, from, head);
    view.focus();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="neu-inset overflow-hidden focus-within:ring-2 focus-within:ring-arcane-400/60">
        {/* Bilah judul jendela editor */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-neon-red shadow-[0_0_8px_rgba(251,113,133,0.7)]" />
            <span className="h-3 w-3 rounded-full bg-neon-gold shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <span className="h-3 w-3 rounded-full bg-neon-lime shadow-[0_0_8px_rgba(163,230,53,0.7)]" />
          </div>
          <span className="font-mono text-xs text-slate-400">{FILE_NAME[language]}</span>
          <span className="w-12" aria-hidden="true" />
        </div>

        <CodeMirror
          value={value}
          height={height}
          theme="dark"
          extensions={extensions}
          onChange={onChange}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            completionKeymap: false,
          }}
        />
      </div>

      <SuggestionBox
        suggestions={visibleSuggestions}
        query={query}
        onPick={handlePick}
      />
    </div>
  );
}