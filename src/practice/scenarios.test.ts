import { describe, expect, it } from "vitest";
import { blankFunction } from "./blankFunction";
import { compareRewrite } from "./compareRewrite";
import { SCENARIOS, TRACKS } from "./scenarios";
import { compileSource } from "./typeCheck";

describe("SCENARIOS", () => {
  it("runs ES6, then React, then Vue, then TS", () => {
    expect(SCENARIOS).toHaveLength(158);
    expect(new Set(SCENARIOS.map((item) => item.id)).size).toBe(158);
    expect(SCENARIOS.filter((item) => item.track === "ES6")).toHaveLength(54);
    expect(SCENARIOS.filter((item) => item.track === "React")).toHaveLength(51);
    expect(SCENARIOS.filter((item) => item.track === "Vue")).toHaveLength(50);
    expect(SCENARIOS.filter((item) => item.track === "TS")).toHaveLength(3);

    let seen = 0;
    for (const item of SCENARIOS) {
      const index = TRACKS.indexOf(item.track);
      expect(index, item.id).toBeGreaterThanOrEqual(seen);
      seen = index;
    }
  });

  it("matches the listed calls and can be blanked", async () => {
    for (const item of SCENARIOS) {
      if (!item.starter) {
        const blanked = blankFunction(item.source);
        expect(blanked.ok, item.id).toBe(true);
        if (blanked.ok) expect(blanked.starter, item.id).not.toContain("return");
      }

      const compiled = await compileSource(item.source, Boolean(item.signature));
      expect(compiled.ok, item.id).toBe(true);
      if (!compiled.ok) continue;

      for (const call of item.calls) {
        let value: unknown = new Function(`${compiled.code}\nreturn (${call.code});`)();
        if (value && typeof value === "object" && "then" in value && typeof value.then === "function") {
          value = await value;
        }
        expect(value, `${item.id} ${call.code}`).toEqual(call.expected);
      }

      const calls = item.calls.map((call) => call.code).join("\n");
      const options = { includes: item.includes, excludes: item.excludes, signature: item.signature };
      expect((await compareRewrite(item.source, item.source, calls, options)).ok, item.id).toBe(true);
      if (item.starter) {
        expect((await compareRewrite(item.source, item.starter, calls, options)).ok, item.id).toBe(false);
      }
    }
  });
});
