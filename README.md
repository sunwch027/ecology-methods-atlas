# 生态学方法实例库 · 交互版

一个纯静态站点：137 个方法条目（每条先讲“是什么 / 为什么用”，再给文献、数据与结果图）、17 章、137 张图（真实数据 + 可复现模拟）。

## 打开方式

直接双击 `index.html` 即可（无需服务器，数据以 `content.js` 形式内嵌）。

若浏览器限制本地文件，可在本目录运行：

```bash
python3 -m http.server 8000
```

然后访问 http://127.0.0.1:8000

## 结构

```
site/
├── index.html          页面骨架
├── assets/style.css    样式
├── assets/app.js       路由、目录、搜索、渲染
├── data/content.js     137 个条目的数据（含文献、数据、结果、假设、步骤）
└── figs/*.svg          137 张矢量图，全部配“看图要点”
```

## 交互

- 左侧目录默认只显示 17 个大章；点击章节展开该章条目。
- 顶部搜索框可按方法名、文献、数据过滤（快捷键 `/`）。
- 顶部「图幅」按钮可在 小 / 中 / 大 之间切换图片尺寸（默认中号 560px，设置会记住）。
- 每个条目页：文献外链（Crossref）→ 数据外链（rdrr/CRAN）→ 结果图 → 看图要点 → 前提假设 → 操作流程 → 解读 → 写作模板 → 常见误用 → 同章方法 → 折叠代码。

## 重算图表

```bash
PYTHONPATH=../pylibs python3 ../wd/site_figs.py     # 生成 figdata.json
cd ../wd && python3 build_figs.py                    # 渲染 SVG
python3 build_content.py                             # 重新解析 md → content.js
```
