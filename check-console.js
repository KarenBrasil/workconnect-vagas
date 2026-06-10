const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  page.on('dialog', async dialog => {
    console.log('ALERT NO NAVEGADOR:', dialog.message());
    await dialog.accept();
  });

  try {
    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle2' });
    
    // Clica no botão
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('div[role="button"]');
      for (let btn of buttons) {
        if (btn.innerText && btn.innerText.includes('Google')) {
          btn.click();
          break;
        }
      }
    });
    
    await new Promise(r => setTimeout(r, 5000));
  } catch (err) {
    console.error('Navigation error:', err);
  }
  
  await browser.close();
})();
