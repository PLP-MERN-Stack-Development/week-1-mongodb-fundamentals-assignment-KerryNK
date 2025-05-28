// queries.js - Run sample queries on MongoDB book collection

const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://kerrym:W2DDlHaNZtvbg45u@cluster0.qjjen.mongodb.net/';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

const db = client.db('plp_bookstore');
    const collection = db.collection(collectionName);

    // 1. Find all books
    const allBooks = await collection.find({}).toArray();
    console.log('\n📚 All Books:');
    allBooks.forEach(book => console.log(`- ${book.title}`));

    // 2. Find books by George Orwell
    const orwellBooks = await collection.find({ author: 'George Orwell' }).toArray();
    console.log('\n👤 Books by George Orwell:');
    orwellBooks.forEach(book => console.log(`- ${book.title}`));

    // 3. Books published after 1950
    const modernBooks = await collection.find({ published_year: { $gt: 1950 } }).toArray();
    console.log('\n📅 Books Published After 1950:');
    modernBooks.forEach(book => console.log(`- ${book.title} (${book.published_year})`));

    // 4. Books in the Fiction genre
    const fictionBooks = await collection.find({ genre: 'Fiction' }).toArray();
    console.log('\n🎭 Fiction Books:');
    fictionBooks.forEach(book => console.log(`- ${book.title}`));

    // 5. Books that are in stock
    const inStockBooks = await collection.find({ in_stock: true }).toArray();
    console.log('\n✅ In-Stock Books:');
    inStockBooks.forEach(book => console.log(`- ${book.title}`));

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

runQueries().catch(console.error);
