import mongoose, { type Document, Schema } from 'mongoose';
import type { IQuoteWithDedupKey } from '../types';

export interface IQuoteDocument extends IQuoteWithDedupKey, Document {}

const QuoteSchema = new Schema<IQuoteDocument>({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
  },
  sourceUrl: {
    type: String,
    trim: true,
  },
  license: {
    type: String,
    trim: true,
  },
  dedupKey: {
    type: String,
    select: false,
  },
});

QuoteSchema.index({ category: 1 });
QuoteSchema.index({ dedupKey: 1 }, { unique: true, partialFilterExpression: { dedupKey: { $type: 'string' } } });

const Quote = mongoose.model<IQuoteDocument>('Quote', QuoteSchema);

export default Quote;
