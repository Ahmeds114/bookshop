/**
 * Implementation for CatalogService defined in ./cat-service.cds
 */
const cds = require('@sap/cds');

module.exports = function () {
  // Override the default READ handler for Books to fetch fresh data from HANA
  this.on('READ', 'Books', async (req) => {
    const db = await cds.connect.to('db'); // Connect to the database
    return db.run(req.query); // Execute the incoming query against the database
  });

  // Add discount logic after reading the data
  this.after('READ', 'Books', (each) => {
    if (each.stock > 111) {
      each.title += ` -- 11% discount!`;
    }
  });

  // Add a custom handler to serve an HTML view of the books
  this.on('GET', '/viewBooks', async (req, res) => {
    const db = await cds.connect.to('db');
    const books = await db.run(SELECT.from('Books'));
    const html = generateHTML(books); // Generate an HTML response
    res.send(html);
  });
};

// Helper function to generate HTML for the books
function generateHTML(books) {
  let rows = books.map(
    (book) => `
      <tr>
        <td>${book.ID}</td>
        <td>${book.TITLE}</td>
        <td>${book.DESCR || '-'}</td>
        <td>${book.AUTHOR_ID}</td>
        <td>${book.STOCK}</td>
        <td>${book.PRICE ? `$${book.PRICE}` : '-'}</td>
        <td>${book.CURRENCY_CODE || '-'}</td>
      </tr>`
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Books</title>
      <style>
        table {
          width: 80%;
          margin: 20px auto;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
        }
        h1 {
          text-align: center;
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <h1>Available Books</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Author ID</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}