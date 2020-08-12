import * as fs from 'fs';
import { WikiParse, BidirectioanlLinkedArticle } from './services/wikiParse';
import { TextAnalizer, WordsValues } from './services/textAnalizer';

const end = '/wiki/United_States';
const start = '/wiki/Mount_Kilimanjaro';

const getEndArtilcWordsMap = async (wikiUrl: string): Promise<WordsValues> => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent(wikiUrl);
  const urls = WikiParse.getAllInternalUrls(html);
  const biDirectioanlArticles = await WikiParse.getBiDirectionalLinkedArticle(wikiUrl, urls, 20);

  const allText = biDirectioanlArticles.reduce((acc: string, article: BidirectioanlLinkedArticle) => {
    acc += ' ' + article.text;
    return acc;
  }, text);

  const textAnalizer = new TextAnalizer();
  return textAnalizer.getWordsValues(allText);
}
(async () => {
  const endArtilcWordsMap = await getEndArtilcWordsMap(end);
  console.log('endArtilcWordsMap : ', endArtilcWordsMap);
})();
