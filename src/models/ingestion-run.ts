import mongoose, { type Document, Schema } from 'mongoose';
import type { IIngestionRun, IngestionRunStatus } from '../types';

export interface IIngestionRunDocument extends IIngestionRun, Document {}

const RUN_STATUSES: IngestionRunStatus[] = ['success', 'partial', 'exhausted', 'failed'];

const IngestionRunSchema = new Schema<IIngestionRunDocument>({
  source: {
    type: String,
    required: true,
    trim: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  finishedAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: RUN_STATUSES,
  },
  fetched: {
    type: Number,
    required: true,
    default: 0,
  },
  accepted: {
    type: Number,
    required: true,
    default: 0,
  },
  duplicate: {
    type: Number,
    required: true,
    default: 0,
  },
  rejected: {
    type: Number,
    required: true,
    default: 0,
  },
  error: {
    type: String,
    trim: true,
  },
});

IngestionRunSchema.index({ startedAt: -1 });

const IngestionRun = mongoose.model<IIngestionRunDocument>('IngestionRun', IngestionRunSchema);

export default IngestionRun;
