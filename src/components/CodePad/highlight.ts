const KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

export type TokenKind = "plain" | "key" | "string" | "comment";

export type Token = {
  text: string;
  kind: TokenKind;
};

function push(tokens: Token[], kind: TokenKind, text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
    return;
  }
  tokens.push({ text, kind });
}

export function highlight(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("//", index)) {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      push(tokens, "comment", source.slice(index, stop));
      index = stop;
      continue;
    }

    if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      const stop = end === -1 ? source.length : end + 2;
      push(tokens, "comment", source.slice(index, stop));
      index = stop;
      continue;
    }

    const quote = source[index];
    if (quote === '"' || quote === "'" || quote === "`") {
      let cursor = index + 1;
      while (cursor < source.length) {
        if (source[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (source[cursor] === quote) {
          cursor += 1;
          break;
        }
        if (quote !== "`" && source[cursor] === "\n") break;
        cursor += 1;
      }
      push(tokens, "string", source.slice(index, cursor));
      index = cursor;
      continue;
    }

    if (/[A-Za-z_$]/.test(source[index])) {
      let cursor = index + 1;
      while (cursor < source.length && /[\w$]/.test(source[cursor])) cursor += 1;
      const word = source.slice(index, cursor);
      push(tokens, KEYWORDS.has(word) ? "key" : "plain", word);
      index = cursor;
      continue;
    }

    push(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}
