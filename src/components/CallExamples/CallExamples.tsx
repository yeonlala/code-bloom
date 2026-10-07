import { formatValue } from "../../practice/compareRewrite";
import styles from "./CallExamples.module.css";

type CallExample = {
  code: string;
  expected: unknown;
};

type CallExamplesProps = {
  calls: CallExample[];
};

export function CallExamples({ calls }: CallExamplesProps) {
  return (
    <section className={styles.examples} aria-label="举例">
      <h2 className={styles.title}>举例</h2>
      <ul className={styles.list}>
        {calls.map((call) => (
          <li key={call.code} className={styles.item}>
            <code className={styles.code}>{call.code}</code>
            <span className={styles.arrow}>→</span>
            <code className={styles.result}>{formatValue(call.expected)}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
