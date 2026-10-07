import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

describe("highlight", () => {
  it("keeps every character in order", () => {
    const source = 'function rename(user) {\n  return user.name; // kept\n}\n';
    expect(highlight(source).map((token) => token.text).join("")).toBe(source);
  });

  it("colors keywords, strings, and comments", () => {
    const tokens = highlight('const name = "甲"; // 改名');
    expect(tokens.filter((token) => token.kind === "key").map((token) => token.text)).toEqual(["const"]);
    expect(tokens.filter((token) => token.kind === "string").map((token) => token.text)).toEqual(['"甲"']);
    expect(tokens.filter((token) => token.kind === "comment").map((token) => token.text)).toEqual(["// 改名"]);
  });
});
