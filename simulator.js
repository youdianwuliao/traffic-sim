const https = require('https');
const http = require('http');
const { URL } = require('url');

// ─── 浏览器指纹池 ───

const UA_POOL = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  // Chrome macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  // Safari macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  // Firefox macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:128.0) Gecko/20100101 Firefox/128.0',
  // Edge Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
  // iPhone
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  // iPad
  'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  // Android Chrome
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
];

const ACCEPT_POOL = [
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
];

const ACCEPT_LANG_POOL = [
  'zh-CN,zh;q=0.9,en;q=0.8',
  'zh-CN,zh;q=0.9',
  'en-US,en;q=0.9,zh-CN;q=0.8',
  'en-US,en;q=0.9',
  'ja-JP,ja;q=0.9,en;q=0.8',
  'zh-TW,zh;q=0.9,en;q=0.8',
];

const SPEED_MAP = {
  min: [1000, 3000],
  mid: [3000, 8000],
  max: [8000, 15000],
};

const REFERRER_POOL = [
  'https://www.google.com/',
  'https://www.google.com/search?q=',
  'https://www.baidu.com/',
  'https://www.baidu.com/s?wd=',
  'https://www.bing.com/',
  'https://www.bing.com/search?q=',
  'https://t.co/',
  'https://www.facebook.com/',
  'https://www.zhihu.com/',
  '',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Make a single realistic HTTP visit to targetUrl
 */
function visitUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const ua = pick(UA_POOL);
    const accept = pick(ACCEPT_POOL);
    const lang = pick(ACCEPT_LANG_POOL);
    const referrer = pick(REFERRER_POOL);

    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const mod = isHttps ? https : http;

    const headers = {
      'User-Agent': ua,
      'Accept': accept,
      'Accept-Language': lang,
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': pick(['no-cache', 'max-age=0']),
      'Sec-Ch-Ua': pick([
        '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        '"Not)A;Brand";v="99", "Google Chrome";v="126", "Chromium";v="126"',
        '"Chromium";v="128", "Google Chrome";v="128", "Not=A?Brand";v="99"',
      ]),
      'Sec-Ch-Ua-Mobile': pick(['?0', '?1']),
      'Sec-Ch-Ua-Platform': pick(['"Windows"', '"macOS"', '"Android"', '"iOS"']),
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': referrer ? pick(['cross-site', 'same-origin']) : 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'DNT': pick(['1', '0']),
    };

    if (referrer) {
      headers['Referer'] = referrer + (referrer.endsWith('?') ? encodeURIComponent(targetUrl) : '');
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers,
      timeout: 15000,
      rejectUnauthorized: false,
    };

    const req = mod.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          ua,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message, ua });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, error: 'timeout', ua });
    });

    req.end();
  });
}

/**
 * Run traffic simulation
 */
function simulator(targetUrl, count, speed = 'mid') {
  const [delayMin, delayMax] = SPEED_MAP[speed] || SPEED_MAP.mid;
  const logs = [];
  let current = 0;
  let stopped = false;
  let done = false;

  function log(msg, type = 'info') {
    logs.push({ msg, type, time: Date.now() });
    if (logs.length > 1000) logs.splice(0, 100);
  }

  const promise = (async () => {
    log(`🎯 目标: ${targetUrl}`, 'info');
    log(`📊 次数: ${count}`, 'info');
    log(`⚡ 速度: ${speed} (间隔 ${delayMin/1000}-${delayMax/1000}s)`, 'info');

    for (let i = 1; i <= count && !stopped; i++) {
      current = i;
      const waitMs = rand(delayMin, delayMax);

      // Random delay between visits
      await sleep(waitMs);
      if (stopped) break;

      log(`⏳ #${i}/${count} — ${(waitMs/1000).toFixed(1)}s 后发起`, 'info');

      const result = await visitUrl(targetUrl);

      if (result.status >= 200 && result.status < 400) {
        log(`✅ #${i} — ${result.status} · ${result.bodyLength.toLocaleString()}B · ${result.ua.slice(0, 40)}...`, 'success');
      } else if (result.error) {
        log(`⚠️ #${i} — ${result.error} · ${result.ua.slice(0, 40)}...`, 'error');
      } else {
        log(`⚠️ #${i} — HTTP ${result.status} · ${result.ua.slice(0, 40)}...`, 'warn');
      }
    }

    if (stopped) {
      log('⏸ 已手动停止', 'warn');
    } else {
      log('🎉 全部完成！', 'success');
    }

    done = true;
  })();

  promise._logs = logs;
  promise._total = count;
  promise._stopped = false;

  Object.defineProperty(promise, '_current', {
    get: () => current,
  });

  Object.defineProperty(promise, '_done', {
    get: () => done,
  });

  return promise;
}

module.exports = { simulator };
