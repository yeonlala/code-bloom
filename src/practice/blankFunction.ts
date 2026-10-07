export type Blanked =
  | { ok: true; name: string; starter: string }
  | { ok: false; message: string };

type Located = {
  name: string;
  start: number;
  bodyOpen: number;
  bodyClose: number;
};

function skipString(source: string, start: number): number {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === "\\") {
      index += 2;
      continue;
    }
    if (quote === "`" && source[index] === "$" && source[index + 1] === "{") {
      const close = matchBrace(source, index + 1);
      if (close < 0) return -1;
      index = close + 1;
      continue;
    }
    if (source[index] === quote) return index + 1;
    index += 1;
  }
  return -1;
}

function matchBrace(source: string, openIndex: number): number {
  let depth = 0;
  let index = openIndex;
  while (index < source.length) {
    const char = source[index];
    if (char === "'" || char === '"' || char === "`") {
      index = skipString(source, index);
      if (index < 0) return -1;
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      const next = source.indexOf("\n", index + 2);
      index = next < 0 ? source.length : next + 1;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      const next = source.indexOf("*/", index + 2);
      if (next < 0) return -1;
      index = next + 2;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
}

function scanParens(source: string, openIndex: number): number {
  let depth = 0;
  let index = openIndex;
  while (index < source.length) {
    const char = source[index];
    if (char === "'" || char === '"' || char === "`") {
      index = skipString(source, index);
      if (index < 0) return -1;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
}

function skipSpace(source: string, index: number) {
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
}

function blockBody(source: string, openIndex: number): Located | { message: string } | null {
  if (source[openIndex] !== "{") return { message: "函数体写成大括号。" };
  const bodyClose = matchBrace(source, openIndex);
  if (bodyClose < 0) return { message: "函数体的大括号没合上。" };
  return { name: "", start: 0, bodyOpen: openIndex, bodyClose };
}

function findFunction(source: string): Located | { message: string } | null {
  const match = /(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(source);
  if (!match) return null;
  const parenOpen = match.index + match[0].length - 1;
  const parenClose = scanParens(source, parenOpen);
  if (parenClose < 0) return { message: "参数列表的括号没合上。" };
  const body = blockBody(source, skipSpace(source, parenClose + 1));
  if (!body) return null;
  if ("message" in body) return body;
  return { ...body, name: match[1], start: match.index };
}

function findArrow(source: string): Located | { message: string } | null {
  const re = /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    let index = skipSpace(source, match.index + match[0].length);
    let arrowAt = -1;
    if (source[index] === "(") {
      const parenClose = scanParens(source, index);
      if (parenClose < 0) return { message: "参数列表的括号没合上。" };
      index = skipSpace(source, parenClose + 1);
      if (source.slice(index, index + 2) === "=>") arrowAt = index;
    } else if (/[A-Za-z_$]/.test(source[index] ?? "")) {
      while (index < source.length && /[\w$]/.test(source[index])) index += 1;
      index = skipSpace(source, index);
      if (source.slice(index, index + 2) === "=>") arrowAt = index;
    }
    if (arrowAt < 0) continue;
    const body = blockBody(source, skipSpace(source, arrowAt + 2));
    if (!body) continue;
    if ("message" in body) return body;
    return { ...body, name: match[1], start: match.index };
  }
  return null;
}

function earlier(
  left: Located | { message: string } | null,
  right: Located | { message: string } | null,
) {
  const leftStart = left && "start" in left ? left.start : Number.POSITIVE_INFINITY;
  const rightStart = right && "start" in right ? right.start : Number.POSITIVE_INFINITY;
  if (!left && !right) return null;
  if (leftStart <= rightStart) return left;
  return right;
}

export function blankFunction(source: string): Blanked {
  if (!source.trim()) return { ok: false, message: "先贴原函数。" };

  const found = earlier(findFunction(source), findArrow(source));
  if (!found) {
    return { ok: false, message: "没找到函数。用 function 名字() { }，或 const 名字 = () => { }。" };
  }
  if ("message" in found) return { ok: false, message: found.message };

  const starter = `${source.slice(0, found.bodyOpen + 1)}\n  \n${source.slice(found.bodyClose)}`;
  return { ok: true, name: found.name, starter };
}
