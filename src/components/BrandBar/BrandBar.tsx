import styles from "./BrandBar.module.css";

export function BrandBar() {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <p className={styles.brand}>CodeBloom</p>
        <p className={styles.slogan}>让代码能力持续生长</p>
        <p className={styles.en}>Learn. Practice. Grow.</p>
        <p className={styles.copy}>AI 让写代码变快，也让手变生。让你的代码能力重新生长。</p>
      </div>
    </header>
  );
}
