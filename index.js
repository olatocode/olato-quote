/** @format */

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create an array of quotes for each category
const quotes = {
  motivation: [
    'The only way to do great work is to love what you do. -Steve Jobs',
    "Believe you can and you're halfway there. -Theodore Roosevelt",
    'The future belongs to those who believe in the beauty of their dreams. -Eleanor Roosevelt',
  ],
  love: [
    'The best thing to hold onto in life is each other. -Audrey Hepburn',
    'I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love. -Gabriel Garcia Marquez',
    'I love you not because of who you are, but because of who I am when I am with you. -Roy Croft',
  ],
  success: [
    'Success is not final, failure is not fatal: it is the courage to continue that counts. -Winston Churchill',
    'Success is walking from failure to failure with no loss of enthusiasm. -Winston Churchill',
    'Success is not how high you have climbed, but how you make a positive difference to the world. -Roy T. Bennett',
  ],
};

// Set up an API route that accepts a category parameter and returns a random quote from that category
app.get('/quotes/:category', (req, res) => {
  const category = req.params.category;
  const categoryQuotes = quotes[category];

  if (!categoryQuotes) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const quote =
    categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
  return res.json({ quote: quote });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
