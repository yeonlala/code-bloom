import { extraScenarios } from "./extraScenarios";

export type Track = "ES6" | "React" | "Vue" | "TS";

export type ScenarioCall = {
  code: string;
  expected: unknown;
};

export type Scenario = {
  id: string;
  track: Track;
  name: string;
  task: string;
  source: string;
  calls: ScenarioCall[];
  starter?: string;
  includes?: string[];
  excludes?: string[];
  signature?: boolean;
};

export const TRACKS: Track[] = ["ES6", "React", "Vue", "TS"];

function scenario(
  id: string,
  track: Track,
  name: string,
  task: string,
  source: string,
  calls: ScenarioCall[],
): Scenario {
  return { id, track, name, task, source, calls };
}

const BASE_SCENARIOS: Scenario[] = [
  scenario(
    "rename-fields",
    "ES6",
    "解构改名",
    "从对象里取出字段，把 name 改叫 userName。别的字段丢掉。",
    String.raw`function renameFields(user) {
  const { id, name: userName } = user;
  return { id, userName };
}`,
    [
      {
        code: 'renameFields({ id: 1, name: "甲", role: "admin" })',
        expected: { id: 1, userName: "甲" },
      },
    ],
  ),
  scenario(
    "take-head",
    "ES6",
    "解构数组",
    "取出前两项，剩下的放进 rest。",
    String.raw`function takeHead(items) {
  const [first, second, ...rest] = items;
  return { first, second, rest };
}`,
    [
      { code: "takeHead([1, 2, 3, 4])", expected: { first: 1, second: 2, rest: [3, 4] } },
      { code: 'takeHead(["a", "b"])', expected: { first: "a", second: "b", rest: [] } },
    ],
  ),
  scenario(
    "greet",
    "ES6",
    "默认参数",
    "没传名字时用「朋友」。",
    String.raw`function greet(name = "朋友") {
  return "你好，" + name;
}`,
    [
      { code: "greet()", expected: "你好，朋友" },
      { code: 'greet("甲")', expected: "你好，甲" },
    ],
  ),
  scenario(
    "join-names",
    "ES6",
    "剩余参数",
    "第一个名字单独拿，后面的名字收进数组，用顿号接上。",
    String.raw`function joinNames(first, ...rest) {
  return [first, ...rest].join("、");
}`,
    [
      { code: 'joinNames("甲", "乙", "丙")', expected: "甲、乙、丙" },
      { code: 'joinNames("甲")', expected: "甲" },
    ],
  ),
  scenario(
    "merge-config",
    "ES6",
    "展开合并对象",
    "合并两个对象。同名字段以后面的为准。",
    String.raw`function mergeConfig(base, extra) {
  return { ...base, ...extra };
}`,
    [
      {
        code: "mergeConfig({ a: 1, b: 2 }, { b: 3, c: 4 })",
        expected: { a: 1, b: 3, c: 4 },
      },
    ],
  ),
  scenario(
    "append-items",
    "ES6",
    "展开拼接数组",
    "把两段数组接成新数组。不要改原来的数组。",
    String.raw`function appendItems(items, extra) {
  return [...items, ...extra];
}`,
    [{ code: "appendItems([1, 2], [3])", expected: [1, 2, 3] }],
  ),
  scenario(
    "welcome-text",
    "ES6",
    "模板字符串",
    "拼出「名字，你有 N 条未读」。",
    "function welcomeText(user) {\n  return `${user.name}，你有 ${user.count} 条未读`;\n}",
    [{ code: 'welcomeText({ name: "甲", count: 2 })', expected: "甲，你有 2 条未读" }],
  ),
  scenario(
    "to-options",
    "ES6",
    "map 映射",
    "把用户列表映射成下拉选项，value 用 id，label 用 name。",
    String.raw`function toOptions(users) {
  return users.map((user) => ({ value: user.id, label: user.name }));
}`,
    [
      {
        code: 'toOptions([{ id: 1, name: "甲" }, { id: 2, name: "乙" }])',
        expected: [
          { value: 1, label: "甲" },
          { value: 2, label: "乙" },
        ],
      },
    ],
  ),
  scenario(
    "open-tasks",
    "ES6",
    "filter 筛选",
    "只留下还没完成的任务。",
    String.raw`function openTasks(tasks) {
  return tasks.filter((task) => !task.done);
}`,
    [
      {
        code: "openTasks([{ id: 1, done: true }, { id: 2, done: false }])",
        expected: [{ id: 2, done: false }],
      },
    ],
  ),
  scenario(
    "find-user",
    "ES6",
    "find 查找",
    "按 id 找用户。找不到返回 null。",
    String.raw`function findUser(users, id) {
  return users.find((user) => user.id === id) || null;
}`,
    [
      { code: 'findUser([{ id: 1, name: "甲" }], 1)', expected: { id: 1, name: "甲" } },
      { code: 'findUser([{ id: 1, name: "甲" }], 2)', expected: null },
    ],
  ),
  scenario(
    "has-error",
    "ES6",
    "some 是否存在",
    "有任意一项 status 是 error 就返回 true。",
    String.raw`function hasError(items) {
  return items.some((item) => item.status === "error");
}`,
    [
      { code: 'hasError([{ status: "ok" }, { status: "error" }])', expected: true },
      { code: 'hasError([{ status: "ok" }])', expected: false },
    ],
  ),
  scenario(
    "all-done",
    "ES6",
    "every 是否全部",
    "每一项都完成才返回 true。空数组也算全部完成。",
    String.raw`function allDone(tasks) {
  return tasks.every((task) => task.done);
}`,
    [
      { code: "allDone([{ done: true }, { done: true }])", expected: true },
      { code: "allDone([])", expected: true },
      { code: "allDone([{ done: false }])", expected: false },
    ],
  ),
  scenario(
    "total-price",
    "ES6",
    "reduce 归总",
    "把 price 加总。空数组是 0。",
    String.raw`function totalPrice(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
    [
      { code: "totalPrice([{ price: 10 }, { price: 5 }])", expected: 15 },
      { code: "totalPrice([])", expected: 0 },
    ],
  ),
  scenario(
    "active-names",
    "ES6",
    "筛选后再映射",
    "先留下 active 的用户，再取出他们的 name。",
    String.raw`function activeNames(users) {
  return users.filter((user) => user.active).map((user) => user.name);
}`,
    [
      {
        code: 'activeNames([{ name: "甲", active: true }, { name: "乙", active: false }, { name: "丙", active: true }])',
        expected: ["甲", "丙"],
      },
    ],
  ),
  scenario(
    "to-pairs",
    "ES6",
    "对象转列表",
    "把对象转成 [键, 值] 列表，保持原来的字段顺序。",
    String.raw`function toPairs(obj) {
  return Object.entries(obj);
}`,
    [{ code: "toPairs({ b: 1, a: 2 })", expected: [["b", 1], ["a", 2]] }],
  ),
  scenario(
    "from-pairs",
    "ES6",
    "列表转对象",
    "把 [键, 值] 列表转回对象。",
    String.raw`function fromPairs(pairs) {
  return Object.fromEntries(pairs);
}`,
    [{ code: 'fromPairs([["a", 1], ["b", 2]])', expected: { a: 1, b: 2 } }],
  ),
  scenario(
    "unique-ids",
    "ES6",
    "Set 去重",
    "去掉重复值，保留第一次出现的顺序。",
    String.raw`function uniqueIds(ids) {
  return [...new Set(ids)];
}`,
    [{ code: "uniqueIds([1, 2, 1, 3, 2])", expected: [1, 2, 3] }],
  ),
  scenario(
    "fill-count",
    "ES6",
    "空值才用默认",
    "只有 null 和 undefined 用默认值。0 和空字符串要保留。",
    String.raw`function fillCount(count, fallback) {
  if (count === null || count === undefined) return fallback;
  return count;
}`,
    [
      { code: "fillCount(0, 10)", expected: 0 },
      { code: "fillCount(null, 10)", expected: 10 },
      { code: 'fillCount("", 10)', expected: "" },
    ],
  ),
  scenario(
    "class-names",
    "React",
    "className",
    "给 className 拼接类名。false、null、undefined、0、空字符串丢掉。",
    String.raw`function classNames(...names) {
  return names.filter(Boolean).join(" ");
}`,
    [
      { code: 'classNames("btn", false, "on")', expected: "btn on" },
      { code: 'classNames("a", null, undefined, "b")', expected: "a b" },
      { code: 'classNames("", 0, false)', expected: "" },
    ],
  ),
  scenario(
    "merge-props",
    "React",
    "合并 props",
    "默认 props 和传入 props 合并。className 两边都要留下，用空格接上。",
    String.raw`function mergeProps(defaults, props) {
  return {
    ...defaults,
    ...props,
    className: [defaults.className, props.className].filter(Boolean).join(" "),
  };
}`,
    [
      {
        code: 'mergeProps({ type: "button", className: "btn" }, { className: "primary", disabled: true })',
        expected: { type: "button", className: "btn primary", disabled: true },
      },
    ],
  ),
  scenario(
    "with-keys",
    "React",
    "列表加上 key",
    "渲染列表前，给每一项带上 key，key 用 id。",
    String.raw`function withKeys(items) {
  return items.map((item) => ({ key: item.id, item }));
}`,
    [
      {
        code: 'withKeys([{ id: "a", name: "甲" }])',
        expected: [{ key: "a", item: { id: "a", name: "甲" } }],
      },
    ],
  ),
  scenario(
    "input-value",
    "React",
    "受控输入",
    "给 input 的 value。null 和 undefined 显示成空字符串。0 要显示成 \"0\"。",
    String.raw`function inputValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}`,
    [
      { code: "inputValue(null)", expected: "" },
      { code: "inputValue(0)", expected: "0" },
      { code: 'inputValue("甲")', expected: "甲" },
    ],
  ),
  scenario(
    "toggle-flag",
    "React",
    "切换开关",
    "翻转 on。别的字段保留。不要改原对象。",
    String.raw`function toggleFlag(state) {
  return { ...state, on: !state.on };
}`,
    [{ code: "toggleFlag({ on: false, id: 1 })", expected: { on: true, id: 1 } }],
  ),
  scenario(
    "update-field",
    "React",
    "更新表单字段",
    "只改一个字段，返回新对象。",
    String.raw`function updateField(form, name, value) {
  return { ...form, [name]: value };
}`,
    [{ code: 'updateField({ name: "甲" }, "age", 18)', expected: { name: "甲", age: 18 } }],
  ),
  scenario(
    "first-error",
    "React",
    "必填校验",
    "找到第一个空白字段，返回「标签必填」。都有值就返回空字符串。空白字符也算空。",
    String.raw`function firstError(fields) {
  for (const field of fields) {
    if (!String(field.value || "").trim()) return field.label + "必填";
  }
  return "";
}`,
    [
      {
        code: 'firstError([{ label: "姓名", value: "" }, { label: "邮箱", value: "a" }])',
        expected: "姓名必填",
      },
      { code: 'firstError([{ label: "姓名", value: "甲" }])', expected: "" },
    ],
  ),
  scenario(
    "button-text",
    "React",
    "按钮文案",
    "loading 显示「提交中」，success 显示「已保存」，其他显示「保存」。",
    String.raw`function buttonText(status) {
  if (status === "loading") return "提交中";
  if (status === "success") return "已保存";
  return "保存";
}`,
    [
      { code: 'buttonText("loading")', expected: "提交中" },
      { code: 'buttonText("success")', expected: "已保存" },
      { code: 'buttonText("idle")', expected: "保存" },
    ],
  ),
  scenario(
    "add-item",
    "React",
    "新增一项",
    "把新项加到列表末尾。不要改原数组。",
    String.raw`function addItem(items, item) {
  return [...items, item];
}`,
    [{ code: "addItem([{ id: 1 }], { id: 2 })", expected: [{ id: 1 }, { id: 2 }] }],
  ),
  scenario(
    "remove-item",
    "React",
    "删除一项",
    "按 id 删掉一项。不要改原数组。",
    String.raw`function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}`,
    [{ code: "removeItem([{ id: 1 }, { id: 2 }], 1)", expected: [{ id: 2 }] }],
  ),
  scenario(
    "patch-item",
    "React",
    "修改一项",
    "按 id 合并补丁。其他项原样留下。",
    String.raw`function patchItem(items, id, patch) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}`,
    [
      {
        code: 'patchItem([{ id: 1, name: "甲" }, { id: 2, name: "乙" }], 2, { name: "丙" })',
        expected: [
          { id: 1, name: "甲" },
          { id: 2, name: "丙" },
        ],
      },
    ],
  ),
  scenario(
    "read-click-id",
    "React",
    "读取点击 id",
    "从点击事件的 currentTarget.dataset.id 取出 id。",
    String.raw`function readClickId(event) {
  return event.currentTarget.dataset.id;
}`,
    [{ code: 'readClickId({ currentTarget: { dataset: { id: "8" } } })', expected: "8" }],
  ),
  scenario(
    "is-disabled",
    "React",
    "是否禁用",
    "正在提交，或者没有权限，按钮就要禁用。",
    String.raw`function isDisabled(state) {
  return Boolean(state.loading || !state.allowed);
}`,
    [
      { code: "isDisabled({ loading: false, allowed: true })", expected: false },
      { code: "isDisabled({ loading: true, allowed: true })", expected: true },
      { code: "isDisabled({ loading: false, allowed: false })", expected: true },
    ],
  ),
  scenario(
    "full-name",
    "React",
    "拼显示名",
    "姓和名接在一起。空的那一段丢掉。",
    String.raw`function fullName(user) {
  return [user.lastName, user.firstName].filter(Boolean).join("");
}`,
    [
      { code: 'fullName({ lastName: "张", firstName: "三" })', expected: "张三" },
      { code: 'fullName({ lastName: "张", firstName: "" })', expected: "张" },
    ],
  ),
  scenario(
    "is-selected",
    "React",
    "是否选中",
    "id 在已选列表里就返回 true。",
    String.raw`function isSelected(selectedIds, id) {
  return selectedIds.includes(id);
}`,
    [
      { code: "isSelected([1, 2], 2)", expected: true },
      { code: "isSelected([1, 2], 3)", expected: false },
    ],
  ),
  scenario(
    "page-edges",
    "React",
    "翻页是否可点",
    "第 1 页不能上一页。最后一页不能下一页。",
    String.raw`function pageEdges(page, totalPages) {
  return { prev: page > 1, next: page < totalPages };
}`,
    [
      { code: "pageEdges(1, 3)", expected: { prev: false, next: true } },
      { code: "pageEdges(3, 3)", expected: { prev: true, next: false } },
    ],
  ),
  scenario(
    "vue-class",
    "Vue",
    "class 绑定",
    "把 :class 的对象转成字符串。值为真的类名留下，用空格接上。",
    String.raw`function vueClass(binding) {
  return Object.keys(binding).filter((key) => binding[key]).join(" ");
}`,
    [{ code: "vueClass({ active: true, disabled: false, on: true })", expected: "active on" }],
  ),
  scenario(
    "vue-style",
    "Vue",
    "style 绑定",
    "把 :style 的对象转成 CSS 文本。驼峰改成中划线。null 和空字符串丢掉。",
    String.raw`function vueStyle(style) {
  return Object.keys(style)
    .filter((key) => style[key] != null && style[key] !== "")
    .map((key) => key.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase()) + ": " + style[key])
    .join("; ");
}`,
    [
      {
        code: 'vueStyle({ color: "red", fontSize: "12px" })',
        expected: "color: red; font-size: 12px",
      },
    ],
  ),
  scenario(
    "model-text",
    "Vue",
    "v-model 文本",
    "去掉首尾空格。结果是空的就返回 null。",
    String.raw`function modelText(value) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}`,
    [
      { code: 'modelText("  甲  ")', expected: "甲" },
      { code: 'modelText("   ")', expected: null },
      { code: "modelText(null)", expected: null },
    ],
  ),
  scenario(
    "model-number",
    "Vue",
    "v-model 数字",
    "空字符串、null 和不是数字的文本返回 null。能转成数字就返回数字。",
    String.raw`function modelNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
}`,
    [
      { code: 'modelNumber("")', expected: null },
      { code: 'modelNumber("12")', expected: 12 },
      { code: 'modelNumber("x")', expected: null },
    ],
  ),
  scenario(
    "done-count",
    "Vue",
    "完成数量",
    "数出 done 为 true 的条数。",
    String.raw`function doneCount(todos) {
  return todos.filter((todo) => todo.done).length;
}`,
    [{ code: "doneCount([{ done: true }, { done: false }, { done: true }])", expected: 2 }],
  ),
  scenario(
    "visible-todos",
    "Vue",
    "过滤待办",
    "filter 为 done 只留完成的，open 只留未完成的，all 全部留下。",
    String.raw`function visibleTodos(todos, filter) {
  if (filter === "done") return todos.filter((todo) => todo.done);
  if (filter === "open") return todos.filter((todo) => !todo.done);
  return todos.slice();
}`,
    [
      {
        code: 'visibleTodos([{ id: 1, done: true }, { id: 2, done: false }], "open")',
        expected: [{ id: 2, done: false }],
      },
      {
        code: 'visibleTodos([{ id: 1, done: true }, { id: 2, done: false }], "all")',
        expected: [
          { id: 1, done: true },
          { id: 2, done: false },
        ],
      },
    ],
  ),
  scenario(
    "merge-vue-props",
    "Vue",
    "props 默认值",
    "没传的字段用默认值。传入 undefined 也算没传。",
    String.raw`function mergeVueProps(props, defaults) {
  const result = { ...defaults };
  for (const key of Object.keys(props)) {
    if (props[key] !== undefined) result[key] = props[key];
  }
  return result;
}`,
    [
      {
        code: 'mergeVueProps({ title: undefined, count: 2 }, { title: "默认", count: 0, extra: true })',
        expected: { title: "默认", count: 2, extra: true },
      },
    ],
  ),
  scenario(
    "update-model-payload",
    "Vue",
    "抛出更新",
    "子组件通知父组件时，返回事件名和值。事件名是 update:modelValue。",
    String.raw`function updateModelPayload(value) {
  return ["update:modelValue", value];
}`,
    [{ code: 'updateModelPayload("甲")', expected: ["update:modelValue", "甲"] }],
  ),
  scenario(
    "first-rule-message",
    "Vue",
    "第一条校验",
    "返回第一条没通过的提示。都通过就返回空字符串。",
    String.raw`function firstRuleMessage(rules) {
  for (const rule of rules) {
    if (!rule.pass) return rule.message;
  }
  return "";
}`,
    [
      {
        code: 'firstRuleMessage([{ pass: true, message: "太短" }, { pass: false, message: "必填" }])',
        expected: "必填",
      },
      { code: 'firstRuleMessage([{ pass: true, message: "太短" }])', expected: "" },
    ],
  ),
  scenario(
    "read-page-query",
    "Vue",
    "读取页码",
    "从路由 query 读 page 和 pageSize。不合法时 page 用 1，pageSize 用 20。",
    String.raw`function readPageQuery(query) {
  const page = Number(query.page);
  const pageSize = Number(query.pageSize);
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 20,
  };
}`,
    [
      { code: 'readPageQuery({ page: "2", pageSize: "10" })', expected: { page: 2, pageSize: 10 } },
      { code: "readPageQuery({})", expected: { page: 1, pageSize: 20 } },
    ],
  ),
  scenario(
    "to-page-query",
    "Vue",
    "写回页码",
    "写回路由 query。第 1 页不带 page。pageSize 是 20 时不带 pageSize。",
    String.raw`function toPageQuery(page, pageSize) {
  const query = {};
  if (page > 1) query.page = String(page);
  if (pageSize !== 20) query.pageSize = String(pageSize);
  return query;
}`,
    [
      { code: "toPageQuery(1, 20)", expected: {} },
      { code: "toPageQuery(2, 10)", expected: { page: "2", pageSize: "10" } },
    ],
  ),
  scenario(
    "row-key",
    "Vue",
    "行的 key",
    "有 id 就用 id。没有 id，或 id 是空字符串，就用 index。",
    String.raw`function rowKey(row, index) {
  if (row.id !== undefined && row.id !== null && row.id !== "") return String(row.id);
  return String(index);
}`,
    [
      { code: "rowKey({ id: 8 }, 0)", expected: "8" },
      { code: 'rowKey({ id: "" }, 2)', expected: "2" },
    ],
  ),
  scenario(
    "clock-text",
    "Vue",
    "秒数转时钟",
    "把秒数显示成分:秒。秒固定两位。",
    String.raw`function clockText(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minute = Math.floor(safe / 60);
  const second = String(safe % 60).padStart(2, "0");
  return minute + ":" + second;
}`,
    [
      { code: "clockText(65)", expected: "1:05" },
      { code: "clockText(5)", expected: "0:05" },
    ],
  ),
  scenario(
    "reset-form",
    "Vue",
    "重置表单",
    "按初始值做一个新对象，用来重置表单。",
    String.raw`function resetForm(initial) {
  const next = {};
  for (const key of Object.keys(initial)) next[key] = initial[key];
  return next;
}`,
    [{ code: 'resetForm({ name: "甲", age: 1 })', expected: { name: "甲", age: 1 } }],
  ),
  scenario(
    "slot-scope",
    "Vue",
    "插槽数据",
    "交给插槽的数据要带上 item、index，以及是不是第一项。",
    String.raw`function slotScope(item, index) {
  return { item, index, first: index === 0 };
}`,
    [
      { code: "slotScope({ id: 1 }, 0)", expected: { item: { id: 1 }, index: 0, first: true } },
      { code: "slotScope({ id: 2 }, 1)", expected: { item: { id: 2 }, index: 1, first: false } },
    ],
  ),
  scenario(
    "can-show",
    "Vue",
    "是否有权限",
    "权限列表里有这个 code，才显示。",
    String.raw`function canShow(permissions, code) {
  return permissions.includes(code);
}`,
    [
      { code: 'canShow(["user:edit", "user:view"], "user:edit")', expected: true },
      { code: 'canShow(["user:edit"], "user:delete")', expected: false },
    ],
  ),
];

export const SCENARIOS: Scenario[] = TRACKS.flatMap((track) => [
  ...BASE_SCENARIOS.filter((item) => item.track === track),
  ...extraScenarios.filter((item) => item.track === track),
]);

export function callText(item: Scenario) {
  return item.calls.map((call) => call.code).join("\n");
}
