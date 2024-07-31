import app from './app.js';
import Database from './utils/database.js';

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

const db = new Database(DB);

await db.connect(DB)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
