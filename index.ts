import * as fs from 'fs';
import { WikiParse, BidirectioanlLinkedArticle } from './services/wikiParse';
import { TextAnalizer, WordsValues } from './services/textAnalizer';

const start = '/wiki/Mount_Kilimanjaro';
const end = '/wiki/manhattan';

const getEndArtilcWordsMap = async (wikiUrl: string): Promise<WordsValues> => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent(wikiUrl);
  const urls = WikiParse.getAllInternalUrls(html);
  const biDirectioanlArticles = await WikiParse.getBiDirectionalLinkedArticle(wikiUrl, urls, 30);

  const allText = biDirectioanlArticles.reduce((acc: string, article: BidirectioanlLinkedArticle) => {
    acc += ' ' + article.text;
    return acc;
  }, text);

  const textAnalizer = new TextAnalizer();
  return textAnalizer.getWordsValues(allText);
}

(async () => {
  const textAnalizer = new TextAnalizer();
  const visitedLinks = new Set();
  let currentLink = start;
  visitedLinks.add(currentLink);

  const linksPath = [currentLink];
  const urlsWeight = [];
  const endArtilcWordsMap = await getEndArtilcWordsMap(end);
  const endArtilcWordsMapSum = Object.keys(endArtilcWordsMap).reduce((acc, curr: string) => {
    acc += endArtilcWordsMap[curr];
    return acc;
  }, 0);

  console.log('endArticWordsMapSum : ', endArtilcWordsMapSum);

  while (true) {
    const { html } = await WikiParse.getWikiContent(currentLink);
    const urls = WikiParse.getAllInternalUrls(html);

    let articlesByWeightGreaterThanSumOfEndArticle = 0;
    for (const url of urls) {
      if (articlesByWeightGreaterThanSumOfEndArticle > 0) {
        break;
      }
      try {
        const { text } = await WikiParse.getWikiContent(url.toLowerCase());
        const taggedWords = textAnalizer.getTaggetWords(text);
        let sum = 0;
        for (const taggedWord of taggedWords) {
          sum += endArtilcWordsMap[taggedWord] || 0;
        }
        if (url.toLowerCase() === end.toLowerCase()) {
          linksPath.push(url.toLowerCase());
          console.log('PATH FOUND !!!');
          console.log(linksPath);
          return;
        }

        if (visitedLinks.has(url.toLowerCase())) {
          continue;
        }

        if (sum >= endArtilcWordsMapSum) {
          articlesByWeightGreaterThanSumOfEndArticle++
        }

        console.log({ url: url.toLowerCase(), weight: sum });
        urlsWeight.push({ url: url.toLowerCase(), weight: sum });
      } catch (err) {
        console.log('err : ');
      }
    }
    console.log('urlsWeight : ', urlsWeight);

    urlsWeight.sort((a, b) => b.weight - a.weight);
    currentLink = urlsWeight.shift().url;
    visitedLinks.add(currentLink);
    linksPath.push(currentLink);
    console.log('current link path : ', linksPath);
  }
})();
