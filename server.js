const express = require('express');
const { simulator } = require('./simulator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let activeJob = null;

// ─── 启动模拟 ───
app.post('/api/start', async (req, res) => {
  const { url, count, speed = 'mid' } = req.body;

  if (!url || !count) {
    return res.status(400).json({ error: '缺少 url 或 count' });
  }
  if (count > 500) {
    return res.status(400).json({ error: '单次最多 500 次' });
  }
  if (activeJob) {
    return res.status(409).json({ error: '已有任务在运行' });
  }

  activeJob = simulator(url, count, speed);
  res.json({ status: 'started', total: count });

  // 异步等完成
  activeJob.finally(() => { activeJob = null; });
});

// ─── 查询进度 ───
app.get('/api/status', (req, res) => {
  if (!activeJob) {
    return res.json({ running: false, current: 0, total: 0, logs: [] });
  }
  // activeJob 对象上有我们附加的 state
  res.json({
    running: !activeJob._done,
    current: activeJob._current || 0,
    total: activeJob._total || 0,
    logs: (activeJob._logs || []).slice(-100),
  });
});

// ─── 停止 ───
app.post('/api/stop', (req, res) => {
  if (activeJob) {
    activeJob._stopped = true;
    res.json({ status: 'stopping' });
  } else {
    res.json({ status: 'no_active_job' });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 TrafficForge server running on http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT} in browser`);
});
