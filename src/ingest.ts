import dotenv from 'dotenv';

dotenv.config();

import { appendFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { runIngestion } from './ingest/run';
import type { RunOptions, RunSummary } from './ingest/types';

const parseArgs = (argv: string[]): RunOptions => {
  const limitIndex = argv.indexOf('--limit');
  const rawLimit = limitIndex >= 0 ? Number(argv[limitIndex + 1]) : Number.NaN;

  return {
    dryRun: argv.includes('--dry-run'),
    limit: Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined,
  };
};

const formatSummary = (summary: RunSummary, dryRun: boolean): string => {
  const counts = (record: Record<string, number>): string =>
    Object.entries(record)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ') || 'none';

  const lines = [
    `## Ingestion run (${summary.source})`,
    '',
    `- status: **${summary.status}**`,
    `- mode: ${dryRun ? 'dry run, nothing written' : 'write'}`,
    `- fetched: ${summary.fetched}`,
    `- accepted: ${summary.accepted}`,
    `- duplicate: ${summary.duplicate}`,
    `- rejected: ${summary.rejected}`,
    `- by category: ${counts(summary.byCategory)}`,
    `- reject reasons: ${counts(summary.rejectReasons)}`,
  ];

  if (summary.errors.length > 0) {
    lines.push('', '### Errors', '', ...summary.errors.map((error) => `- ${error}`));
  }

  if (summary.samples.length > 0) {
    lines.push('', '### Sample', '', ...summary.samples.map((sample) => `- [${sample.category}] ${sample.text} - ${sample.author}`));
  }

  return lines.join('\n');
};

const ingest = async (): Promise<void> => {
  const options = parseArgs(process.argv.slice(2));
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    if (!process.env.INGEST_USER_AGENT) {
      console.warn(
        'INGEST_USER_AGENT is not set, falling back to a User-Agent with no contact details. Wikimedia asks automated clients to say who they are.',
      );
    }

    await mongoose.connect(uri);

    const summary = await runIngestion(options);
    const report = formatSummary(summary, options.dryRun);

    console.log(report);

    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
    }

    await mongoose.connection.close();
    process.exit(summary.accepted === 0 ? 1 : 0);
  } catch (error) {
    console.error('Ingestion error:', error);
    process.exit(1);
  }
};

ingest();
