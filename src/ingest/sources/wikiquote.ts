import type { CategorySlug } from '../../config/categories';
import { INGEST_CONFIG } from '../../config/ingest';
import { cleanQuoteText, extractAuthor, RESIDUAL_MARKUP } from '../normalize';
import type { Candidate, QuoteSource } from '../types';

const API_ENDPOINT = 'https://en.wikiquote.org/w/api.php';
const ARTICLE_BASE = 'https://en.wikiquote.org/wiki/';
const MAX_ATTEMPTS = 3;

const TOPIC_PAGES: Record<CategorySlug, string> = {
  motivation: 'Motivation',
  love: 'Love',
  success: 'Success',
  inspiration: 'Inspiration',
};

const ATTRIBUTION = {
  source: 'Wikiquote',
  license: 'CC BY-SA 3.0',
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

interface WikiquotePage {
  missing?: boolean;
  revisions?: Array<{ slots?: { main?: { content?: string } } }>;
}

const requestWikitext = async (title: string, attempt = 1): Promise<string> => {
  const url = new URL(API_ENDPOINT);
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    titles: title,
  }).toString();

  const response = await fetch(url, {
    headers: {
      'User-Agent': INGEST_CONFIG.userAgent,
      'Api-User-Agent': INGEST_CONFIG.userAgent,
    },
    signal: AbortSignal.timeout(INGEST_CONFIG.requestTimeoutMs),
  });

  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < MAX_ATTEMPTS) {
      await sleep(INGEST_CONFIG.requestDelayMs * attempt);
      return requestWikitext(title, attempt + 1);
    }
    throw new Error(`Wikiquote API responded ${response.status} for ${title}`);
  }

  const payload = (await response.json()) as { query?: { pages?: WikiquotePage[] } };
  const page = payload.query?.pages?.[0];
  const content = page?.revisions?.[0]?.slots?.main?.content;

  if (!page || page.missing || typeof content !== 'string') {
    throw new Error(`Wikiquote page not found: ${title}`);
  }

  return content;
};

const parseCandidates = (wikitext: string, sourceUrl: string, sourceLabel: string): Candidate[] => {
  const lines = wikitext.split('\n');
  const candidates: Candidate[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.startsWith('* ') || line.startsWith('** ')) continue;

    const attributionLine = lines[index + 1] ?? '';
    if (!attributionLine.startsWith('** ')) continue;

    const text = cleanQuoteText(line.slice(2));
    const author = extractAuthor(attributionLine.slice(3), INGEST_CONFIG.maxAuthorLength);

    if (!text || !author || RESIDUAL_MARKUP.test(text)) continue;

    candidates.push({
      text,
      author,
      sourceLabel,
      attribution: { ...ATTRIBUTION, sourceUrl },
    });
  }

  return candidates;
};

const fetchWikiquoteCandidates = async (category: CategorySlug): Promise<Candidate[]> => {
  const title = TOPIC_PAGES[category];
  const wikitext = await requestWikitext(title);
  await sleep(INGEST_CONFIG.requestDelayMs);
  return parseCandidates(wikitext, `${ARTICLE_BASE}${encodeURIComponent(title)}`, category);
};

export const wikiquoteSource: QuoteSource = {
  name: 'wikiquote',
  fetchCandidates: fetchWikiquoteCandidates,
};
