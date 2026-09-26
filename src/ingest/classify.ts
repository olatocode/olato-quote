import { AVAILABLE_CATEGORIES, type CategorySlug } from '../config/categories';
import type { Candidate } from './types';

const KEYWORDS: Record<CategorySlug, string[]> = {
  motivation: [
    'motivat',
    'ambition',
    'ambitious',
    'persist',
    'perseverance',
    'determination',
    'strive',
    'struggle',
    'never give up',
    'keep going',
    'give up',
    'effort',
    'courage',
    'brave',
    'believe in yourself',
    'never stop',
  ],
  love: [
    'love',
    'loved',
    'loving',
    'beloved',
    'heart',
    'romance',
    'romantic',
    'kiss',
    'marriage',
    'wife',
    'husband',
    'soulmate',
    'cherish',
    'devotion',
    'affection',
    'passion',
  ],
  success: [
    'success',
    'successful',
    'succeed',
    'achieve',
    'achievement',
    'victory',
    'triumph',
    'win',
    'winning',
    'winner',
    'excel',
    'excellence',
    'prosper',
    'wealth',
    'fortune',
    'career',
    'prominence',
  ],
  inspiration: [
    'inspir',
    'imagination',
    'imagine',
    'dream',
    'creativity',
    'creative',
    'awaken',
    'possibility',
    'possibilities',
    'transform',
    'become',
    'extraordinary',
    'wonder',
    'soul',
  ],
};

const isCategory = (value: string): value is CategorySlug => (AVAILABLE_CATEGORIES as readonly string[]).includes(value);

export const classify = (candidate: Candidate): CategorySlug | null => {
  const label = candidate.sourceLabel?.toLowerCase().trim();
  if (label && isCategory(label)) return label;

  const haystack = candidate.text.toLowerCase();
  let best: CategorySlug | null = null;
  let bestScore = 0;

  for (const category of AVAILABLE_CATEGORIES) {
    const score = KEYWORDS[category].reduce((total, keyword) => (haystack.includes(keyword) ? total + 1 : total), 0);
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return best;
};
