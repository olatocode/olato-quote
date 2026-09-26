import type { CategorySlug } from '../config/categories';
import type { IngestionRunStatus } from '../types';

export interface Attribution {
  source: string;
  sourceUrl: string;
  license: string;
}

export interface Candidate {
  text: string;
  author: string;
  attribution: Attribution;
  sourceLabel?: string;
}

export interface QuoteSource {
  name: string;
  fetchCandidates: (category: CategorySlug) => Promise<Candidate[]>;
}

export interface RunOptions {
  dryRun: boolean;
  limit?: number;
}

export interface RunSummary {
  source: string;
  status: IngestionRunStatus;
  startedAt: Date;
  finishedAt: Date;
  fetched: number;
  accepted: number;
  duplicate: number;
  rejected: number;
  byCategory: Record<string, number>;
  rejectReasons: Record<string, number>;
  errors: string[];
  samples: Array<{ text: string; author: string; category: string }>;
}
