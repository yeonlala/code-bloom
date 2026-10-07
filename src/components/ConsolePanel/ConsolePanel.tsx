import type { ConsoleLine } from "../../practice/compareRewrite";
import styles from "./ConsolePanel.module.css";

type ConsolePanelProps = {
  lines: ConsoleLine[];
};

export function ConsolePanel({ lines }: ConsolePanelProps) {
  return (
    <section className={styles.panel} aria-label="console">
      <h2 className={styles.title}>console</h2>
      {lines.length === 0 ? (
        <p className={styles.empty}>没有输出</p>
      ) : (
        <ol className={styles.list}>
          {lines.map((line, index) => (
            <li key={`${line.call}-${index}`} className={styles.line} data-level={line.level}>
              <span className={styles.level}>{line.level}</span>
              <span className={styles.call}>{line.call}</span>
              <pre className={styles.text}>{line.text}</pre>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
