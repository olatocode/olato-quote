const WIKI_FILE_LINK = /\[\[(?:File|Image|Category):[^\]]*\]\]/gi;
const WIKI_LINK_LABELLED = /\[\[[^\]|]+\|([^\]]+)\]\]/g;
const WIKI_LINK = /\[\[([^\]]+)\]\]/g;
const WIKI_TEMPLATE = /\{\{[^}]*\}\}/g;
const EXTERNAL_LINK = /\[(?:https?:)?\/\/\S+\s*"?([^\]]*?)"?\]/g;
const EDIT_MARKER = /\[(?:citation needed|clarification needed|edit|note \d+)\]/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const EMPHASIS = /'{2,4}/g;
const WHITESPACE = /\s+/g;
const LEADING_NOISE = /^[\s\-–—,.:;]+/;
const LEADING_NAMESPACE = /^(?:w|wikipedia|simple|q|wikt|wikiquote):/i;
const LABELLED_LINK = /^\s*\[\[[^\]|]*\|([^\]]+)\]\]/;
const PLAIN_LINK = /^\s*\[\[([^\]]+)\]\]/;
const TRUNCATION = /(?:\s*(?:\.\s*){2,}|…)\s*$/;
const SURROUNDING_QUOTES = /^["“”](.+?)["“”]$/;
const SURROUNDING_QUOTE_CHARS = /^["“”]+|["“”]+$/g;
const PUNCTUATION = /[^\p{L}\p{N}\s]/gu;
const PLACEHOLDER_AUTHOR = /^(anonymous|unknown|traditional|folklore|others?|various)$/i;
const URL_LIKE = /https?:|www\./i;

export const RESIDUAL_MARKUP = /[<>{}|=]/;

export const stripWikiMarkup = (raw: string): string =>
  raw
    .replace(HTML_COMMENT, ' ')
    .replace(WIKI_FILE_LINK, ' ')
    .replace(EXTERNAL_LINK, '$1')
    .replace(WIKI_LINK_LABELLED, '$1')
    .replace(WIKI_LINK, '$1')
    .replace(WIKI_TEMPLATE, ' ')
    .replace(EDIT_MARKER, ' ')
    .replace(EMPHASIS, '')
    .replace(WHITESPACE, ' ')
    .trim();

export const cleanQuoteText = (raw: string): string => {
  const cleaned = stripWikiMarkup(raw).replace(TRUNCATION, '').trim();
  const unwrapped = cleaned.match(SURROUNDING_QUOTES);
  return (unwrapped ? unwrapped[1] : cleaned).replace(WHITESPACE, ' ').trim();
};

export const extractAuthor = (raw: string, maxLength: number): string | null => {
  const labelled = raw.match(LABELLED_LINK);
  const plain = raw.match(PLAIN_LINK);
  const base = labelled ? labelled[1] : plain ? plain[1] : raw.split(/,|\(|\[/)[0];
  const afterPrefix = base.includes(':') ? base.slice(base.lastIndexOf(':') + 1) : base;

  const author = stripWikiMarkup(afterPrefix).replace(LEADING_NAMESPACE, '').replace(LEADING_NOISE, '').replace(SURROUNDING_QUOTE_CHARS, '').trim();

  if (author.length < 3 || author.length > maxLength) return null;
  if (PLACEHOLDER_AUTHOR.test(author)) return null;
  if (URL_LIKE.test(author)) return null;
  return author;
};

export const dedupKeyFor = (text: string): string => text.toLowerCase().replace(PUNCTUATION, ' ').replace(WHITESPACE, ' ').trim();
