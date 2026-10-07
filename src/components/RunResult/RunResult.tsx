import type { RunOutcome } from "../../practice/compareRewrite";
import styles from "./RunResult.module.css";

type RunResultProps = {
  outcome: RunOutcome | null;
};

export function RunResult({ outcome }: RunResultProps) {
  if (!outcome) return null;

  return (
    <p className={outcome.ok ? styles.pass : styles.fail} role="status">
      {outcome.ok ? "通过" : `没通过。${outcome.message}`}
    </p>
  );
}
