import * as cheerio from "cheerio";
import got from 'got';

export class WikiParse {
  static basePath: string = 'https://en.wikipedia.org';
  static async getWikiContent(url: string): Promise<WikiPageResponse> {
    console.log('GET : ', `${this.basePath}${url}`);
    const { body } = await got(`${this.basePath}${url}`);
    const $ = cheerio.load(body);
    return {
      html: $("#bodyContent").html(),
      text: $("#bodyContent").text(),
    }
  };

  static getAllInternalUrls(body: string): string[] {
    const result = [];

    const $ = cheerio.load(body);
    const links = $('a');

    $(links).each((_, link) => {
      result.push($(link).attr('href'));
    });

    const isInternalLink = url => typeof url === 'string' && url.split('/')[1] === 'wiki';
    return result.filter(isInternalLink).map(link => link.toLowerCase());
  }

  static async getBiDirectionalLinkedArticle(
    mainLink: string,
    links: string[],
    limit: number = 10,
  ): Promise<BidirectioanlLinkedArticle[]> {
    const res: BidirectioanlLinkedArticle[] = [];

    for (const link of links) {
      try {
        const { text, html } = await WikiParse.getWikiContent(link);
        const articleLinks = WikiParse.getAllInternalUrls(html);
        console.log('articleLinks : ', articleLinks);
        if (articleLinks.includes(mainLink.toLowerCase())) {
          console.log('Lucky : ', link);
          res.push({
            text,
            url: link,
          });
        }
      } catch(err) {
        continue;
      }

      if (res.length === limit) {
        return res;
      }
    }

    return res;
  }
}

export type WikiPageResponse = {
  html: string;
  text: string;
};

export type BidirectioanlLinkedArticle = {
  url: string;
  text: string;
};
