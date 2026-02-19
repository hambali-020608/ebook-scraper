
const fetcher = require("../fetcher");
const cheerio = require('cheerio')
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const isProduction = process.env.NODE_ENV === 'production';
// Optional: If you'd like to disable webgl, true is the default.
chromium.setGraphicsMode = false;
class FreeComBooks {

    constructor(){
        this.baseUrl = "https://freecomputerbooks.com";   
    }
    async getAllCategory(){
    const data = await fetcher(`${this.baseUrl}/sitemap.html`);
    const $ = cheerio.load(data);
    const allSubject = $('a.categoryTitle');
    const result = [];
    allSubject.each((index, element) => {
        const subject = $(element).text();
        const slug = $(element).attr("href");
        result.push({subject, slug, source:"freeCom"});
    });
    return result;
   }

   async getSubCategory(categoryPath){
    const data = await fetcher(`${this.baseUrl}/${categoryPath}`);
    const $ = cheerio.load(data);
    const listSubject = $("div#subjects").find("a");
    const result = [];
    listSubject.each((index, element) => {
        const subject = $(element).text();
        const subCategoryUrl = $(element).attr("href");
        result.push({subject, subCategoryUrl});
    });
    return result;
   }
   async getBookByCategory(subCategoryPath){
    const data = await fetcher(`${this.baseUrl}/${subCategoryPath}`);
    const $ = cheerio.load(data);
    const listBooks = $("ul#newBooksL").find("li");
    
    const result = [];
    listBooks.each((index, element) => {
        const title = $(element).find("a").text();
        const detailUrl = $(element).find("a").attr("href");
        const imgUrl = `${this.baseUrl}/${$(element).find("img").attr("src")}`;
      result.push({title, detailUrl, imgUrl});
    });
   
    return result;
   }

  async getBookDetail(bookPath) {
    const data = await fetcher(`${this.baseUrl}/${bookPath}`);
    const $ = cheerio.load(data);
    const result = {
        info: {},
        downloadLinks: [] 
    };
 
    const bookInformation = $("div#booktitle ul li");
    const bookImage = $("td.imageColumn img").attr("src");
    result.info.image = `${this.baseUrl}/${bookImage}`;
    bookInformation.each((i, el) => {
        const fullText = $(el).text().trim();
        
    
        if (fullText.includes(":")) {
            const splitText = fullText.split(":");
            const key = splitText[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            const value = splitText.slice(1).join(":").trim(); // Menangani jika ada ":" di dalam teks
            
            if (key !== 'share_this') {
                result.info[key] = value;
            }
        } else {
            if (fullText.toLowerCase().includes("author")) {
                result.info.authors = fullText.replace(/author\(s\)/i, "").trim();
            }
        }
    });
    const bookDescription = $("div#bookdesccontent p").eq(1).text().trim();
    result.info.description = bookDescription;
    const downloadList = $('#downloadLinks').nextAll('ul').first();
    downloadList.find('li a').each((i, el) => {
        result.downloadLinks.push({
            label: $(el).text().trim(),
            url: $(el).attr('href')
        });
    });

    return result;
}

async searchBook(q){
    if (!q) {
    return { error: 'Parameter pencarian (q) diperlukan' };
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath() 
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Jalur Chrome Lokal
      headless: isProduction ? chromium.headless : false, // Di lokal set false biar kelihatan prosesnya
    });

    const page = await browser.newPage();
    
    const searchUrl = `https://freecomputerbooks.com/search2.html?q=${encodeURIComponent(q)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.gsc-result', { timeout: 6000 });

    const results = await page.evaluate(() => {
      const data = [];
      const items = document.querySelectorAll('.gsc-webResult.gsc-result');
      
      items.forEach(item => {
        const titleElement = item.querySelector('a.gs-title');
        const bookPath = new URL(titleElement.href).pathname.replace('/','');
        const detailElement = item.querySelector('.gs-snippet');
        const imageElement = item.querySelector('img.gs-image')

        const imageSrc = imageElement ? imageElement.src : null;

        
        if (titleElement) {
          data.push({
            title: titleElement.innerText,
            slug: bookPath,
            url: bookPath,
            image: imageSrc,
            detail: detailElement ? detailElement.innerText : ''
          });
        }
      });
      return data;
    });

    return results;

  } catch (error) {
    console.error('Gagal mengambil data:', error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
    
}
  
}

module.exports = FreeComBooks;