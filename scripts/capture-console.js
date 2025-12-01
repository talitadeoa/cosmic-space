const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000/universo';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];

  page.on('console', (msg) => {
    try {
      logs.push({ type: 'console', level: msg.type(), text: msg.text() });
    } catch (e) {
      logs.push({ type: 'console', text: String(msg) });
    }
  });

  page.on('pageerror', (err) => {
    logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() ? req.failure().errorText : null });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    logs.push({ type: 'navigation-error', error: String(e) });
  }

  // Espera um pouco para capturar mensagens emitidas após o carregamento
  await page.waitForTimeout(2000);

  await browser.close();

  // Imprime os logs formatados
  console.log(JSON.stringify(logs, null, 2));

  const hasError = logs.some((l) => l.type === 'pageerror' || (l.type === 'console' && /error|uncaught|exception/i.test(l.text || '')));
  process.exit(hasError ? 1 : 0);
})();
