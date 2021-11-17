import * as express from 'express';
import * as bodyParser from 'body-parser';
import axios from 'axios';
import * as sqlite3 from 'sqlite3';

const app = express();
const db = new sqlite3.Database(':memory:');
const port = process.env.port || 3000;

app.use(bodyParser.json());

app.get('/starships', (req, res) => {
  db.all('SELECT * FROM starship;', (err, rows) => res.send({ ships: rows }));
});

app.get('/starships/:id', (req, res) => {
  let ship = null;
  db.serialize(() => {
    const stmt = db.prepare('SELECT * FROM starship WHERE id=?;');
    stmt.get(req.params.id, (err, row) => {
      ship = row;
    });
    stmt.finalize(() => res.send({ ship }));
  });
});

app.post('/starships/race', (req, res) => {
  const { idA, idB } = req.body;
  const ids = [idA, idB];

  let ships = [];

  db.serialize(() => {
    const stmt = db.prepare('SELECT * FROM starship WHERE id=? OR id=?');
    stmt.all(ids, (error, rows) => {
      ships = rows;
    });
    stmt.finalize(() => {
      const winner = ships.sort(
        (a, b) => b.max_atmosphering_speed - a.max_atmosphering_speed
      )[0];
      res.send({ winner });
    });
  });
});

app.use('*', (req, res) => {
  res.status(404);
  res.send({ error: 'not found' });
});

const server = app.listen(port, async () => {
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

  db.serialize(async () => {
    db.run(
      `CREATE TABLE starship (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255),
      cost_in_credits DOUBLE,
      max_atmosphering_speed DOUBLE
    );`
    );

    const stmt = db.prepare(
      'INSERT INTO starship (name, cost_in_credits, max_atmosphering_speed) VALUES (?, ?, ?);'
    );
    starships.forEach((ship) => {
      stmt.run([ship.name, ship.cost_in_credits, ship.max_atmosphering_speed]);
    });
    stmt.finalize();

    db.all('SELECT * from STARSHIP;', (err, rows) => {
      console.log('Seeded ships: ');
      console.log(rows);
      console.log(`Listening at http://localhost:${port}`);
    });
  });
});

server.on('error', console.error);
