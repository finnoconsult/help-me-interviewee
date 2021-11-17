import * as express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to service!' });
});

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
