# 文学星盘 · 开发启动指南

## 第一步：创建 Next.js 项目

```bash
npx create-next-app@latest literary-zodiac --typescript --tailwind --app --src-dir --import-alias "@/*"
cd literary-zodiac
```

## 第二步：安装依赖

```bash
npm install @anthropic-ai/sdk
```

## 第三步：把所有文件复制进去

将以下文件复制到对应位置：

```
src/
  app/
    globals.css          ← 替换原有文件
    layout.tsx           ← 替换原有文件
    page.tsx             ← 替换原有文件
    api/
      analyze/
        route.ts         ← 新建
    result/
      page.tsx           ← 新建
  components/
    ZodiacChart.tsx      ← 新建
  data/
    authors.json         ← 新建
  lib/
    prompt.ts            ← 新建
  types/
    index.ts             ← 新建
```

## 第四步：配置环境变量

在项目根目录创建 `.env.local`：

```
ANTHROPIC_API_KEY=你的API密钥
```

API Key 在 https://console.anthropic.com 获取。

## 第五步：启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

## 第六步：部署到 Vercel

```bash
npm install -g vercel
vercel
```

在 Vercel 控制台添加环境变量 `ANTHROPIC_API_KEY`。

---

## 常见问题

**Q: 分析失败怎么办？**
查看终端报错。最常见的是 API Key 没配置，或者 Claude 返回了非 JSON 格式（重试即可）。

**Q: 想调整 prompt 让结果更准？**
编辑 `src/lib/prompt.ts`，重点调整月亮位的要求。

**Q: 想加更多作家？**
在 `src/data/authors.json` 末尾追加，格式和现有条目一致即可，不需要改其他文件。

**Q: 想修改颜色主题？**
`src/app/globals.css` 控制全局颜色，`src/components/ZodiacChart.tsx` 控制星盘配色。
