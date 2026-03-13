const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Öffne Duke of Haircuts auf Salonkee...');
    await page.goto('https://salonkee.de/salon/duke-of-haircuts', { waitUntil: 'networkidle2' });

    // Cookie-Banner wegklicken
    try {
        await page.waitForSelector('button', { timeout: 3000 });
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await btn.evaluate((el) => el.textContent.trim());
            if (text === 'I agree') {
                await btn.click();
                await sleep(500);
                break;
            }
        }
    } catch {}

    // MEN-Kategorie wählen
    await page.waitForSelector('[data-test="salon-service-side-bar-category-1"]');
    await page.click('[data-test="salon-service-side-bar-category-1"]');
    await sleep(500);

    // Cut & Finish → "Select" klicken
    await page.waitForSelector('[data-test="add-to-cart-button-0"]');
    await page.click('[data-test="add-to-cart-button-0"]');

    // "Haare ab Schulter" (unter Schulter Länge) wählen
    await page.waitForSelector('[data-test="select-service-modal-button-1"]');
    await page.click('[data-test="select-service-modal-button-1"]');
    await sleep(500);

    // Weiter zum Checkout-Kalender (Service ist jetzt in der Session gespeichert)
    await page.waitForSelector('[data-test="proceed-to-checkout-button"]');
    await page.click('[data-test="proceed-to-checkout-button"]');
    await page.waitForSelector('[role="gridcell"]', { timeout: 10000 });

    // Jeden Tag per URL-Navigation prüfen (Session bleibt erhalten)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let found = false;

    console.log('Suche nächsten freien Termin...');

    for (let i = 0; i < 90 && !found; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Montag (1) und Sonntag (0) überspringen — Salon geschlossen
        const dow = date.getDay();
        if (dow === 0 || dow === 1) continue;

        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const urlDate = `${y}-${m}-${d}`;

        await page.goto(
            `https://salonkee.de/checkout/duke-of-haircuts?selectedDate=${urlDate}`,
            { waitUntil: 'networkidle2' }
        );

        // Prüfe ob Zeitslot-Buttons vorhanden sind (Format HH:MM)
        const hasTimeSlots = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.some((b) => /^\d{2}:\d{2}$/.test(b.textContent.trim()));
        });

        if (hasTimeSlots) {
            // Verfügbare Zeiten auslesen
            const times = await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                return btns
                    .map((b) => b.textContent.trim())
                    .filter((t) => /^\d{2}:\d{2}$/.test(t));
            });

            console.log(`\nNächster freier Termin: ${d}.${m}.${y}`);
            console.log(`Verfügbare Zeiten: ${times.join(', ')}`);
            console.log(`Buchungs-URL: https://salonkee.de/checkout/duke-of-haircuts?selectedDate=${urlDate}`);
            found = true;
        }
    }

    if (!found) {
        console.log('\nKein freier Termin in den nächsten 90 Tagen gefunden.');
        console.log('Bitte direkt anrufen: 0911448838');
    }

    await browser.close();
})();
