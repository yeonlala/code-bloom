import { describe, expect, it } from "vitest";
import { blankFunction } from "./blankFunction";
import { compareRewrite } from "./compareRewrite";

const original = `function classNames(...names) {
  return names.filter(Boolean).join(" ");
}
`;

describe("blankFunction", () => {
  it("keeps the signature and clears the body", () => {
    const blanked = blankFunction(original);
    expect(blanked.ok).toBe(true);
    if (!blanked.ok) return;
    expect(blanked.name).toBe("classNames");
    expect(blanked.starter).toContain("function classNames(...names)");
    expect(blanked.starter).not.toContain("filter");
  });

  it("clears an arrow function body", () => {
    const blanked = blankFunction(`const parseQuery = (search) => {\n  return search;\n};\n`);
    expect(blanked.ok).toBe(true);
    if (!blanked.ok) return;
    expect(blanked.name).toBe("parseQuery");
    expect(blanked.starter).toContain("=>");
    expect(blanked.starter).not.toContain("return search");
  });

  it("asks for a function when the paste has none", () => {
    expect(blankFunction("const n = 1;").ok).toBe(false);
  });
});

describe("compareRewrite", () => {
  it("passes when both sides return the same value", async () => {
    const rewrite = `function classNames(...names) {
      return names.filter(Boolean).join(" ");
    }`;
    expect((await compareRewrite(original, rewrite, `classNames("btn", false, "on")`)).ok).toBe(true);
  });

  it("shows both results when they differ", async () => {
    const rewrite = `function classNames(...names) {
      return names.join(" ");
    }`;
    const outcome = await compareRewrite(original, rewrite, `classNames("btn", false, "on")`);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.message).toContain("你的结果是");
      expect(outcome.message).toContain("原函数是");
    }
  });

  it("treats different key order as the same object", async () => {
    const left = `function pair() { return { b: 1, a: 2 }; }`;
    const right = `function pair() { return { a: 2, b: 1 }; }`;
    expect((await compareRewrite(left, right, "pair()")).ok).toBe(true);
  });

  it("keeps console output from the rewrite", async () => {
    const rewrite = `function classNames(...names) {
      console.log("names", names);
      console.warn("check");
      return names.filter(Boolean).join(" ");
    }`;
    const outcome = await compareRewrite(original, rewrite, `classNames("btn", false, "on")`);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.logs.map((line) => line.level + " " + line.text)).toEqual([
      'log names ["btn",false,"on"]',
      "warn check",
    ]);
    expect(outcome.logs[0]?.call).toBe('classNames("btn", false, "on")');
  });

  it("asks for a call before running", async () => {
    const outcome = await compareRewrite(original, original, "");
    expect(outcome).toEqual({ ok: false, message: "先写一行调用。" });
  });
});
