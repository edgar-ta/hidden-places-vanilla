import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';

import { router } from './api.js';

dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3_000;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.json());

app.get('/', (request, response) => {
    response.render("index");
});

app.get('/lugar/:id', (request, response) => {
    response.render("sightseeing", request.params);
});

app.use('/api', router);

app.listen(port, () => {
    console.log(`Escuchando en http://localhost:${port}`);
})
