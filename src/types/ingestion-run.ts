export type IngestionRunStatus = 'success' | 'partial' | 'exhausted' | 'failed';

export interface IIngestionRun {
  source: string;
  startedAt: Date;
  finishedAt: Date;
  status: IngestionRunStatus;
  fetched: number;
  accepted: number;
  duplicate: number;
  rejected: number;
  error?: string;
}
