const fetcher = require("../fetcher");
const cheerio = require("cheerio");

class Dbooks {
    constructor() {
        this.baseUrl = "https://www.dbooks.org/";
        

    }
    

  async getAllCategory() {

        const data = await fetcher(`${this.baseUrl}`);
        const $ = cheerio.load(data);
        const listCategory = $("div.subject div.main").find("a");
        const result = [];
        listCategory.each((index, element) => {
            const subject = $(element).text();
            const fullUrl = $(element).attr("href");
            const path = new URL(fullUrl).pathname
            const slug =path.replace('/subject/', '').replace('/','');

            result.push({subject, slug, source:"dbooks"});
        });
        return result;
    }

    async getBooksByCategory(slug,page=1){
        const data = await fetcher(`${this.baseUrl}subject/${slug}/${page}`);
        const $ = cheerio.load(data);
        const listBooks = $("div.main").find("div.wrap");
        const result = [];
        listBooks.each((index, element) => {
            const title = $(element).find("a").text();
            const imageUrl = $(element).find("img").attr("data-src");
            const bookId = imageUrl.replace("/img/books/","").replace(".jpg","").replace("s", "");
            result.push({title, bookId, imageUrl});

            // const detailUrl = $(element).find("a").attr("href");
            // const imgUrl = $(element).find("img").attr("src");
            // result.push({title, detailUrl, imgUrl});
            // const subject = $(element).text();
            // console.log(subject)
            // const categoryUrl = $(element).attr("href");
            
        });
       
       return result;
    }
}
module.exports = Dbooks;