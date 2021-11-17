import * as express from 'express';
import axios from 'axios';
import * as sqlite3 from 'sqlite3';

const app = express();

sqlite3.verbose();
const db = new sqlite3.Database(':memory:');

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to service!' });
});

const port = process.env.port || 3000;
const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);

  db.run(`CREATE TABLE starship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    cost_in_credits DOUBLE,
    max_atmosphering_speed DOUBLE
  );`, async () => {
    let starships = [];
    let next = `https://swapi.dev/api/starships?page=1`;

    while (next !== null) {
      const result = await axios.get(next) as any;
      starships = starships
        .concat(result.data.results
          .filter(ship => !Number.isNaN(Number(ship.cost_in_credits)) && !Number.isNaN(Number(ship.max_atmosphering_speed))));
      next = result.data.next;
    }

    console.log('Found ships: ', starships.map(ship => ship.name));

    const stmt = db.prepare("INSERT INTO starship (name, cost_in_credits, max_atmosphering_speed) VALUES (?, ?, ?);");
    starships.forEach((ship) => {
      stmt.run([ship.name, ship.cost_in_credits, ship.max_atmosphering_speed]);
    })
    stmt.finalize(() => {
      console.log('Seeded ships: ');
      db.each('select * from starship;', (err, row) => console.log(row));
    });
  });
});
server.on('error', console.error);
