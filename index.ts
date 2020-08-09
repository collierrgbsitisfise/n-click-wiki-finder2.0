import { WikiParse } from './services/wikiParse';
import { TextAnalizer } from './services/textAnalizer';


(async () => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent('https://en.wikipedia.org/wiki/United_States');

  const urls = WikiParse.getAllInternalUrls(html);

  const textAnalizer = new TextAnalizer();
  console.log(textAnalizer.getWordsValues(text));
})();
