import mongoose, { Document, Schema } from 'mongoose';
import { IQuote } from '../types';

export interface IQuoteDocument extends IQuote, Document {}

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
});

QuoteSchema.index({ category: 1 });

const Quote = mongoose.model<IQuoteDocument>('Quote', QuoteSchema);

export default Quote;
