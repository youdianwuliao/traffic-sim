# TrafficForge · Puppeteer 版

真实 headless 浏览器模拟访问，基于 Node.js + Puppeteer。

## 部署

```bash
npm install
npm start
```

然后打开 `http://localhost:3000`

## 特性

- ✅ 真实的 Chromium 浏览器访问（非 iframe）
- ✅ 随机 User-Agent、viewport、Accept-Language
- ✅ 自动模拟页面滚动（随机距离、随机速度）
- ✅ 随机停留时间（2-8 秒）
- ✅ WebDriver 检测绕过
- ✅ 实时进度查询 API
- ✅ 三种速度模式：闪电 / 正常 / 缓慢

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/start` | 启动模拟 `{url, count, speed}` |
| GET  | `/api/status` | 查询进度 `{running, current, total, logs}` |
| POST | `/api/stop` | 停止当前任务 |

## 环境要求

- Node.js 18+
- Chromium（Puppeteer 自动下载）
- 服务器需有足够内存运行 headless Chrome

## 文件结构

```
├── server.js       # Express 服务
├── simulator.js    # Puppeteer 核心逻辑
├── public/
│   └── index.html  # Web UI
├── package.json
└── README.md
```
