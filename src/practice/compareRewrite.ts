export type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";

export type ConsoleLine = {
  level: ConsoleLevel;
  call: string;
  text: string;
};

export type RunOutcome =
  | { ok: true; logs: ConsoleLine[] }
  | { ok: false; message: string; logs?: ConsoleLine[] };

export type CompareOptions = {
  includes?: string[];
  excludes?: string[];
  signature?: boolean;
};

const CONSOLE_LEVELS: ConsoleLevel[] = ["log", "info", "warn", "error", "debug"];
const MAX_LOGS = 80;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) sorted[key] = stable(record[key]);
    return sorted;
  }
  return value;
}

export function formatValue(value: unknown) {
  if (typeof value === "undefined") return "undefined";
  try {
    const text = JSON.stringify(stable(value));
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

function readCalls(callsText: string) {
  return callsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"));
}

function formatArg(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "bigint") return `${value}n`;
  if (value instanceof Error) return value.stack || value.message;
  try {
    const text = JSON.stringify(value);
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

function bindConsole(call: string, logs: ConsoleLine[]) {
  const captured = {} as Record<ConsoleLevel, (...args: unknown[]) => void>;
  for (const level of CONSOLE_LEVELS) {
    captured[level] = (...args: unknown[]) => {
      if (logs.length < MAX_LOGS) {
        logs.push({ level, call, text: args.map(formatArg).join(" ") });
      } else if (logs.length === MAX_LOGS) {
        logs.push({ level: "warn", call, text: "后面的输出省略了" });
      }
      console[level](...args);
    };
  }
  return captured;
}

async function evalCall(
  source: string,
  call: string,
  logs?: ConsoleLine[],
): Promise<{ ok: true; value: unknown } | { ok: false; message: string }> {
  try {
    const run = new Function("console", `${source}\nreturn (${call});`) as (
      console: Record<ConsoleLevel, (...args: unknown[]) => void> | Console,
    ) => unknown;
    const value = await (logs ? run(bindConsole(call, logs)) : run(console));
    return { ok: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : "运行出错";
    return { ok: false, message };
  }
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shapeMessage(rewrite: string, options?: CompareOptions) {
  const missing = (options?.includes ?? []).filter((text) => !rewrite.includes(text));
  const left = (options?.excludes ?? []).filter((word) => new RegExp(`\\b${escapeRegExp(word)}\\b`).test(rewrite));
  if (!missing.length && !left.length) return "";
  const parts: string[] = [];
  if (missing.length) parts.push(`改写里要出现 ${missing.join("、")}`);
  if (left.length) parts.push(`${left.join("、")} 还留在改写里`);
  return `${parts.join("。")}。`;
}

export async function compareRewrite(
  original: string,
  rewrite: string,
  callsText: string,
  options?: CompareOptions,
): Promise<RunOutcome> {
  if (!original.trim()) return { ok: false, message: "先贴原函数。" };
  if (!rewrite.trim()) return { ok: false, message: "先重写函数。" };

  const calls = readCalls(callsText);
  if (calls.length === 0) return { ok: false, message: "先写一行调用。" };

  const { compileSource, matchSignature } = await import("./typeCheck");
  if (options?.signature) {
    const typed = await matchSignature(original, rewrite);
    if (!typed.ok) return typed;
  }

  const compiledOriginal = await compileSource(original, Boolean(options?.signature));
  if (!compiledOriginal.ok) return { ok: false, message: `原函数类型没过。${compiledOriginal.message}` };
  const compiledRewrite = await compileSource(rewrite, Boolean(options?.signature));
  if (!compiledRewrite.ok) return { ok: false, message: `类型没过。${compiledRewrite.message}` };

  const logs: ConsoleLine[] = [];
  for (const call of calls) {
    const expected = await evalCall(compiledOriginal.code, call);
    if (!expected.ok) return { ok: false, message: `原函数跑这行出错：${call}。${expected.message}`, logs };

    const actual = await evalCall(compiledRewrite.code, call, logs);
    if (!actual.ok) {
      logs.push({ level: "error", call, text: actual.message });
      return { ok: false, message: `你的函数跑这行出错：${call}。${actual.message}`, logs };
    }

    if (formatValue(actual.value) !== formatValue(expected.value)) {
      return {
        ok: false,
        message: `${call} 你的结果是 ${formatValue(actual.value)}，原函数是 ${formatValue(expected.value)}。`,
        logs,
      };
    }
  }

  const shape = shapeMessage(rewrite, options);
  if (shape) return { ok: false, message: `结果对了。${shape}`, logs };

  return { ok: true, logs };
}
