import { AVAILABLE_CATEGORIES, type CategorySlug } from '../config/categories';
import { INGEST_CONFIG } from '../config/ingest';
import IngestionRun from '../models/ingestion-run';
import Quote from '../models/quote';
import type { IngestionRunStatus, IQuoteWithDedupKey } from '../types';
import { classify } from './classify';
import { ensureDedupKeys, existingDedupKeys } from './dedup';
import { screenCandidate } from './filters';
import { dedupKeyFor } from './normalize';
import { wikiquoteSource } from './sources/wikiquote';
import type { Candidate, QuoteSource, RunOptions, RunSummary } from './types';

interface InsertResult {
  landed: IQuoteWithDedupKey[];
  duplicates: number;
  errors: string[];
}

interface HarvestQueue {
  category: CategorySlug;
  candidates: Candidate[];
  cursor: number;
  known: Set<string>;
}

const bump = (counts: Record<string, number>, key: string): void => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const insertFresh = async (quotes: IQuoteWithDedupKey[]): Promise<InsertResult> => {
  try {
    await Quote.insertMany(quotes, { ordered: false });
    return { landed: quotes, duplicates: 0, errors: [] };
  } catch (error) {
    const writeErrors = (error as { writeErrors?: Array<{ code?: number; errmsg?: string }> }).writeErrors ?? [];
    const duplicates = writeErrors.filter((writeError) => writeError.code === 11000).length;
    const failures = writeErrors.filter((writeError) => writeError.code !== 11000).map((writeError) => writeError.errmsg ?? 'unknown write error');
    const landedKeys = await existingDedupKeys(quotes.map((quote) => quote.dedupKey));

    return {
      landed: quotes.filter((quote) => landedKeys.has(quote.dedupKey)),
      duplicates,
      errors: failures,
    };
  }
};

const resolveStatus = (summary: RunSummary, target: number, failedSources: number): IngestionRunStatus => {
  if (summary.accepted === 0) {
    return failedSources === AVAILABLE_CATEGORIES.length ? 'failed' : 'exhausted';
  }
  if (failedSources > 0 || summary.errors.length > 0) return 'partial';
  return summary.accepted < target ? 'exhausted' : 'success';
};

export const runIngestion = async (options: RunOptions, source: QuoteSource = wikiquoteSource): Promise<RunSummary> => {
  const startedAt = new Date();
  const target = options.limit ?? INGEST_CONFIG.target;

  const summary: RunSummary = {
    source: source.name,
    status: 'success',
    startedAt,
    finishedAt: startedAt,
    fetched: 0,
    accepted: 0,
    duplicate: 0,
    rejected: 0,
    byCategory: {},
    rejectReasons: {},
    errors: [],
    samples: [],
  };

  const backfill = await ensureDedupKeys(options.dryRun);
  if (backfill.backfilled > 0) {
    console.log(`${backfill.backfilled} existing quotes ${options.dryRun ? 'need' : 'received'} a dedup key`);
  }
  if (backfill.conflicts > 0) {
    summary.errors.push(`${backfill.conflicts} existing quotes share a dedup key and were left unchanged`);
  }

  const queues: HarvestQueue[] = [];
  const seen = new Set<string>();
  const staged: IQuoteWithDedupKey[] = [];
  let failedSources = 0;

  for (const category of AVAILABLE_CATEGORIES) {
    let candidates: Candidate[];

    try {
      candidates = await source.fetchCandidates(category);
    } catch (error) {
      failedSources += 1;
      summary.errors.push(`${source.name}/${category}: ${(error as Error).message}`);
      continue;
    }

    summary.fetched += candidates.length;
    queues.push({
      category,
      candidates,
      cursor: 0,
      known: await existingDedupKeys(candidates.map((candidate) => dedupKeyFor(candidate.text))),
    });
  }

  const takeNext = (queue: HarvestQueue): void => {
    while (queue.cursor < queue.candidates.length) {
      const candidate = queue.candidates[queue.cursor];
      queue.cursor += 1;

      const screen = screenCandidate(candidate);
      if (!screen.ok) {
        summary.rejected += 1;
        bump(summary.rejectReasons, screen.reason);
        continue;
      }

      const categorySlug = classify(candidate);
      if (!categorySlug) {
        summary.rejected += 1;
        bump(summary.rejectReasons, 'unclassifiable');
        continue;
      }

      const dedupKey = dedupKeyFor(candidate.text);
      if (seen.has(dedupKey) || queue.known.has(dedupKey)) {
        summary.duplicate += 1;
        continue;
      }

      seen.add(dedupKey);
      staged.push({
        text: candidate.text,
        author: candidate.author,
        category: categorySlug,
        dedupKey,
        ...candidate.attribution,
      });
      return;
    }
  };

  const exhausted = (): boolean => queues.every((queue) => queue.cursor >= queue.candidates.length);

  while (staged.length < target && !exhausted()) {
    for (const queue of queues) {
      if (staged.length >= target) break;
      takeNext(queue);
    }
  }

  let landed = staged;

  if (options.dryRun) {
    summary.accepted = staged.length;
  } else if (staged.length > 0) {
    const insert = await insertFresh(staged);
    landed = insert.landed;
    summary.accepted = landed.length;
    summary.duplicate += insert.duplicates;
    summary.errors.push(...insert.errors);
  }

  for (const quote of landed) {
    bump(summary.byCategory, quote.category);
  }

  summary.samples = landed.slice(0, 5).map((quote) => ({
    text: quote.text,
    author: quote.author,
    category: quote.category,
  }));
  summary.status = resolveStatus(summary, target, failedSources);
  summary.finishedAt = new Date();

  if (!options.dryRun) {
    await IngestionRun.create({
      source: summary.source,
      startedAt: summary.startedAt,
      finishedAt: summary.finishedAt,
      status: summary.status,
      fetched: summary.fetched,
      accepted: summary.accepted,
      duplicate: summary.duplicate,
      rejected: summary.rejected,
      error: summary.errors.length > 0 ? summary.errors.join('; ') : undefined,
    });
  }

  return summary;
};
