export interface IQuote {
  text: string;
  author: string;
  category: string;
  source?: string;
  sourceUrl?: string;
  license?: string;
}

export interface IQuoteWithDedupKey extends IQuote {
  dedupKey: string;
}
