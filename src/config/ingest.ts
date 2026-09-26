const positiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value !== undefined && Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const INGEST_CONFIG = {
  target: positiveNumber(process.env.INGEST_TARGET, 50),
  requestDelayMs: positiveNumber(process.env.INGEST_REQUEST_DELAY_MS, 1500),
  requestTimeoutMs: positiveNumber(process.env.INGEST_REQUEST_TIMEOUT_MS, 15000),
  userAgent: process.env.INGEST_USER_AGENT || 'OlatoQuoteBot/1.0 (+https://github.com/olato-quote; quote ingestion)',
  minLength: 40,
  maxLength: 280,
  minEnglishRatio: 0.8,
  maxAuthorLength: 80,
};
