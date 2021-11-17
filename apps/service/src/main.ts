import * as express from 'express';
import axios from 'axios';
import * as sqlite3 from 'sqlite3';

const app = express();
const db = new sqlite3.Database(':memory:');
const port = process.env.port || 3000;

app.get('/starships', (req, res) => {
  const ships = [];
  db.each(
    'SELECT * FROM starship;',
    (err, row) => ships.push(row),
    () => {
      res.send({ ships });
    }
  );
});

app.use('*', (req, res) => {
  res.send({ error: 404 });
});

const server = app.listen(port, async () => {
  db.run(
    `CREATE TABLE starship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    cost_in_credits DOUBLE,
    max_atmosphering_speed DOUBLE
  );`,
    async () => {
      let starships = [];
      let next = `https://swapi.dev/api/starships?page=1`;

      while (next !== null) {
        const result = (await axios.get(next)) as any;
        starships = starships.concat(
          result.data.results.filter(
            (ship) =>
              !Number.isNaN(Number(ship.cost_in_credits)) &&
              !Number.isNaN(Number(ship.max_atmosphering_speed))
          )
        );
        next = result.data.next;
      }

      console.log(
        'Found ships with good data: ',
        starships.map((ship) => ship.name)
      );

      const stmt = db.prepare(
        'INSERT INTO starship (name, cost_in_credits, max_atmosphering_speed) VALUES (?, ?, ?);'
      );
      starships.forEach((ship) => {
        stmt.run([
          ship.name,
          ship.cost_in_credits,
          ship.max_atmosphering_speed,
        ]);
      });
      stmt.finalize(() => {
        console.log('Seeded ships: ');
        db.each(
          'SELECT * from STARSHIP;',
          (err, row) => console.log(row),
          () => {
            console.log(`Listening at http://localhost:${port}`);
          }
        );
      });
    }
  );
});

server.on('error', console.error);
