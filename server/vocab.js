import { queryDatabase } from './database.js';

export async function getWords() {
    let rows = await queryDatabase('SELECT id, text FROM word');
    return rows;
}

export async function getWord(wordId) {
    const wordRows = await queryDatabase('SELECT * FROM word WHERE id = $1', [wordId]);
    if (wordRows.length == 0) return null;
    const word = wordRows[0];
    const categoriesRows = await queryDatabase(
        `SELECT c.id, c.name FROM word_category wc
        JOIN category c ON wc.category_id = c.id
        WHERE wc.word_id = $1`,
        [wordId]
    );
    word.categories = categoriesRows;
    const exampleRows = await queryDatabase(
        `SELECT id, sentence FROM example
        WHERE word_id = $1`,
        [wordId]
    );
    word.examples = exampleRows;
    const nearRows = await queryDatabase(
        `(SELECT w.id, w.text FROM near_words JOIN word w ON word2_id = w.id WHERE word1_id = $1)
        UNION
        (SELECT w.id, w.text FROM near_words JOIN word w ON word1_id = w.id WHERE word2_id = $1)`,
        [wordId]
    );
    word.near_words = nearRows;
    const confusionRows = await queryDatabase(
        `(SELECT w.id, w.text, nuance FROM confusion JOIN word w ON word2_id = w.id WHERE word1_id = $1)
        UNION
        (SELECT w.id, w.text, nuance FROM confusion JOIN word w ON word1_id = w.id WHERE word2_id = $1)`,
        [wordId]
    );
    word.confusions = confusionRows;
    return word;
}
