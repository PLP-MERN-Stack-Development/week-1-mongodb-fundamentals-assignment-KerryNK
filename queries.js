const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://kerrym:W2DDlHaNZtvbg45u@cluster0.qjjen.mongodb.net/';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // --- Task 3: Advanced Queries ---

    // 1. Find books that are both in stock and published after 2010
    const recentInStockBooks = await collection.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log('\nBooks in stock and published after 2010:', recentInStockBooks);

    // 2. Use projection to return only title, author, price
    const projectedBooks = await collection.find({}, {
      projection: { title: 1, author: 1, price: 1, _id: 0 }
    }).toArray();
    console.log('\nProjection (title, author, price):', projectedBooks);

    // 3. Sorting by price ascending
    const sortedAsc = await collection.find({}, {
      projection: { title: 1, price: 1, _id: 0 }
    }).sort({ price: 1 }).toArray();
    console.log('\nBooks sorted by price ascending:', sortedAsc);

    // Sorting by price descending
    const sortedDesc = await collection.find({}, {
      projection: { title: 1, price: 1, _id: 0 }
    }).sort({ price: -1 }).toArray();
    console.log('\nBooks sorted by price descending:', sortedDesc);

    // 4. Pagination: 5 books per page, page 1 (skip 0)
    const page = 1; // change this for other pages
    const limit = 5;
    const paginatedBooks = await collection.find({}, {
      projection: { title: 1, author: 1, price: 1, _id: 0 }
    }).skip((page - 1) * limit).limit(limit).toArray();
    console.log(`\nPage ${page} (5 books per page):`, paginatedBooks);

    // --- Task 4: Aggregation Pipeline ---

    // 1. Average price of books by genre
    const avgPriceByGenre = await collection.aggregate([
      {
        $group: {
          _id: '$genre',
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { averagePrice: -1 } }
    ]).toArray();
    console.log('\nAverage price of books by genre:', avgPriceByGenre);

    // 2. Find the author with the most books
    const topAuthor = await collection.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('\nAuthor with the most books:', topAuthor);

    // 3. Group books by publication decade and count
    const booksByDecade = await collection.aggregate([
      {
        $project: {
          decade: {
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] } },
              's'
            ]
          }
        }
      },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nBooks grouped by publication decade:', booksByDecade);

    // --- Task 5: Indexing ---

    // 1. Create an index on the title field
    await collection.createIndex({ title: 1 });
    console.log('\nIndex created on "title" field');

    // 2. Create a compound index on author and published_year
    await collection.createIndex({ author: 1, published_year: -1 });
    console.log('Compound index created on "author" and "published_year" fields');

    // 3. Explain() method to demonstrate performance with and without indexes

    // Example query before indexes
    let explanationBefore = await collection.find({ title: '1984' }).explain('executionStats');
    console.log('\nExplain plan for query on title "1984":', explanationBefore.executionStats);

    // (Indexes have now been created above)

    // Example query after indexes
    let explanationAfter = await collection.find({ title: '1984' }).explain('executionStats');
    console.log('\nExplain plan for query on title "1984" after index creation:', explanationAfter.executionStats);

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

runQueries().catch(console.error);
