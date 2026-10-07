import { useEffect, useRef } from "react";
import { highlight } from "./highlight";
import styles from "./CodePad.module.css";

type CodePadProps = {
  fileName: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
};

export function CodePad({ fileName, value, onChange, onSubmit }: CodePadProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);
  const lines = value.split("\n");
  const tokens = highlight(value);

  useEffect(() => {
    const input = inputRef.current;
    const caret = caretRef.current;
    if (!input || caret === null) return;
    input.selectionStart = caret;
    input.selectionEnd = caret;
    caretRef.current = null;
  }, [value]);

  return (
    <section className={styles.shell} aria-label={fileName}>
      <header className={styles.bar}>
        <span>{fileName}</span>
        <span className={styles.hint}>Ctrl + Enter 运行</span>
      </header>
      <div className={styles.stage}>
        <div className={styles.gutter} ref={gutterRef} aria-hidden="true">
          {lines.map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <div className={styles.editor}>
          <pre ref={highlightRef} className={styles.highlight} aria-hidden="true">
            {tokens.map((token, index) =>
              token.kind === "plain" ? (
                <span key={index}>{token.text}</span>
              ) : (
                <span key={index} className={styles[token.kind]}>
                  {token.text}
                </span>
              ),
            )}
            {value.endsWith("\n") ? "\n" : null}
          </pre>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={value}
            spellCheck={false}
            aria-label={fileName}
            onScroll={(event) => {
              const top = event.currentTarget.scrollTop;
              const left = event.currentTarget.scrollLeft;
              if (gutterRef.current) gutterRef.current.scrollTop = top;
              if (highlightRef.current) {
                highlightRef.current.scrollTop = top;
                highlightRef.current.scrollLeft = left;
              }
            }}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                onSubmit?.();
                return;
              }
              if (event.key !== "Tab") return;
              event.preventDefault();
              const target = event.currentTarget;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              caretRef.current = start + 2;
              onChange(`${value.slice(0, start)}  ${value.slice(end)}`);
            }}
          />
        </div>
      </div>
    </section>
  );
}
