import { useRef, useState } from "react";
import { CallExamples } from "../components/CallExamples/CallExamples";
import { ConsolePanel } from "../components/ConsolePanel/ConsolePanel";
import { CodePad } from "../components/CodePad/CodePad";
import { RunResult } from "../components/RunResult/RunResult";
import { StepList } from "../components/StepList/StepList";
import { blankFunction } from "./blankFunction";
import { compareRewrite, type RunOutcome } from "./compareRewrite";
import { callText, SCENARIOS, type Scenario } from "./scenarios";
import styles from "./PracticePage.module.css";

const PASSED_KEY = "practice-passed";
const FIRST = SCENARIOS[0];

function loadPassed(): string[] {
  try {
    const raw = localStorage.getItem(PASSED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

type Opened = { rewrite: string; fileName: string } | { outcome: Extract<RunOutcome, { ok: false }> };

function openScenario(item: Scenario): Opened {
  const ext = item.signature ? "ts" : "js";
  if (item.starter) {
    const named = blankFunction(item.starter);
    const name = named.ok ? named.name : "重写";
    return { rewrite: item.starter, fileName: `${name}.${ext}` };
  }
  const blanked = blankFunction(item.source);
  if (!blanked.ok) return { outcome: blanked };
  return { rewrite: blanked.starter, fileName: `${blanked.name}.${ext}` };
}

export function PracticePage() {
  const opened = openScenario(FIRST);
  const runId = useRef(0);
  const [choice, setChoice] = useState(FIRST.id);
  const [rewrite, setRewrite] = useState("rewrite" in opened ? opened.rewrite : "");
  const [fileName, setFileName] = useState("fileName" in opened ? opened.fileName : "重写.js");
  const [outcome, setOutcome] = useState<RunOutcome | null>("outcome" in opened ? opened.outcome : null);
  const [passed, setPassed] = useState<string[]>(loadPassed);

  const index = Math.max(0, SCENARIOS.findIndex((item) => item.id === choice));
  const scenario = SCENARIOS[index];

  function applyScenario(item: Scenario) {
    const next = openScenario(item);
    if ("outcome" in next) {
      setOutcome(next.outcome);
      return;
    }
    setRewrite(next.rewrite);
    setFileName(next.fileName);
  }

  function select(id: string) {
    const item = SCENARIOS.find((entry) => entry.id === id);
    if (!item) return;
    runId.current += 1;
    setChoice(id);
    setOutcome(null);
    applyScenario(item);
  }

  function redo() {
    runId.current += 1;
    setOutcome(null);
    applyScenario(scenario);
  }

  async function run() {
    const currentRun = runId.current + 1;
    runId.current = currentRun;
    let next: RunOutcome;
    try {
      next = await compareRewrite(scenario.source, rewrite, callText(scenario), {
        includes: scenario.includes,
        excludes: scenario.excludes,
        signature: scenario.signature,
      });
    } catch (error) {
      next = { ok: false, message: error instanceof Error ? error.message : "运行出错" };
    }
    if (currentRun !== runId.current) return;
    setOutcome(next);
    if (!next.ok) return;
    setPassed((current) => {
      if (current.includes(scenario.id)) return current;
      const saved = [...current, scenario.id];
      localStorage.setItem(PASSED_KEY, JSON.stringify(saved));
      return saved;
    });
  }

  return (
    <main className={styles.page}>
      <StepList steps={SCENARIOS} currentId={scenario.id} passedIds={passed} onSelect={select} />

      <section className={styles.work}>
        <header className={styles.heading}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{scenario.name}</h1>
            {passed.includes(scenario.id) ? <span className={styles.badge}>已通过</span> : null}
          </div>
          <p className={styles.task}>{scenario.task}</p>
        </header>

        <CallExamples calls={scenario.calls} />

        <p className={styles.label}>{scenario.signature ? "补类型" : scenario.starter ? "改写" : "重写"}</p>
        <CodePad
          fileName={fileName}
          value={rewrite}
          onChange={(value) => {
            setRewrite(value);
            setOutcome(null);
          }}
          onSubmit={run}
        />

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            type="button"
            disabled={index <= 0}
            onClick={() => select(SCENARIOS[index - 1].id)}
          >
            上一题
          </button>
          <button className={styles.run} type="button" onClick={run}>
            运行
          </button>
          <button className={styles.secondary} type="button" onClick={redo}>
            重做
          </button>
          <button
            className={styles.secondary}
            type="button"
            disabled={index >= SCENARIOS.length - 1}
            onClick={() => select(SCENARIOS[index + 1].id)}
          >
            下一题
          </button>
        </div>
        <RunResult outcome={outcome} />
        {outcome && "logs" in outcome && outcome.logs ? <ConsolePanel lines={outcome.logs} /> : null}
      </section>
    </main>
  );
}
