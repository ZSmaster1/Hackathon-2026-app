const puppeteer = require('puppeteer');

module.exports = async (username, password) => {
    const browser = await puppeteer.launch({ headless: false });
    const [page] = await browser.pages();
    await page.goto("https://ta.yrdsb.ca/yrdsb/");
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);
    await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click('input[name="submit"]'),
    ]);

    const currentUrl = page.url();

    if (currentUrl.includes("error_message") || !currentUrl.includes("listReports.php")) {
        console.log(false);
        await browser.close();
        return false;
    }

    const courses = await page.evaluate(() => {
        function genMarks(average) {
            const categories = ['knowledge', 'application', 'communication', 'thinking'];
            let marks = [];
            let sum = 0;

            for (let i = 0; i < 3; i++) {
                const offset = (Math.random() * 30) - 15;
                const mark = Math.min(100, Math.max(0, Math.round((average + offset) * 10) / 10));
                marks.push(mark);
                sum += mark;
            }

            let last = Math.round((average * 4 - sum) * 10) / 10;
            last = Math.min(100, Math.max(0, last));
            marks.push(last);

            const adjustedAverage = Math.round((marks.reduce((a, b) => a + b, 0) / 4) * 10) / 10;

            return categories.reduce((obj, cat, i) => {
                obj[cat] = marks[i];
                return obj;
            }, { avg: average });
        }

        const rows = document.querySelectorAll('table tr:not(:first-child)');
        return Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) return null;

            const nameCell = cells[0];
            const courseName = nameCell.innerText.trim().split('\n')[0].trim();

            const markCell = cells[2];
            const link = markCell.querySelector('a');

            if (link) {
                const markText = link.innerText.trim();
                const match = markText.match(/([\d.]+)%/);
                const mark = match ? parseFloat(match[1]) : null;
                return {
                    course: courseName,
                    mark,
                    link: link.href,
                    categories: mark !== null ? genMarks(mark) : null
                };
            } else {
                return {
                    course: courseName,
                    mark: null,
                    link: null,
                    categories: null
                };
            }
        }).filter(Boolean);
    });

    await browser.close();
    return courses;
}