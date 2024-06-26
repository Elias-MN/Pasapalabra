import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pino from 'pino';
import path from 'path';
import { log } from 'node:console';

const logger = pino({
  level: 'info'
});

logger.info("Opening database...");
const db = await open({
  filename: 'db.sqlite',
  driver: sqlite3.Database
})
logger.info("Database opened");

logger.info("Creating tables...");
await db.exec(`
    CREATE TABLE IF NOT EXISTS playerResult (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      successes INTEGER,
      mistakes INTEGER,
      time INTEGER
    );
  `);
logger.info("Tables created");

const app = express();

const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  logger.info("Serving index.html");
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  logger.info("Serving dashboard.html");
  res.sendFile(join(__dirname, 'dashboard.html'));
});

app.get('/results', async (req, res) => {
  logger.info("results requested");

  const results = await db.all('SELECT * FROM playerResult ORDER BY successes DESC');

  logger.info(results);

  res.json(results);
})

app.get('/results/clear', async (req, res) => {
  logger.info('clearing results');

  const result = await db.run('DELETE FROM playerResult');

  logger.info(result);

  res.json(result);
})

io.on('connection', async (socket) => {
  socket.on('new player finished', async (playerResult, callback) => {
    logger.info('new player finished');
    logger.info(playerResult);

    let result;
    try {
      result = await db.run('INSERT INTO playerResult (name, successes, mistakes, time) VALUES (?, ?, ?, ?)',
        playerResult.name, playerResult.successes, playerResult.mistakes, playerResult.time);
      socket.emit('new player catched', {});
    } catch (e) {
      console.error(e);
      if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
        callback();
      }
      return;
    }
    io.emit('new player finished', playerResult, result.lastID);
    callback();
  });

  if (!socket.recovered) {
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      // something went wrong
    }
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
