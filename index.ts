import { WikiParse } from './services/wikiParse';

(async () => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent('https://en.wikipedia.org/wiki/United_States');

  const urls = WikiParse.getAllInternalUrls(html);
  console.log('utls : ', urls);
})();
