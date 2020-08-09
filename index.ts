import { WikiParse } from './services/wikiParse';
import { TextAnalizer } from './services/textAnalizer';

const start = '/wiki/United_States';

(async () => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent(start);

  const urls = WikiParse.getAllInternalUrls(html);

  console.log('urls : ', urls);
  const n = await WikiParse.getBiDirectionalLinkedArticle(start, urls);
  console.log(n.length);
  // const textAnalizer = new TextAnalizer();
  // console.log(textAnalizer.getWordsValues(text));
})();
