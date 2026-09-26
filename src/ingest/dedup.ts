import Quote from '../models/quote';
import { dedupKeyFor } from './normalize';

export interface DedupBackfill {
  backfilled: number;
  conflicts: number;
}

const isDuplicateKeyError = (error: unknown): boolean => typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;

export const ensureDedupKeys = async (dryRun: boolean): Promise<DedupBackfill> => {
  const missing = await Quote.find({
    $or: [{ dedupKey: { $exists: false } }, { dedupKey: null }],
  }).select('+dedupKey');

  let backfilled = 0;
  let conflicts = 0;

  for (const quote of missing) {
    const dedupKey = dedupKeyFor(quote.text);
    if (quote.dedupKey === dedupKey) continue;

    if (dryRun) {
      backfilled += 1;
      continue;
    }

    try {
      await Quote.updateOne({ _id: quote._id }, { $set: { dedupKey } });
      backfilled += 1;
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      conflicts += 1;
    }
  }

  return { backfilled, conflicts };
};

export const existingDedupKeys = async (dedupKeys: string[]): Promise<Set<string>> => {
  if (dedupKeys.length === 0) return new Set();

  const existing = await Quote.find({ dedupKey: { $in: dedupKeys } })
    .select('+dedupKey')
    .lean();
  return new Set(existing.map((quote) => quote.dedupKey));
};
