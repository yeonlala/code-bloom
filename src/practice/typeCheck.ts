import type * as TS from "typescript";

type Typescript = typeof import("typescript");

const LIB_NAME = "lib.d.ts";
const FILE_NAME = "exercise.ts";
const LIB = `interface Boolean {}
interface Number {}
interface String {}
interface Object {}
interface Function {}
interface Array<T> {
  length: number;
  [n: number]: T;
}
`;

function hostFor(ts: Typescript, files: Map<string, string>): TS.CompilerHost {
  return {
    getSourceFile(fileName, languageVersion) {
      const text = files.get(fileName);
      if (text === undefined) return undefined;
      return ts.createSourceFile(fileName, text, languageVersion, true, ts.ScriptKind.TS);
    },
    getDefaultLibFileName: () => LIB_NAME,
    writeFile() {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (fileName) => files.has(fileName),
    readFile: (fileName) => files.get(fileName),
  };
}

function programFor(ts: Typescript, code: string) {
  const files = new Map<string, string>([
    [FILE_NAME, code],
    [LIB_NAME, LIB],
  ]);
  return ts.createProgram([FILE_NAME], { strict: true, target: ts.ScriptTarget.ESNext }, hostFor(ts, files));
}

function firstFunction(ts: Typescript, sourceFile: TS.SourceFile) {
  let found: TS.FunctionDeclaration | undefined;
  function visit(node: TS.Node) {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function missingAnnotation(ts: Typescript, code: string) {
  const sourceFile = ts.createSourceFile(FILE_NAME, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
  const fn = firstFunction(ts, sourceFile);
  if (!fn) return "没找到函数。";
  for (const param of fn.parameters) {
    if (param.type) continue;
    const name = ts.isIdentifier(param.name) ? param.name.text : "参数";
    return `参数 ${name} 还没写类型。`;
  }
  if (!fn.type) return "返回值还没写类型。";
  return "";
}

function signatureText(ts: Typescript, code: string) {
  const program = programFor(ts, code);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((item) => item.file?.fileName === FILE_NAME);
  if (diagnostics.length) {
    return { ok: false as const, message: ts.flattenDiagnosticMessageText(diagnostics[0].messageText, "\n") };
  }
  const sourceFile = program.getSourceFile(FILE_NAME);
  const fn = sourceFile ? firstFunction(ts, sourceFile) : undefined;
  const signature = fn ? program.getTypeChecker().getSignatureFromDeclaration(fn) : undefined;
  if (!signature) return { ok: false as const, message: "没找到函数签名。" };
  return { ok: true as const, text: program.getTypeChecker().signatureToString(signature) };
}

function sameSignature(left: string, right: string) {
  return left.replace(/\s+/g, "") === right.replace(/\s+/g, "");
}

export async function matchSignature(original: string, rewrite: string) {
  const ts = await import("typescript");
  const missing = missingAnnotation(ts, rewrite);
  if (missing) return { ok: false as const, message: missing };
  const expected = signatureText(ts, original);
  if (!expected.ok) return { ok: false as const, message: `原函数类型没过。${expected.message}` };
  const actual = signatureText(ts, rewrite);
  if (!actual.ok) return { ok: false as const, message: `类型没过。${actual.message}` };
  if (!sameSignature(expected.text, actual.text)) {
    return { ok: false as const, message: `签名要写成 ${expected.text}。现在是 ${actual.text}。` };
  }
  return { ok: true as const };
}

export async function compileSource(source: string, typed: boolean) {
  if (!typed) return { ok: true as const, code: source };
  const ts = await import("typescript");
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  const diagnostics = (output.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
  if (diagnostics.length) {
    return {
      ok: false as const,
      message: ts.flattenDiagnosticMessageText(diagnostics[0].messageText, "\n"),
    };
  }
  return { ok: true as const, code: output.outputText };
}
