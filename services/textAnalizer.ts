import * as nlp from 'natural';

// https://www.guru99.com/pos-tagging-chunking-nltk.html

export class TextAnalizer {
  private lexicon: nlp.Lexicon;
  private ruleSet: nlp.RuleSet;
  private tagger: nlp.BrillPOSTagger;
  private tokenizer: nlp.Tokenizer;
  private nounInflector: nlp.NounInflector;
  private validWordTypes: string[];

  constructor(
    language = "EN",
    defaultCategory = "N",
    validWordTypes = ['NN', 'NNS', 'NNP', 'NNPS'],
  ) {

    this.tokenizer = new nlp.AggressiveTokenizer();
    this.nounInflector = new nlp.NounInflector();
    this.lexicon = new nlp.Lexicon(language, defaultCategory);
    this.ruleSet = new nlp.RuleSet('EN');
    this.tagger = new nlp.BrillPOSTagger(this.lexicon, this.ruleSet);
    this.validWordTypes = validWordTypes;
  }
  getWordsValues(text: string): WordsValues {
    const tokinizedText = this.tokenizer.tokenize(text)
    .map((token: string) => nlp.PorterStemmer.stem(token.toLowerCase()))
    .map((word: string) => this.nounInflector.singularize(word))
    .filter((word: string) => {
      const onlyAlphabeticChars = /^[a-z]+$/i.test(word);
      const moreThanOneChar = word.length > 1;
      return onlyAlphabeticChars && moreThanOneChar;
    });

    // @TODO will be nice fix type defenition
    // @ts-ignore
    const { taggedWords } = this.tagger.tag(tokinizedText);
    const result = taggedWords
      .filter(({ tag }) => this.validWordTypes.includes(tag))
      .reduce((acc: WordsValues, { token }): WordsValues => {
        if (!acc[token]) {
          acc[token] = 0;
        }

        acc[token] += 1;

        return acc;
      }, {});

    return result;
  }
}

export type WordsValues = {
  [word: string]: number;
};
