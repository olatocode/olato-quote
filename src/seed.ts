import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Quote from './models/quote';

const quotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'motivation' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'motivation' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'motivation' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'motivation' },
  { text: 'The best thing to hold onto in life is each other.', author: 'Audrey Hepburn', category: 'love' },
  { text: 'I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love.', author: 'Gabriel Garcia Marquez', category: 'love' },
  { text: 'I love you not because of who you are, but because of who I am when I am with you.', author: 'Roy Croft', category: 'love' },
  { text: 'The course of true love never did run smooth.', author: 'William Shakespeare', category: 'love' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'success' },
  { text: 'Success is walking from failure to failure with no loss of enthusiasm.', author: 'Winston Churchill', category: 'success' },
  { text: 'Success is not how high you have climbed, but how you make a positive difference to the world.', author: 'Roy T. Bennett', category: 'success' },
  { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau', category: 'success' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins', category: 'inspiration' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson', category: 'inspiration' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis', category: 'inspiration' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', category: 'inspiration' },
];

const seedDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected for seeding');

    await Quote.deleteMany({});
    console.log('Cleared existing quotes');

    await Quote.insertMany(quotes);
    console.log(`Seeded ${quotes.length} quotes`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
