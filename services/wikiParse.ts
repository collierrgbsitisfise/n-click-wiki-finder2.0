import * as cheerio from "cheerio";
import got from 'got';

export class WikiParse {
  static async getWikiContent(url: string): Promise<WikiPageResponse> {
    const { body } = await got(url);
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
    return result.filter(isInternalLink);
  }
}

export type WikiPageResponse = {
  html: string;
  text: string;
};
