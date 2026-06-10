const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('dialog', async dialog => {
    console.log('ALERT NO NAVEGADOR:', dialog.message());
    await dialog.accept();
  });

  try {
    console.log('Navegando para o Vercel...');
    await page.goto('https://techconnect-br.vercel.app/login', { waitUntil: 'networkidle2' });
    
    console.log('Procurando o botão do Google...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      const googleBtn = buttons.find(btn => btn.innerText && btn.innerText.includes('Google'));
      if (googleBtn) {
        console.log('Botão encontrado! Clicando...');
        googleBtn.click();
      } else {
        console.log('Botão não encontrado!');
      }
    });
    
    console.log('Aguardando 10 segundos por resposta...');
    await new Promise(r => setTimeout(r, 10000));
  } catch (err) {
    console.error('Script error:', err);
  }
  
  await browser.close();
})();
