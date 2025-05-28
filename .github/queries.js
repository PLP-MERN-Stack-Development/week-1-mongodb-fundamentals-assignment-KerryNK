const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // 1. Find all books in a specific genre (e.g., 'Fiction')
    const fictionBooks = await books.find({ genre: 'Fiction' }).toArray();
    console.log('Fiction books:', fictionBooks);

    // 2. Find books published after 2010
    const booksAfter2010 = await books.find({ published_year: { $gt: 2010 } }).toArray();
    console.log('Books published after 2010:', booksAfter2010);

    // 3. Find books by a specific author (e.g., 'George Orwell')
    const orwellBooks = await books.find({ author: 'George Orwell' }).toArray();
    console.log('Books by George Orwell:', orwellBooks);

    // 4. Update the price of a specific book (e.g., '1984' to 12.99)
    const updateResult = await books.updateOne(
      { title: '1984' },
      { $set: { price: 12.99 } }
    );
    console.log('Updated price for 1984:', updateResult.modifiedCount);

    // 5. Delete a book by its title (e.g., 'Moby Dick')
    const deleteResult = await books.deleteOne({ title: 'Moby Dick' });
    console.log('Deleted Moby Dick:', deleteResult.deletedCount);

    // 6. Find books in stock and published after 2010 (with projection)
    const filteredBooks = await books.find(
      { in_stock: true, published_year: { $gt: 2010 } },
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log('In-stock books published after 2010:', filteredBooks);

    // 7. Sort books by price ascending
    const sortedAsc = await books.find({}, { projection: { title: 1, price: 1, _id: 0 } }).sort({ price: 1 }).toArray();
    console.log('Books sorted by price ascending:', sortedAsc);

    // 8. Sort books by price descending
    const sortedDesc = await books.find({}, { projection: { title: 1, price: 1, _id: 0 } }).sort({ price: -1 }).toArray();
    console.log('Books sorted by price descending:', sortedDesc);

    // 9. Pagination: page 1 (skip 0, limit 5)
    const page1 = await books.find({}, { projection: { title: 1, author: 1, _id: 0 } }).skip(0).limit(5).toArray();
    console.log('Page 1:', page1);

    // 10. Pagination: page 2 (skip 5, limit 5)
    const page2 = await books.find({}, { projection: { title: 1, author: 1, _id: 0 } }).skip(5).limit(5).toArray();
    console.log('Page 2:', page2);

    // 11. Aggregation: average price by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' } } }
    ]).toArray();
    console.log('Average price by genre:', avgPriceByGenre);

    // 12. Aggregation: author with most books
    const topAuthor = await books.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('Author with most books:', topAuthor);

    // 13. Aggregation: group books by publication decade and count
    const booksByDecade = await books.aggregate([
      {
        $group: {
          _id: {
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] } },
              's'
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    console.log('Books grouped by decade:', booksByDecade);

    // 14. Create an index on title
    await books.createIndex({ title: 1 });
    console.log('Created index on title');

    // 15. Create compound index on author and published_year
    await books.createIndex({ author: 1, published_year: 1 });
    console.log('Created compound index on author and published_year');

    // 16. Explain query performance on title
    const explain = await books.find({ title: '1984' }).explain('executionStats');
    console.log('Explain plan for title query:', explain.executionStats);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

runQueries();
