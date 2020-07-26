import * as fs from 'fs';
import * as nlp from 'natural';
import { WikiParse } from './services/wikiParse';

const tokenizer = new nlp.AggressiveTokenizer();
const nounInflector = new nlp.NounInflector();

const language = "EN"
const defaultCategory = 'N';
const defaultCategoryCapitalized = '-';

const lexicon = new nlp.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
const ruleSet = new nlp.RuleSet('EN');
const tagger = new nlp.BrillPOSTagger(lexicon, ruleSet);

(async () => {
  const {
    text,
    html,
  } = await WikiParse.getWikiContent('https://en.wikipedia.org/wiki/United_States');

  const urls = WikiParse.getAllInternalUrls(html);

  const tokinizedText = tokenizer.tokenize(text)
    .map((token: string) => nlp.PorterStemmer.stem(token.toLowerCase()))
    .map(word => nounInflector.singularize(word))
    .filter(word => {
      const onlyAlphabeticChars = /^[a-z]+$/i.test(word);
      const moreThanOneChar = word.length > 1;
      return onlyAlphabeticChars && moreThanOneChar;
    });

  const { taggedWords } = tagger.tag(tokinizedText);
  const res = taggedWords
    .filter(({ tag }) => ['NN', 'NNS', 'NNP', 'NNPS'].includes(tag))
    .reduce((acc: object, { token }) => {
      if (!acc[token]) {
        acc[token] = 0;
      }

      acc[token] += 1;

      return acc;
    }, {});

  console.log(res);
})();

// https://www.guru99.com/pos-tagging-chunking-nltk.html
