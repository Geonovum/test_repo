const config = require('./config.js');

const alternateFormats = config.respecConfig.alternateFormats;
if (alternateFormats === undefined) {
  console.warn("'alternateFormats' not found.");
} else {
  const found = alternateFormats.find((el) => el.label === "pdf");
  if (!found) {
    console.warn("PDF not selected as alternate format.");
  } else if (!found.uri) {
    console.warn("PDF file name ('uri') missing.");
  } else {
    const name = found.uri;
    console.log("Printing PDF with name: " + name);

    const puppeteer = require('puppeteer');

    (async () => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      try {
        const page = await browser.newPage();
        const website_url = 'http://localhost:8080/snapshot.html';

        // Wacht expliciet even zodat de HTTP-server zeker luistert
        // (extra safety naast waitUntil)
        await new Promise(r => setTimeout(r, 1500));

        await page.goto(website_url, { waitUntil: 'networkidle0', timeout: 120000 });
        await page.emulateMediaType('print');
        await page.addStyleTag({ content: '.sidelabel { position: absolute }' });

        await page.pdf({
          path: name,
          margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
          printBackground: true,
          format: 'A4',
        });
        console.log("PDF written:", name);
      } finally {
        await browser.close();
      }
    })().catch(err => {
      console.error("PDF generation failed:", err);
      process.exit(1);
    });
  }
}
