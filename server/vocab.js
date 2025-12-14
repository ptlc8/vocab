import { queryMany, queryOne } from './database.js';

export async function getWords() {
    return queryMany('SELECT id, text FROM word');
}

export async function getWord(wordId) {
    const word = await queryOne('SELECT * FROM word WHERE id = $1', [wordId]);
    if (!word) return null;
    word.categories = await queryMany(
        `SELECT c.id, c.name FROM word_category wc
        JOIN category c ON wc.category_id = c.id
        WHERE wc.word_id = $1`,
        [wordId]
    );
    word.examples = await queryMany(
        `SELECT id, sentence FROM example
        WHERE word_id = $1`,
        [wordId]
    );
    word.near_words = await queryMany(
        `(SELECT w.id, w.text FROM near_words JOIN word w ON word2_id = w.id WHERE word1_id = $1)
        UNION
        (SELECT w.id, w.text FROM near_words JOIN word w ON word1_id = w.id WHERE word2_id = $1)`,
        [wordId]
    );
    word.confusions = await queryMany(
        `(SELECT w.id, w.text, nuance FROM confusion JOIN word w ON word2_id = w.id WHERE word1_id = $1)
        UNION
        (SELECT w.id, w.text, nuance FROM confusion JOIN word w ON word1_id = w.id WHERE word2_id = $1)`,
        [wordId]
    );
    return word;
}

export async function getAcquisitionGame() {
    const word = await queryOne(
        `SELECT id, text, long_definition, short_definition FROM word
        ORDER BY random() LIMIT 1;`
    );
    if (!word) throw new Error('Not enough words in database to start a game');
    const words = await queryMany(
        `SELECT id, text FROM word
        WHERE id <> $1
        ORDER BY long_definition <-> $2
        LIMIT 3;`,
        [word.id, word.long_definition]
    );
    return {
        mode: 'acquisition',
        definition: word.short_definition,
        options: shuffle([{ id: word.id, text: word.text }, ...words.map(w => ({ id: w.id, text: w.text }))]),
    };
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
