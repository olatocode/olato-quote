import { INGEST_CONFIG } from '../config/ingest';
import { RESIDUAL_MARKUP } from './normalize';
import type { Candidate } from './types';

export type ScreenResult = { ok: true } | { ok: false; reason: string };

const isEnglish = (text: string): boolean => {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 20) return true;
  const ascii = letters.filter((letter) => /[a-zA-Z]/.test(letter)).length;
  return ascii / letters.length >= INGEST_CONFIG.minEnglishRatio;
};

const looksLikeAPerson = (author: string): boolean => {
  if (RESIDUAL_MARKUP.test(author)) return false;

  const words = author.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;

  const endsLikeASentence = /[.!?]$/.test(author);
  return !(endsLikeASentence && words.length > 4);
};

export const screenCandidate = (candidate: Candidate): ScreenResult => {
  const { text, author } = candidate;

  if (!text) return { ok: false, reason: 'empty-text' };
  if (RESIDUAL_MARKUP.test(text)) return { ok: false, reason: 'residual-markup' };
  if (text.length < INGEST_CONFIG.minLength) return { ok: false, reason: 'too-short' };
  if (text.length > INGEST_CONFIG.maxLength) return { ok: false, reason: 'too-long' };
  if (!isEnglish(text)) return { ok: false, reason: 'non-english' };
  if (!author) return { ok: false, reason: 'missing-author' };
  if (!looksLikeAPerson(author)) return { ok: false, reason: 'implausible-author' };

  return { ok: true };
};
