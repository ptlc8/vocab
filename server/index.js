import Express from 'express';
import * as Vocab from './vocab.js';
import { Difficulties } from './difficulties.js';

const port = process.env.PORT ?? '80';

const app = Express();

app.use(Express.static('static'));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.locals.base = '/vocab'; // TODO make dynamic
app.locals.difficulties = Difficulties;

// Locale middleware
app.use((req, res, next) => {
    const langs = req.acceptsLanguages();
    res.locals.locale = langs && langs.length ? langs[0] : 'fr';
    next();
});

// Homepage route
app.get('/', (req, res) => {
    res.render('index');
});

// Word list route
app.get('/words', async (req, res) => {
    const words = await Vocab.getWords();
    res.render('words', { words });
});

// Word route
app.get('/words/:word', async (req, res) => {
    const wordId = req.params.word || '';
    const word = await Vocab.getWord(wordId);
    if (word) {
        res.render('word', { word });
    } else {
        res.status(404).render('error', { message: 'Mot non trouvé' });
    }
});

// 404 handler
app.use((req, res, _next) => {
    res.status(404).render('error', { message: 'Page non trouvée' });
});

// Error handling
app.use((req, res, next) => {
    const origEnd = res.end;
    res.end = function (...args) {
        Promise.resolve()
            .then(() => origEnd.apply(res, args))
            .catch(next);
    };
    next();
});

app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Erreur interne du serveur' });
});

// Start server
app.listen(port, err => {
    if (err) console.error(err);
    else console.log('HTTP server started');
});
