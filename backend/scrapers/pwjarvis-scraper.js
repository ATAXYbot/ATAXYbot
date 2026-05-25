const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Scrape all batches from pwjarvis.com
 * Returns an array of batch objects with all details
 */
async function scrapePWJarvisBatches() {
  let browser;
  try {
    console.log('🚀 Starting PWJarvis scraper...');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Set user agent to mimic real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('📄 Navigating to https://www.pwjarvis.com/study/all-batches...');
    await page.goto('https://www.pwjarvis.com/study/all-batches', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for batch cards to load
    await page.waitForSelector('[class*="batch"], [class*="course"], .card', {
      timeout: 30000
    }).catch(() => console.warn('⚠️ Batch selectors not found, proceeding anyway...'));

    // Get page HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    console.log('📊 Parsing batch data...');
    
    const batches = [];
    
    // Try different selectors that are common for batch/course listings
    const batchElements = $('[class*="batch"], [class*="course"], .card, [class*="item"]');
    
    batchElements.each((index, element) => {
      const $elem = $(element);
      
      const title = $elem.find('h2, h3, h4, .title, .name, [class*="title"]').text().trim();
      const description = $elem.find('p, .description, .subtitle, [class*="desc"]').text().trim();
      const instructor = $elem.find('.instructor, .mentor, [class*="instructor"], [class*="mentor"]').text().trim();
      const duration = $elem.find('.duration, .time, [class*="duration"]').text().trim();
      const price = $elem.find('.price, .cost, [class*="price"]').text().trim();
      const rating = $elem.find('.rating, .stars, [class*="rating"]').text().trim();
      const category = $elem.find('.category, .subject, [class*="category"]').text().trim();
      const imageUrl = $elem.find('img').attr('src') || $elem.css('background-image').match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      const link = $elem.find('a').attr('href') || '';
      const enrolledCount = $elem.find('[class*="enrolled"], [class*="student"]').text().trim();
      const startDate = $elem.find('[class*="start"], [class*="date"]').text().trim();
      const batchType = $elem.find('[class*="type"], [class*="batch-type"]').text().trim();
      
      // Only add if it has at least a title
      if (title) {
        batches.push({
          id: `batch_${Date.now()}_${index}`,
          title,
          description,
          instructor,
          duration,
          price,
          rating,
          category,
          imageUrl,
          link: link.startsWith('http') ? link : `https://www.pwjarvis.com${link}`,
          enrolledCount,
          startDate,
          batchType,
          scrapedAt: new Date().toISOString(),
          source: 'pwjarvis.com'
        });
      }
    });

    console.log(`✅ Successfully scraped ${batches.length} batches`);
    
    await browser.close();
    
    return {
      success: true,
      count: batches.length,
      batches,
      scrapedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    if (browser) await browser.close();
    
    return {
      success: false,
      error: error.message,
      batches: [],
      count: 0
    };
  }
}

module.exports = {
  scrapePWJarvisBatches
};
