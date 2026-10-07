# CodeBloom

让代码能力持续生长。

前端写法练习。题目按 ES6、React、Vue、TypeScript 排列。每题提供任务说明和调用示例，编辑区只保留函数签名。补全实现后，用同一组调用与参考实现对比，返回值一致即通过。

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:5173/](http://localhost:5173/)。

```bash
npm test
npm run build
```

`npm test` 校验题目顺序、示例结果，以及参考实现可通过对比。`npm run build` 先做类型检查，再打包。

推送到 `main` 后，GitHub Actions 构建并发布到 GitHub Pages。

## 使用

1. 左侧选题。顺序为 ES6、React、Vue、TypeScript。
2. 阅读说明与示例。编辑区只保留签名。题目分为重写、改写和类型补全。
3. 写回函数体。`Ctrl + Enter` 或点击「运行」。`Tab` 插入两个空格。
4. 结果一致时显示「通过」，并记在本机。不一致时并列显示两边的返回值。
5. 「上一题」「下一题」切换题目，「重做」恢复初始内容。
6. `console.log`、`info`、`warn`、`error`、`debug` 显示在页面下方，并同步到浏览器开发者工具。运行错误也在此处显示。

## 题目

共 158 题：ES6 54，React 51，Vue 50，TypeScript 3。

题目定义在 `src/practice/scenarios.ts` 和 `src/practice/extraScenarios.ts`。每题包含说明、参考实现和调用示例，覆盖日常写法、异步与请求、类型补全，以及把循环改写为 `filter` / `map`。

## 目录

```
src/practice/scenarios.ts       题目与顺序
src/practice/extraScenarios.ts  补充题目
src/practice/blankFunction.ts   保留签名，去掉函数体
src/practice/compareRewrite.ts  对比结果，收集 console
src/practice/typeCheck.ts       类型检查
src/practice/PracticePage.tsx   练习页
src/components/                 目录、示例、编辑区、结果、console
```