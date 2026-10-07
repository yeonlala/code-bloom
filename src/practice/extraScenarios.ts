import type { Scenario, ScenarioCall, Track } from "./scenarios";

function scenario(
  id: string,
  track: Track,
  name: string,
  task: string,
  source: string,
  calls: ScenarioCall[],
  extra?: Pick<Scenario, "starter" | "includes" | "excludes" | "signature">,
): Scenario {
  return { id, track, name, task, source, calls, ...extra };
}

export const extraScenarios: Scenario[] = [
  scenario(
    "optional-city",
    "ES6",
    "可选链",
    "取出 profile.city。中间任何一段没有，就返回 null。空字符串要留下。",
    String.raw`function optionalCity(user) {
  return user?.profile?.city ?? null;
}`,
    [
      { code: 'optionalCity({ profile: { city: "杭" } })', expected: "杭" },
      { code: "optionalCity({})", expected: null },
      { code: "optionalCity(null)", expected: null },
    ],
  ),
  scenario(
    "nullish",
    "ES6",
    "空值合并",
    "只有 null 和 undefined 用后面的值。0 要留下。",
    String.raw`function nullish(value, fallback) {
  return value ?? fallback;
}`,
    [
      { code: "nullish(0, 10)", expected: 0 },
      { code: "nullish(null, 10)", expected: 10 },
    ],
  ),
  scenario(
    "default-name",
    "ES6",
    "解构默认值",
    "从对象里取 name。没传 name 时用「匿名」。空字符串要留下。",
    String.raw`function defaultName(user) {
  const { name = "匿名" } = user || {};
  return name;
}`,
    [
      { code: "defaultName({})", expected: "匿名" },
      { code: 'defaultName({ name: "" })', expected: "" },
      { code: 'defaultName({ name: "甲" })', expected: "甲" },
    ],
  ),
  scenario(
    "to-user",
    "ES6",
    "简写属性",
    "用参数名直接组成对象。",
    String.raw`function toUser(id, name) {
  return { id, name };
}`,
    [{ code: 'toUser(1, "甲")', expected: { id: 1, name: "甲" } }],
  ),
  scenario(
    "set-field",
    "ES6",
    "计算属性",
    "用变量当字段名，组成一个对象。",
    String.raw`function setField(key, value) {
  return { [key]: value };
}`,
    [{ code: 'setField("name", "甲")', expected: { name: "甲" } }],
  ),
  scenario(
    "pick",
    "ES6",
    "挑选字段",
    "只留下 keys 里有的字段。对象里没有的 key 跳过。",
    String.raw`function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.keys(obj).includes(key)) result[key] = obj[key];
  }
  return result;
}`,
    [{ code: 'pick({ a: 1, b: 2 }, ["b", "c"])', expected: { b: 2 } }],
  ),
  scenario(
    "omit",
    "ES6",
    "丢掉字段",
    "去掉 keys 里的字段，其他字段留下。",
    String.raw`function omit(obj, keys) {
  const skip = new Set(keys);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!skip.has(key)) result[key] = obj[key];
  }
  return result;
}`,
    [{ code: 'omit({ a: 1, b: 2, c: 3 }, ["b"])', expected: { a: 1, c: 3 } }],
  ),
  scenario(
    "copy-list",
    "ES6",
    "复制数组",
    "复制一份新数组。不要改原来的数组。",
    String.raw`function copyList(items) {
  return items.slice();
}`,
    [{ code: "copyList([1, 2])", expected: [1, 2] }],
  ),
  scenario(
    "includes-id",
    "ES6",
    "是否包含",
    "数组里有这个值就返回 true。",
    String.raw`function includesId(ids, id) {
  return ids.includes(id);
}`,
    [
      { code: "includesId([1, 2], 2)", expected: true },
      { code: "includesId([1, 2], 3)", expected: false },
    ],
  ),
  scenario(
    "index-of-id",
    "ES6",
    "查找下标",
    "按 id 找下标。找不到返回 -1。",
    String.raw`function indexOfId(items, id) {
  return items.findIndex((item) => item.id === id);
}`,
    [
      { code: "indexOfId([{ id: 1 }, { id: 2 }], 2)", expected: 1 },
      { code: "indexOfId([{ id: 1 }], 9)", expected: -1 },
    ],
  ),
  scenario(
    "slice-page",
    "ES6",
    "切一页",
    "按页码切出这一页。页码从 1 开始。",
    String.raw`function slicePage(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}`,
    [{ code: "slicePage([1, 2, 3, 4, 5], 2, 2)", expected: [3, 4] }],
  ),
  scenario(
    "flatten-once",
    "ES6",
    "拍平一层",
    "只拍平一层，里面的数组要展开。",
    String.raw`function flattenOnce(lists) {
  return lists.flat();
}`,
    [{ code: "flattenOnce([[1, 2], [3]])", expected: [1, 2, 3] }],
  ),
  scenario(
    "with-index",
    "ES6",
    "带上序号",
    "给每一项带上从 1 开始的序号。",
    String.raw`function withIndex(items) {
  return items.map((item, index) => ({ no: index + 1, item }));
}`,
    [
      {
        code: 'withIndex(["甲", "乙"])',
        expected: [
          { no: 1, item: "甲" },
          { no: 2, item: "乙" },
        ],
      },
    ],
  ),
  scenario(
    "unique-by-id",
    "ES6",
    "按 id 去重",
    "id 相同只留第一次出现的那项。",
    String.raw`function uniqueById(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}`,
    [
      {
        code: 'uniqueById([{ id: 1, name: "甲" }, { id: 1, name: "乙" }, { id: 2, name: "丙" }])',
        expected: [
          { id: 1, name: "甲" },
          { id: 2, name: "丙" },
        ],
      },
    ],
  ),
  scenario(
    "group-by-status",
    "ES6",
    "按状态分组",
    "按 status 分组。同一组保持原来的顺序。",
    String.raw`function groupByStatus(items) {
  const groups = {};
  for (const item of items) {
    const key = item.status;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}`,
    [
      {
        code: 'groupByStatus([{ id: 1, status: "open" }, { id: 2, status: "done" }, { id: 3, status: "open" }])',
        expected: {
          open: [
            { id: 1, status: "open" },
            { id: 3, status: "open" },
          ],
          done: [{ id: 2, status: "done" }],
        },
      },
    ],
  ),
  scenario(
    "count-by",
    "ES6",
    "出现次数",
    "数每个字段值出现了几次。",
    String.raw`function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    const name = item[key];
    counts[name] = (counts[name] || 0) + 1;
  }
  return counts;
}`,
    [
      {
        code: 'countBy([{ type: "a" }, { type: "b" }, { type: "a" }], "type")',
        expected: { a: 2, b: 1 },
      },
    ],
  ),
  scenario(
    "sort-by-name",
    "ES6",
    "按名字排序",
    "按 name 从小到大排序。不要改原来的数组。",
    String.raw`function sortByName(items) {
  return items.slice().sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}`,
    [
      {
        code: 'sortByName([{ name: "b" }, { name: "a" }])',
        expected: [{ name: "a" }, { name: "b" }],
      },
    ],
  ),
  scenario(
    "last-item",
    "ES6",
    "最后一项",
    "返回最后一项。空数组返回 null。",
    String.raw`function lastItem(items) {
  if (!items.length) return null;
  return items[items.length - 1];
}`,
    [
      { code: "lastItem([1, 2])", expected: 2 },
      { code: "lastItem([])", expected: null },
    ],
  ),
  scenario(
    "parse-json",
    "ES6",
    "解析 JSON",
    "能解析就返回对象。解析失败返回 null。",
    String.raw`function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}`,
    [
      { code: `parseJson('{"a":1}')`, expected: { a: 1 } },
      { code: 'parseJson("nope")', expected: null },
    ],
  ),
  scenario(
    "to-query",
    "ES6",
    "拼查询串",
    "拼成 a=b&c=d。null、undefined、空字符串丢掉。中文要编码。",
    String.raw`function toQuery(params) {
  const parts = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === null || value === undefined || value === "") continue;
    parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
  }
  return parts.join("&");
}`,
    [{ code: 'toQuery({ q: "甲", page: 2, empty: "" })', expected: "q=%E7%94%B2&page=2" }],
  ),
  scenario(
    "parse-query",
    "ES6",
    "读查询串",
    "把 a=b&c=d 读成对象。值要解码。空字符串返回空对象。",
    String.raw`function parseQuery(text) {
  const result = {};
  if (!text) return result;
  for (const part of text.split("&")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = decodeURIComponent(part.slice(0, index));
    result[key] = decodeURIComponent(part.slice(index + 1));
  }
  return result;
}`,
    [
      { code: 'parseQuery("q=%E7%94%B2&page=2")', expected: { q: "甲", page: "2" } },
      { code: 'parseQuery("")', expected: {} },
    ],
  ),
  scenario(
    "pad-code",
    "ES6",
    "编号补零",
    "补成至少 3 位。已经更长就原样返回。",
    String.raw`function padCode(n) {
  return String(n).padStart(3, "0");
}`,
    [
      { code: "padCode(7)", expected: "007" },
      { code: "padCode(1234)", expected: "1234" },
    ],
  ),
  scenario(
    "ellipsis",
    "ES6",
    "截断文本",
    "超过 max 个字就截断，末尾加上 ...。没超过就原样返回。",
    String.raw`function ellipsis(text, max) {
  const value = String(text);
  if (value.length <= max) return value;
  return value.slice(0, max) + "...";
}`,
    [
      { code: 'ellipsis("你好世界", 2)', expected: "你好..." },
      { code: 'ellipsis("甲", 2)', expected: "甲" },
    ],
  ),
  scenario(
    "clamp",
    "ES6",
    "限制范围",
    "小于 min 就用 min，大于 max 就用 max。",
    String.raw`function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}`,
    [
      { code: "clamp(5, 1, 3)", expected: 3 },
      { code: "clamp(0, 1, 3)", expected: 1 },
      { code: "clamp(2, 1, 3)", expected: 2 },
    ],
  ),
  scenario(
    "capitalize",
    "ES6",
    "首字母大写",
    "只把第一个字母改成大写。空字符串返回空字符串。",
    String.raw`function capitalize(text) {
  if (!text) return "";
  return text[0].toUpperCase() + text.slice(1);
}`,
    [
      { code: 'capitalize("hello")', expected: "Hello" },
      { code: 'capitalize("")', expected: "" },
    ],
  ),
  scenario(
    "kebab",
    "ES6",
    "驼峰转中划线",
    "把驼峰转成中划线。开头的大写不要多出一个横线。",
    String.raw`function kebab(text) {
  return text.replace(/^[A-Z]/, (char) => char.toLowerCase()).replace(/[A-Z]/g, (char) => "-" + char.toLowerCase());
}`,
    [
      { code: 'kebab("fontSize")', expected: "font-size" },
      { code: 'kebab("FontSize")', expected: "font-size" },
    ],
  ),
  scenario(
    "split-tags",
    "ES6",
    "拆标签",
    "按逗号拆开，去掉首尾空格，空的丢掉。",
    String.raw`function splitTags(text) {
  return text.split(",").map((item) => item.trim()).filter(Boolean);
}`,
    [{ code: 'splitTags(" a, b ,,c ")', expected: ["a", "b", "c"] }],
  ),
  scenario(
    "money-text",
    "ES6",
    "分转元",
    "把分转成元，固定两位小数。负数保留负号。",
    String.raw`function moneyText(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const yuan = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return sign + yuan + "." + rest;
}`,
    [
      { code: "moneyText(1234)", expected: "12.34" },
      { code: "moneyText(5)", expected: "0.05" },
      { code: "moneyText(-5)", expected: "-0.05" },
    ],
  ),
  scenario(
    "thousands",
    "ES6",
    "千分位",
    "整数加上千分位。负数保留负号。",
    String.raw`function thousands(n) {
  const sign = n < 0 ? "-" : "";
  const text = String(Math.abs(Math.trunc(n)));
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    if (i > 0 && (text.length - i) % 3 === 0) out += ",";
    out += text[i];
  }
  return sign + out;
}`,
    [
      { code: "thousands(1234567)", expected: "1,234,567" },
      { code: "thousands(-1200)", expected: "-1,200" },
    ],
  ),
  scenario(
    "join-path",
    "ES6",
    "拼接路径",
    "拼成以 / 开头的路径。多出来的斜杠收成一个。空段丢掉。",
    String.raw`function joinPath(...parts) {
  const cleaned = [];
  for (const part of parts) {
    const text = String(part).replace(/^\/+|\/+$/g, "");
    if (text) cleaned.push(text);
  }
  return "/" + cleaned.join("/");
}`,
    [
      { code: 'joinPath("/api/", "/users", "1")', expected: "/api/users/1" },
      { code: 'joinPath("api", "")', expected: "/api" },
    ],
  ),
  scenario(
    "file-ext",
    "ES6",
    "文件后缀",
    "取出后缀并改成小写。没有点，或者点在开头，就返回空字符串。",
    String.raw`function fileExt(name) {
  const index = name.lastIndexOf(".");
  if (index <= 0) return "";
  return name.slice(index + 1).toLowerCase();
}`,
    [
      { code: 'fileExt("a.PNG")', expected: "png" },
      { code: 'fileExt("README")', expected: "" },
      { code: 'fileExt(".gitignore")', expected: "" },
    ],
  ),
  scenario(
    "merge-by-id",
    "ES6",
    "按 id 合并",
    "按 id 合并两份列表。同 id 以后面的字段盖住前面的。新 id 加到末尾。",
    String.raw`function mergeById(base, extra) {
  const map = new Map();
  for (const item of base) map.set(item.id, { ...item });
  for (const item of extra) {
    const prev = map.get(item.id) || {};
    map.set(item.id, { ...prev, ...item });
  }
  return [...map.values()];
}`,
    [
      {
        code: 'mergeById([{ id: 1, name: "甲", age: 2 }], [{ id: 1, name: "乙" }, { id: 2, name: "丙" }])',
        expected: [
          { id: 1, name: "乙", age: 2 },
          { id: 2, name: "丙" },
        ],
      },
    ],
  ),
  scenario(
    "debounce-plan",
    "ES6",
    "防抖",
    "调用按时间 t 排好。后一次如果落在 wait 之内，就取消前一次。返回真正会触发的时间和值。",
    String.raw`function debouncePlan(events, wait) {
  const fired = [];
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    const next = events[i + 1];
    if (!next || next.t - event.t >= wait) fired.push({ t: event.t + wait, value: event.value });
  }
  return fired;
}`,
    [
      {
        code: 'debouncePlan([{ t: 0, value: "a" }, { t: 100, value: "b" }, { t: 150, value: "c" }], 200)',
        expected: [{ t: 350, value: "c" }],
      },
      {
        code: 'debouncePlan([{ t: 0, value: "a" }, { t: 300, value: "b" }], 200)',
        expected: [
          { t: 200, value: "a" },
          { t: 500, value: "b" },
        ],
      },
      { code: "debouncePlan([], 200)", expected: [] },
    ],
  ),
  scenario(
    "join-loaded",
    "ES6",
    "依次等待",
    "按 ids 的顺序 await load。把每次拿到的 name 收成数组。",
    String.raw`async function joinLoaded(load, ids) {
  const names = [];
  for (const id of ids) {
    const item = await load(id);
    names.push(item.name);
  }
  return names;
}`,
    [
      {
        code: 'joinLoaded(async (id) => ({ name: "u" + id }), [1, 2])',
        expected: ["u1", "u2"],
      },
    ],
  ),
  scenario(
    "load-or-empty",
    "ES6",
    "等待失败",
    "await load。成功返回 name。失败返回空字符串。",
    String.raw`async function loadOrEmpty(load, id) {
  try {
    const item = await load(id);
    return item.name;
  } catch {
    return "";
  }
}`,
    [
      { code: 'loadOrEmpty(async () => ({ name: "甲" }), 1)', expected: "甲" },
      { code: 'loadOrEmpty(async () => { throw new Error("fail"); }, 1)', expected: "" },
    ],
  ),
  scenario(
    "loud-labels",
    "ES6",
    "循环改成筛选",
    "这段 for 循环结果是对的。改成 filter 再 map。结果保持一样，不要留 for。",
    String.raw`function loudLabels(items) {
  return items.filter((item) => item.on).map((item) => item.label.toUpperCase());
}`,
    [
      {
        code: 'loudLabels([{ on: true, label: "ab" }, { on: false, label: "cd" }, { on: true, label: "ef" }])',
        expected: ["AB", "EF"],
      },
    ],
    {
      starter: String.raw`function loudLabels(items) {
  const labels = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.on) labels.push(item.label.toUpperCase());
  }
  return labels;
}`,
      includes: [".filter", ".map"],
      excludes: ["for"],
    },
  ),
  scenario(
    "toggle-selected",
    "React",
    "切换选中",
    "id 已在列表里就删掉，不在就加到末尾。不要改原数组。",
    String.raw`function toggleSelected(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}`,
    [
      { code: "toggleSelected([1], 2)", expected: [1, 2] },
      { code: "toggleSelected([1, 2], 1)", expected: [2] },
    ],
  ),
  scenario(
    "selection-state",
    "React",
    "全选状态",
    "一个都没选返回 none，全选返回 all，选了一部分返回 some。",
    String.raw`function selectionState(selectedIds, allIds) {
  const picked = allIds.filter((id) => selectedIds.includes(id)).length;
  if (picked === 0) return "none";
  if (picked === allIds.length) return "all";
  return "some";
}`,
    [
      { code: "selectionState([1, 2], [1, 2])", expected: "all" },
      { code: "selectionState([1], [1, 2])", expected: "some" },
      { code: "selectionState([], [1])", expected: "none" },
    ],
  ),
  scenario(
    "is-dirty",
    "React",
    "是否改过",
    "和初始值比，有任何一个字段不同就返回 true。",
    String.raw`function isDirty(current, initial) {
  const keys = Object.keys({ ...current, ...initial });
  return keys.some((key) => current[key] !== initial[key]);
}`,
    [
      { code: 'isDirty({ name: "甲" }, { name: "甲" })', expected: false },
      { code: 'isDirty({ name: "乙" }, { name: "甲" })', expected: true },
    ],
  ),
  scenario(
    "form-payload",
    "React",
    "提交前整理",
    "字符串去掉首尾空格。其他类型原样留下。",
    String.raw`function formPayload(form) {
  const result = {};
  for (const key of Object.keys(form)) {
    const value = form[key];
    result[key] = typeof value === "string" ? value.trim() : value;
  }
  return result;
}`,
    [{ code: 'formPayload({ name: " 甲 ", age: 1 })', expected: { name: "甲", age: 1 } }],
  ),
  scenario(
    "set-field-error",
    "React",
    "写入错误",
    "给一个字段写上错误文案，其他字段保留。",
    String.raw`function setFieldError(errors, name, message) {
  return { ...errors, [name]: message };
}`,
    [{ code: 'setFieldError({ age: "太小" }, "name", "必填")', expected: { age: "太小", name: "必填" } }],
  ),
  scenario(
    "clear-field-error",
    "React",
    "清掉错误",
    "删掉一个字段的错误，其他字段保留。",
    String.raw`function clearFieldError(errors, name) {
  const next = { ...errors };
  delete next[name];
  return next;
}`,
    [{ code: 'clearFieldError({ name: "必填", age: "太小" }, "name")', expected: { age: "太小" } }],
  ),
  scenario(
    "row-class",
    "React",
    "行的类名",
    "奇数行加上 alt。选中再加 selected。用空格接上。",
    String.raw`function rowClass(index, selected) {
  const names = [];
  if (index % 2 === 1) names.push("alt");
  if (selected) names.push("selected");
  return names.join(" ");
}`,
    [
      { code: "rowClass(1, false)", expected: "alt" },
      { code: "rowClass(0, true)", expected: "selected" },
      { code: "rowClass(1, true)", expected: "alt selected" },
    ],
  ),
  scenario(
    "show-empty",
    "React",
    "空列表状态",
    "正在加载返回 loading。没有数据返回 empty。否则返回 list。",
    String.raw`function showEmpty(items, loading) {
  if (loading) return "loading";
  if (!items.length) return "empty";
  return "list";
}`,
    [
      { code: "showEmpty([], true)", expected: "loading" },
      { code: "showEmpty([], false)", expected: "empty" },
      { code: "showEmpty([1], false)", expected: "list" },
    ],
  ),
  scenario(
    "view-state",
    "React",
    "请求状态",
    "loading 优先。然后是 error。没有 data 返回 empty。否则返回 ready。",
    String.raw`function viewState(state) {
  if (state.loading) return "loading";
  if (state.error) return "error";
  if (state.data == null) return "empty";
  return "ready";
}`,
    [
      { code: 'viewState({ loading: true, error: "", data: null })', expected: "loading" },
      { code: 'viewState({ loading: false, error: "x", data: null })', expected: "error" },
      { code: 'viewState({ loading: false, error: "", data: null })', expected: "empty" },
      { code: 'viewState({ loading: false, error: "", data: [1] })', expected: "ready" },
    ],
  ),
  scenario(
    "can-submit",
    "React",
    "能否提交",
    "名字去掉空白后还有字，并且没在提交，才能提交。",
    String.raw`function canSubmit(form) {
  return Boolean(String(form.name || "").trim()) && !form.submitting;
}`,
    [
      { code: 'canSubmit({ name: " 甲 ", submitting: false })', expected: true },
      { code: 'canSubmit({ name: " ", submitting: false })', expected: false },
      { code: 'canSubmit({ name: "甲", submitting: true })', expected: false },
    ],
  ),
  scenario(
    "read-input",
    "React",
    "读取输入",
    "从 change 事件里取出输入框的值。",
    String.raw`function readInput(event) {
  return event.target.value;
}`,
    [{ code: 'readInput({ target: { value: "甲" } })', expected: "甲" }],
  ),
  scenario(
    "read-checked",
    "React",
    "读取勾选",
    "从 change 事件里取出 checkbox 是否勾选。",
    String.raw`function readChecked(event) {
  return Boolean(event.target.checked);
}`,
    [
      { code: "readChecked({ target: { checked: true } })", expected: true },
      { code: "readChecked({ target: { checked: false } })", expected: false },
    ],
  ),
  scenario(
    "read-number-input",
    "React",
    "读取数字",
    "从输入框读数字。空白或不是数字就返回 null。",
    String.raw`function readNumberInput(event) {
  const text = String(event.target.value).trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
}`,
    [
      { code: 'readNumberInput({ target: { value: " 3 " } })', expected: 3 },
      { code: 'readNumberInput({ target: { value: "" } })', expected: null },
      { code: 'readNumberInput({ target: { value: "x" } })', expected: null },
    ],
  ),
  scenario(
    "page-slice",
    "React",
    "当前页数据",
    "切出当前页。页码超出范围时收回到有效页。空列表也算 1 页。",
    String.raw`function pageSlice(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safe = Math.min(Math.max(page, 1), totalPages);
  const start = (safe - 1) * pageSize;
  return { page: safe, totalPages, items: items.slice(start, start + pageSize) };
}`,
    [
      { code: 'pageSlice(["a", "b", "c", "d", "e"], 2, 2)', expected: { page: 2, totalPages: 3, items: ["c", "d"] } },
      { code: 'pageSlice(["a"], 5, 2)', expected: { page: 1, totalPages: 1, items: ["a"] } },
    ],
  ),
  scenario(
    "search-items",
    "React",
    "搜索列表",
    "按 name 搜索，不区分大小写。关键字是空白就返回全部。",
    String.raw`function searchItems(items, keyword) {
  const text = String(keyword).trim().toLowerCase();
  if (!text) return items.slice();
  return items.filter((item) => String(item.name).toLowerCase().includes(text));
}`,
    [
      { code: 'searchItems([{ name: "Button" }, { name: "表单" }], "button")', expected: [{ name: "Button" }] },
      { code: 'searchItems([{ name: "Button" }], "  ")', expected: [{ name: "Button" }] },
    ],
  ),
  scenario(
    "next-sort",
    "React",
    "切换排序",
    "点新列变成升序。再点同一列变成降序。再点就取消排序。",
    String.raw`function nextSort(current, key) {
  if (current.key !== key) return { key, order: "asc" };
  if (current.order === "asc") return { key, order: "desc" };
  return { key: "", order: "" };
}`,
    [
      { code: 'nextSort({ key: "name", order: "asc" }, "age")', expected: { key: "age", order: "asc" } },
      { code: 'nextSort({ key: "name", order: "asc" }, "name")', expected: { key: "name", order: "desc" } },
      { code: 'nextSort({ key: "name", order: "desc" }, "name")', expected: { key: "", order: "" } },
    ],
  ),
  scenario(
    "toggle-column",
    "React",
    "切换列",
    "翻转这一列的 visible。其他列不动。",
    String.raw`function toggleColumn(columns, key) {
  return columns.map((column) => (column.key === key ? { ...column, visible: !column.visible } : column));
}`,
    [
      {
        code: 'toggleColumn([{ key: "name", visible: true }, { key: "age", visible: true }], "age")',
        expected: [
          { key: "name", visible: true },
          { key: "age", visible: false },
        ],
      },
    ],
  ),
  scenario(
    "confirm-text",
    "React",
    "删除确认",
    "拼出「确定删除「名字」？」。",
    String.raw`function confirmText(name) {
  return "确定删除「" + name + "」？";
}`,
    [{ code: 'confirmText("甲")', expected: "确定删除「甲」？" }],
  ),
  scenario(
    "field-label",
    "React",
    "必填标记",
    "必填时在标签后面加上「 *」。",
    String.raw`function fieldLabel(label, required) {
  return required ? label + " *" : label;
}`,
    [
      { code: 'fieldLabel("姓名", true)', expected: "姓名 *" },
      { code: 'fieldLabel("姓名", false)', expected: "姓名" },
    ],
  ),
  scenario(
    "disabled-reason",
    "React",
    "禁用原因",
    "没权限返回「没有权限」。正在提交返回「提交中」。没填完返回「请先填完」。都能用就返回空字符串。",
    String.raw`function disabledReason(state) {
  if (!state.allowed) return "没有权限";
  if (state.loading) return "提交中";
  if (!state.valid) return "请先填完";
  return "";
}`,
    [
      { code: "disabledReason({ allowed: false, loading: true, valid: false })", expected: "没有权限" },
      { code: "disabledReason({ allowed: true, loading: true, valid: true })", expected: "提交中" },
      { code: "disabledReason({ allowed: true, loading: false, valid: true })", expected: "" },
    ],
  ),
  scenario(
    "avatar-text",
    "React",
    "头像文字",
    "取名字的第一个字。空白名字返回空字符串。",
    String.raw`function avatarText(name) {
  const text = String(name || "").trim();
  if (!text) return "";
  return text.slice(0, 1);
}`,
    [
      { code: 'avatarText(" 张三 ")', expected: "张" },
      { code: 'avatarText("  ")', expected: "" },
    ],
  ),
  scenario(
    "status-text",
    "React",
    "状态文案",
    "success 是成功，error 是失败，pending 是处理中。其他是未知。",
    String.raw`function statusText(status) {
  if (status === "success") return "成功";
  if (status === "error") return "失败";
  if (status === "pending") return "处理中";
  return "未知";
}`,
    [
      { code: 'statusText("pending")', expected: "处理中" },
      { code: 'statusText("nope")', expected: "未知" },
    ],
  ),
  scenario(
    "copied-label",
    "React",
    "复制文案",
    "已经复制显示「已复制」，否则显示「复制」。",
    String.raw`function copiedLabel(copied) {
  return copied ? "已复制" : "复制";
}`,
    [
      { code: "copiedLabel(true)", expected: "已复制" },
      { code: "copiedLabel(false)", expected: "复制" },
    ],
  ),
  scenario(
    "step-status",
    "React",
    "步骤状态",
    "比当前步小是 done，相同是 current，更大是 wait。",
    String.raw`function stepStatus(index, current) {
  if (index < current) return "done";
  if (index === current) return "current";
  return "wait";
}`,
    [
      { code: "stepStatus(0, 2)", expected: "done" },
      { code: "stepStatus(2, 2)", expected: "current" },
      { code: "stepStatus(3, 2)", expected: "wait" },
    ],
  ),
  scenario(
    "breadcrumbs",
    "React",
    "面包屑",
    "按路径拆成面包屑。每一段带上走到这里的路径。",
    String.raw`function breadcrumbs(path) {
  const parts = String(path).split("/").filter(Boolean);
  const crumbs = [];
  let acc = "";
  for (const part of parts) {
    acc += "/" + part;
    crumbs.push({ label: part, path: acc });
  }
  return crumbs;
}`,
    [
      {
        code: 'breadcrumbs("/a/b")',
        expected: [
          { label: "a", path: "/a" },
          { label: "b", path: "/a/b" },
        ],
      },
    ],
  ),
  scenario(
    "button-mode",
    "React",
    "按钮怎么显示",
    "不可见返回 hidden。可见但没权限返回 disabled。否则返回 enabled。",
    String.raw`function buttonMode(visible, allowed) {
  if (!visible) return "hidden";
  if (!allowed) return "disabled";
  return "enabled";
}`,
    [
      { code: "buttonMode(false, true)", expected: "hidden" },
      { code: "buttonMode(true, false)", expected: "disabled" },
      { code: "buttonMode(true, true)", expected: "enabled" },
    ],
  ),
  scenario(
    "option-label",
    "React",
    "选项文案",
    "按 value 找 label。找不到返回空字符串。",
    String.raw`function optionLabel(options, value) {
  const found = options.find((option) => option.value === value);
  return found ? found.label : "";
}`,
    [
      { code: 'optionLabel([{ value: 1, label: "甲" }], 1)', expected: "甲" },
      { code: 'optionLabel([{ value: 1, label: "甲" }], 2)', expected: "" },
    ],
  ),
  scenario(
    "tabs-with-count",
    "React",
    "标签计数",
    "给每个标签补上 count。没有计数就用 0。",
    String.raw`function tabsWithCount(tabs, counts) {
  return tabs.map((tab) => ({ key: tab.key, label: tab.label, count: counts[tab.key] || 0 }));
}`,
    [
      { code: 'tabsWithCount([{ key: "all", label: "全部" }], { all: 3 })', expected: [{ key: "all", label: "全部", count: 3 }] },
      { code: 'tabsWithCount([{ key: "all", label: "全部" }], {})', expected: [{ key: "all", label: "全部", count: 0 }] },
    ],
  ),
  scenario(
    "accordion-open",
    "React",
    "手风琴",
    "再点已打开的项就关掉，返回空字符串。点别的项就只打开那一项。",
    String.raw`function accordionOpen(openId, id) {
  return openId === id ? "" : id;
}`,
    [
      { code: 'accordionOpen("a", "a")', expected: "" },
      { code: 'accordionOpen("a", "b")', expected: "b" },
    ],
  ),
  scenario(
    "indent-style",
    "React",
    "层级缩进",
    "每一层缩进 16。返回 paddingLeft。",
    String.raw`function indentStyle(depth) {
  return { paddingLeft: depth * 16 };
}`,
    [{ code: "indentStyle(2)", expected: { paddingLeft: 32 } }],
  ),
  scenario(
    "modal-title",
    "React",
    "弹窗标题",
    "create 是新建，edit 是编辑，其他是查看。",
    String.raw`function modalTitle(mode) {
  if (mode === "create") return "新建";
  if (mode === "edit") return "编辑";
  return "查看";
}`,
    [
      { code: 'modalTitle("create")', expected: "新建" },
      { code: 'modalTitle("edit")', expected: "编辑" },
      { code: 'modalTitle("view")', expected: "查看" },
    ],
  ),
  scenario(
    "file-accept",
    "React",
    "接受的后缀",
    "把后缀拼成 .png,.jpg，给 input 的 accept 用。",
    String.raw`function fileAccept(exts) {
  return exts.map((ext) => "." + ext).join(",");
}`,
    [{ code: 'fileAccept(["png", "jpg"])', expected: ".png,.jpg" }],
  ),
  scenario(
    "remaining-count",
    "React",
    "还能输入",
    "返回还能输入几个字。超过就返回负数。",
    String.raw`function remainingCount(max, text) {
  return max - String(text).length;
}`,
    [
      { code: 'remainingCount(5, "abc")', expected: 2 },
      { code: 'remainingCount(2, "abcd")', expected: -2 },
    ],
  ),
  scenario(
    "password-match",
    "React",
    "密码是否一致",
    "确认密码还是空的，返回空字符串。不一致返回「两次密码不一致」。",
    String.raw`function passwordMatch(password, confirmValue) {
  if (!confirmValue) return "";
  return password === confirmValue ? "" : "两次密码不一致";
}`,
    [
      { code: 'passwordMatch("a", "")', expected: "" },
      { code: 'passwordMatch("a", "b")', expected: "两次密码不一致" },
      { code: 'passwordMatch("a", "a")', expected: "" },
    ],
  ),
  scenario(
    "next-request",
    "React",
    "请求流转",
    "start 变成 loading，清掉 error，data 留着。success 写入 data 并清掉 error。error 清掉 data，写下错误。",
    String.raw`function nextRequest(state, action) {
  if (action.type === "start") return { status: "loading", data: state.data, error: "" };
  if (action.type === "success") return { status: "success", data: action.data, error: "" };
  return { status: "error", data: null, error: action.error };
}`,
    [
      {
        code: 'nextRequest({ status: "idle", data: null, error: "" }, { type: "start" })',
        expected: { status: "loading", data: null, error: "" },
      },
      {
        code: 'nextRequest({ status: "loading", data: null, error: "" }, { type: "success", data: { id: 1 } })',
        expected: { status: "success", data: { id: 1 }, error: "" },
      },
      {
        code: 'nextRequest({ status: "loading", data: { id: 1 }, error: "" }, { type: "error", error: "失败" })',
        expected: { status: "error", data: null, error: "失败" },
      },
      {
        code: 'nextRequest({ status: "success", data: { id: 1 }, error: "" }, { type: "start" })',
        expected: { status: "loading", data: { id: 1 }, error: "" },
      },
    ],
  ),
  scenario(
    "toggle-model",
    "Vue",
    "多选绑定",
    "值已在数组里就删掉，不在就加到末尾。",
    String.raw`function toggleModel(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}`,
    [
      { code: 'toggleModel(["a"], "b")', expected: ["a", "b"] },
      { code: 'toggleModel(["a", "b"], "a")', expected: ["b"] },
    ],
  ),
  scenario(
    "checked-model",
    "Vue",
    "勾选取值",
    "true、\"true\"、1、\"1\" 都算勾选。",
    String.raw`function checkedModel(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}`,
    [
      { code: 'checkedModel("1")', expected: true },
      { code: 'checkedModel("false")', expected: false },
      { code: "checkedModel(0)", expected: false },
    ],
  ),
  scenario(
    "show-style",
    "Vue",
    "显示样式",
    "v-show 为假时返回 display:none。为真时返回空对象。",
    String.raw`function showStyle(visible) {
  return visible ? {} : { display: "none" };
}`,
    [
      { code: "showStyle(false)", expected: { display: "none" } },
      { code: "showStyle(true)", expected: {} },
    ],
  ),
  scenario(
    "component-is",
    "Vue",
    "动态组件",
    "number 用 NumberField，select 用 SelectField，其他用 TextField。",
    String.raw`function componentIs(type) {
  if (type === "number") return "NumberField";
  if (type === "select") return "SelectField";
  return "TextField";
}`,
    [
      { code: 'componentIs("select")', expected: "SelectField" },
      { code: 'componentIs("text")', expected: "TextField" },
    ],
  ),
  scenario(
    "route-active",
    "Vue",
    "路由是否激活",
    "当前路径等于这项，或者在它下面，就返回 true。根路径只匹配自己。",
    String.raw`function isRouteActive(current, path) {
  if (path === "/") return current === "/";
  return current === path || current.startsWith(path + "/");
}`,
    [
      { code: 'isRouteActive("/users/1", "/users")', expected: true },
      { code: 'isRouteActive("/users", "/user")', expected: false },
      { code: 'isRouteActive("/", "/")', expected: true },
    ],
  ),
  scenario(
    "route-param-id",
    "Vue",
    "路由 id",
    "从 params.id 读出正整数。不合法返回 null。",
    String.raw`function routeParamId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}`,
    [
      { code: 'routeParamId({ id: "8" })', expected: 8 },
      { code: 'routeParamId({ id: "0" })', expected: null },
      { code: "routeParamId({})", expected: null },
    ],
  ),
  scenario(
    "query-to-form",
    "Vue",
    "查询进表单",
    "用 query 盖住默认值。空字符串和没传的字段继续用默认值。",
    String.raw`function queryToForm(query, defaults) {
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (query[key] !== undefined && query[key] !== "") result[key] = query[key];
  }
  return result;
}`,
    [
      {
        code: 'queryToForm({ name: "甲", page: "" }, { name: "", page: "1" })',
        expected: { name: "甲", page: "1" },
      },
    ],
  ),
  scenario(
    "required-rule",
    "Vue",
    "必填规则",
    "去掉空白后还有字就返回空字符串。否则返回传入的提示。",
    String.raw`function requiredRule(value, message) {
  if (String(value ?? "").trim()) return "";
  return message;
}`,
    [
      { code: 'requiredRule("  ", "姓名必填")', expected: "姓名必填" },
      { code: 'requiredRule("甲", "姓名必填")', expected: "" },
    ],
  ),
  scenario(
    "first-failed",
    "Vue",
    "校验结果",
    "返回第一条不是 true 的结果。都通过就返回 true。",
    String.raw`function firstFailed(results) {
  for (const result of results) {
    if (result !== true) return result;
  }
  return true;
}`,
    [
      { code: 'firstFailed([true, "必填", "太短"])', expected: "必填" },
      { code: "firstFailed([true, true])", expected: true },
    ],
  ),
  scenario(
    "loading-class",
    "Vue",
    "加载类名",
    "加载中返回 is-loading，否则返回空字符串。",
    String.raw`function loadingClass(loading) {
  return loading ? "is-loading" : "";
}`,
    [
      { code: "loadingClass(true)", expected: "is-loading" },
      { code: "loadingClass(false)", expected: "" },
    ],
  ),
  scenario(
    "range-list",
    "Vue",
    "数字范围",
    "生成从 1 到 count 的数组。count 小于 1 就返回空数组。",
    String.raw`function rangeList(count) {
  const size = Math.max(0, count);
  return Array.from({ length: size }, (_, index) => index + 1);
}`,
    [
      { code: "rangeList(3)", expected: [1, 2, 3] },
      { code: "rangeList(0)", expected: [] },
    ],
  ),
  scenario(
    "vue-class-list",
    "Vue",
    "数组类名",
    "把数组形式的 class 收成字符串。假值丢掉。",
    String.raw`function vueClassList(names) {
  return names.filter(Boolean).join(" ");
}`,
    [{ code: 'vueClassList(["btn", false, "on"])', expected: "btn on" }],
  ),
  scenario(
    "cache-names",
    "Vue",
    "需要缓存",
    "取出 keepAlive 为真的路由名。",
    String.raw`function cacheNames(routes) {
  return routes.filter((route) => route.keepAlive).map((route) => route.name);
}`,
    [
      {
        code: 'cacheNames([{ name: "List", keepAlive: true }, { name: "Edit", keepAlive: false }])',
        expected: ["List"],
      },
    ],
  ),
  scenario(
    "listener-name",
    "Vue",
    "监听名",
    "把事件名转成 on 开头。update:modelValue 要变成 onUpdate:modelValue。",
    String.raw`function listenerName(event) {
  if (!event) return "";
  return "on" + event[0].toUpperCase() + event.slice(1);
}`,
    [
      { code: 'listenerName("click")', expected: "onClick" },
      { code: 'listenerName("update:modelValue")', expected: "onUpdate:modelValue" },
    ],
  ),
  scenario(
    "model-event",
    "Vue",
    "更新事件名",
    "按字段拼出 update:字段名。",
    String.raw`function modelEvent(prop) {
  return "update:" + prop;
}`,
    [{ code: 'modelEvent("title")', expected: "update:title" }],
  ),
  scenario(
    "patch-model",
    "Vue",
    "改一个字段",
    "只改对象里的一个字段，返回新对象。",
    String.raw`function patchModel(form, key, value) {
  return { ...form, [key]: value };
}`,
    [{ code: 'patchModel({ a: 1 }, "b", 2)', expected: { a: 1, b: 2 } }],
  ),
  scenario(
    "sync-query",
    "Vue",
    "表单写回查询",
    "把表单写成 query。空字符串、null、undefined 丢掉。其他值转成字符串。",
    String.raw`function syncQuery(form) {
  const query = {};
  for (const key of Object.keys(form)) {
    const value = form[key];
    if (value === "" || value === null || value === undefined) continue;
    query[key] = String(value);
  }
  return query;
}`,
    [{ code: 'syncQuery({ name: "甲", page: 2, note: "" })', expected: { name: "甲", page: "2" } }],
  ),
  scenario(
    "close-message",
    "Vue",
    "关掉一条",
    "按 id 从消息列表里删掉一条。",
    String.raw`function closeMessage(list, id) {
  return list.filter((item) => item.id !== id);
}`,
    [{ code: 'closeMessage([{ id: 1, text: "a" }, { id: 2, text: "b" }], 1)', expected: [{ id: 2, text: "b" }] }],
  ),
  scenario(
    "table-selection",
    "Vue",
    "选中的行",
    "按已选 id 取出对应的行，保持行的原顺序。",
    String.raw`function tableSelection(rows, selectedIds) {
  return rows.filter((row) => selectedIds.includes(row.id));
}`,
    [{ code: "tableSelection([{ id: 1 }, { id: 2 }], [2])", expected: [{ id: 2 }] }],
  ),
  scenario(
    "toggle-expand",
    "Vue",
    "展开节点",
    "已展开就收起，没收起就加到末尾。",
    String.raw`function toggleExpand(keys, key) {
  return keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key];
}`,
    [
      { code: 'toggleExpand(["a"], "b")', expected: ["a", "b"] },
      { code: 'toggleExpand(["a", "b"], "a")', expected: ["b"] },
    ],
  ),
  scenario(
    "active-menu",
    "Vue",
    "当前菜单",
    "找出和当前路径匹配、并且最长的菜单路径。没有就返回空字符串。",
    String.raw`function activeMenu(path, menus) {
  let found = "";
  for (const menu of menus) {
    if (path === menu || path.startsWith(menu + "/")) {
      if (menu.length > found.length) found = menu;
    }
  }
  return found;
}`,
    [
      { code: 'activeMenu("/a/b", ["/a", "/a/b", "/c"])', expected: "/a/b" },
      { code: 'activeMenu("/home", ["/a"])', expected: "" },
    ],
  ),
  scenario(
    "empty-fallback",
    "Vue",
    "空插槽",
    "有数据就原样返回。没有数据就返回一条 empty 占位。",
    String.raw`function emptyFallback(items) {
  if (items.length) return items;
  return [{ id: "empty", empty: true }];
}`,
    [
      { code: "emptyFallback([])", expected: [{ id: "empty", empty: true }] },
      { code: "emptyFallback([{ id: 1 }])", expected: [{ id: 1 }] },
    ],
  ),
  scenario(
    "scoped-row",
    "Vue",
    "行插槽",
    "交给插槽的数据要带上 row 和 $index。",
    String.raw`function scopedRow(row, index) {
  return { row, $index: index };
}`,
    [{ code: "scopedRow({ id: 1 }, 0)", expected: { row: { id: 1 }, $index: 0 } }],
  ),
  scenario(
    "visible-columns",
    "Vue",
    "可见列",
    "show 为 false 的列丢掉。没写 show 的列留下。",
    String.raw`function visibleColumns(columns) {
  return columns.filter((column) => column.show !== false);
}`,
    [
      {
        code: 'visibleColumns([{ key: "name" }, { key: "age", show: false }])',
        expected: [{ key: "name" }],
      },
    ],
  ),
  scenario(
    "sort-change",
    "Vue",
    "排序事件",
    "没有 order 就清空排序。有 order 就带上 prop 和 order。",
    String.raw`function sortChange(prop, order) {
  if (!order) return { prop: "", order: "" };
  return { prop, order };
}`,
    [
      { code: 'sortChange("name", null)', expected: { prop: "", order: "" } },
      { code: 'sortChange("name", "ascending")', expected: { prop: "name", order: "ascending" } },
    ],
  ),
  scenario(
    "form-rules-ready",
    "Vue",
    "规则是否通过",
    "required 的字段去掉空白后还要有值。都满足返回 true。",
    String.raw`function formRulesReady(rules, model) {
  for (const key of Object.keys(rules)) {
    if (!rules[key].required) continue;
    const value = model[key];
    if (value === null || value === undefined || String(value).trim() === "") return false;
  }
  return true;
}`,
    [
      {
        code: 'formRulesReady({ name: { required: true }, note: { required: false } }, { name: "  ", note: "" })',
        expected: false,
      },
      {
        code: 'formRulesReady({ name: { required: true }, note: { required: false } }, { name: "甲", note: "" })',
        expected: true,
      },
    ],
  ),
  scenario(
    "reset-known",
    "Vue",
    "按默认重置",
    "默认里有的字段恢复成初始值。其他字段保留。",
    String.raw`function resetKnown(model, defaults) {
  const next = { ...model };
  for (const key of Object.keys(defaults)) next[key] = defaults[key];
  return next;
}`,
    [{ code: 'resetKnown({ name: "乙", extra: 1 }, { name: "" })', expected: { name: "", extra: 1 } }],
  ),
  scenario(
    "doc-title",
    "Vue",
    "文档标题",
    "有未读时显示「(数量) 标题」。没有未读就只显示标题。",
    String.raw`function docTitle(title, unread) {
  if (unread > 0) return "(" + unread + ") " + title;
  return title;
}`,
    [
      { code: 'docTitle("练习", 2)', expected: "(2) 练习" },
      { code: 'docTitle("练习", 0)', expected: "练习" },
    ],
  ),
  scenario(
    "empty-text",
    "Vue",
    "空状态文案",
    "加载中返回空字符串。出错返回「加载失败」。否则返回「暂无数据」。",
    String.raw`function emptyText(loading, error) {
  if (loading) return "";
  if (error) return "加载失败";
  return "暂无数据";
}`,
    [
      { code: 'emptyText(true, "x")', expected: "" },
      { code: 'emptyText(false, "x")', expected: "加载失败" },
      { code: 'emptyText(false, "")', expected: "暂无数据" },
    ],
  ),
  scenario(
    "tag-type",
    "Vue",
    "标签类型",
    "success 用 success，error 用 danger，pending 用 warning，其他用 info。",
    String.raw`function tagType(status) {
  if (status === "success") return "success";
  if (status === "error") return "danger";
  if (status === "pending") return "warning";
  return "info";
}`,
    [
      { code: 'tagType("error")', expected: "danger" },
      { code: 'tagType("pending")', expected: "warning" },
      { code: 'tagType("other")', expected: "info" },
    ],
  ),
  scenario(
    "before-close",
    "Vue",
    "关闭前",
    "表单改过返回 confirm。没改过返回 close。",
    String.raw`function beforeClose(dirty) {
  return dirty ? "confirm" : "close";
}`,
    [
      { code: "beforeClose(true)", expected: "confirm" },
      { code: "beforeClose(false)", expected: "close" },
    ],
  ),
  scenario(
    "tree-label",
    "Vue",
    "树节点文案",
    "有子节点就显示「标题 (数量)」。没有子节点只显示标题。",
    String.raw`function treeLabel(node) {
  const count = Array.isArray(node.children) ? node.children.length : 0;
  if (!count) return node.label;
  return node.label + " (" + count + ")";
}`,
    [
      { code: 'treeLabel({ label: "部门", children: [{}, {}] })', expected: "部门 (2)" },
      { code: 'treeLabel({ label: "部门" })', expected: "部门" },
    ],
  ),
  scenario(
    "flat-visible",
    "Vue",
    "展开后的树",
    "按展开的 id 拍平成列表。每一项带上 id、label、depth。没展开的子节点不要出现。",
    String.raw`function flatVisible(nodes, expanded) {
  const result = [];
  const stack = nodes.map((node) => ({ node, depth: 0 })).reverse();
  while (stack.length) {
    const current = stack.pop();
    result.push({ id: current.node.id, label: current.node.label, depth: current.depth });
    if (current.node.children && expanded.includes(current.node.id)) {
      const children = current.node.children.map((node) => ({ node, depth: current.depth + 1 })).reverse();
      for (const child of children) stack.push(child);
    }
  }
  return result;
}`,
    [
      {
        code: 'flatVisible([{ id: "a", label: "A", children: [{ id: "a1", label: "A1" }] }, { id: "b", label: "B" }], ["a"])',
        expected: [
          { id: "a", label: "A", depth: 0 },
          { id: "a1", label: "A1", depth: 1 },
          { id: "b", label: "B", depth: 0 },
        ],
      },
    ],
  ),
  scenario(
    "field-placeholder",
    "Vue",
    "输入提示",
    "select 显示「请选择」加标签。其他显示「请输入」加标签。",
    String.raw`function fieldPlaceholder(kind, label) {
  if (kind === "select") return "请选择" + label;
  return "请输入" + label;
}`,
    [
      { code: 'fieldPlaceholder("select", "城市")', expected: "请选择城市" },
      { code: 'fieldPlaceholder("text", "城市")', expected: "请输入城市" },
    ],
  ),
  scenario(
    "summarize-types",
    "TS",
    "补参数和返回值",
    "函数体已经写好。给 name 补 string，给 tags 补 string[]，返回值补 { name: string; count: number }。",
    String.raw`function summarize(name: string, tags: string[]): { name: string; count: number } {
  return { name, count: tags.length };
}`,
    [{ code: 'summarize("甲", ["a", "b"])', expected: { name: "甲", count: 2 } }],
    {
      signature: true,
      starter: String.raw`function summarize(name, tags) {
  return { name, count: tags.length };
}`,
    },
  ),
  scenario(
    "draft-user-types",
    "TS",
    "补可选字段",
    "函数体已经写好。input 补成 { id: number; name?: string }。返回值补成 { id: number; name: string }。",
    String.raw`function draftUser(input: { id: number; name?: string }): { id: number; name: string } {
  return { id: input.id, name: input.name ?? "" };
}`,
    [
      { code: "draftUser({ id: 1 })", expected: { id: 1, name: "" } },
      { code: 'draftUser({ id: 2, name: "甲" })', expected: { id: 2, name: "甲" } },
    ],
    {
      signature: true,
      starter: String.raw`function draftUser(input) {
  return { id: input.id, name: input.name ?? "" };
}`,
    },
  ),
  scenario(
    "phase-text-types",
    "TS",
    "补联合类型",
    "函数体已经写好。status 只能是 loading、error、success。返回值补 string。",
    String.raw`function phaseText(status: "loading" | "error" | "success"): string {
  if (status === "loading") return "加载中";
  if (status === "error") return "失败";
  return "成功";
}`,
    [
      { code: 'phaseText("loading")', expected: "加载中" },
      { code: 'phaseText("error")', expected: "失败" },
      { code: 'phaseText("success")', expected: "成功" },
    ],
    {
      signature: true,
      starter: String.raw`function phaseText(status) {
  if (status === "loading") return "加载中";
  if (status === "error") return "失败";
  return "成功";
}`,
    },
  ),
];
