import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3_000;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "frontend")));

app.get('/', (request, response) => {
    response.render("index");
})

app.get('/hello', (request, response) => {
    response.json({
        hello: "world"
    });
});

app.listen(port, () => {
    console.log(`Escuchando en http://localhost:${port}`);
})
