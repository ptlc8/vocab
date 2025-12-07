import { complete } from './llm/index.js';
import { z } from 'zod';

export const WordsListSchema = z.array(z.string().min(1)).min(1);

export const ConfusionSchema = z.object({
    other: z.string().min(1),
    nuance: z.string().min(1),
});

export const WordSchema = z.object({
    text: z.string().min(1),
    difficulty: z.number().int().min(1).max(5),
    register: z.enum(['familier', 'courant', 'soutenu', 'litteraire', 'technique']),
    short_definition: z.string().min(1),
    long_definition: z.string().min(1),
    origin: z.string().optional().nullable(),
    //notes: z.string().optional().nullable(),
    categories: z.array(z.string().min(1)).default([]),
    examples: z.array(z.string().min(1)).min(1),
    near_words: z.array(z.string().min(1)).default([]),
    confusions: z.array(ConfusionSchema).default([]),
});

export function extractJsonFromLlmOutput(raw) {
    // If the model put the answer in a ```json ... ``` block
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonText = fenced ? fenced[1] : raw;

    try {
        return JSON.parse(jsonText);
    } catch (err) {
        throw new Error(
            `Impossible de parser la réponse du LLM comme du JSON.
      Réponse brute (début) : ${jsonText.slice(0, 500)}`
        );
    }
}

export async function generateWordsList(count = 10) {
    const prompt = `
Tu es un lexicographe francophone qui prépare une liste de mots pour un jeu d'apprentissage du vocabulaire.

Objectif : proposer ${count} mots français qui soient intéressants à apprendre
(mélange possible entre courant, soutenu, littéraire ou technique), mais sans
inclure de noms propres ni de sigles.

Contraintes de sortie :
- Tu dois renvoyer STRICTEMENT un tableau JSON de chaînes de caractères.
- Format : ["mot1", "mot2", "mot3", ...]
- Le tableau doit contenir exactement ${count} mots.
- Chaque élément doit être un seul mot (pas d'expression, pas de groupe de mots).
- Pas de commentaire, pas de texte avant ou après, pas de clé supplémentaire.

Réponds uniquement avec ce tableau JSON.
`.trim();
    const raw = await complete(prompt);
    const json = extractJsonFromLlmOutput(raw);
    const wordsList = WordsListSchema.parse(json);
    return wordsList;
}

export async function generateNewWord(wordText) {
    const wordJsonSchema = z.toJSONSchema(WordSchema);
    const prompt = `
Tu es un lexicographe francophone qui prépare une base de données pour un jeu vidéo d’apprentissage du vocabulaire.

Pour le mot donné, tu dois produire UN SEUL objet JSON STRICT avec les clés suivantes :
${JSON.stringify(wordJsonSchema, null, 2)}

Contraintes importantes :
- La langue de travail est le français.
- "difficulty" DOIT être un entier entre 1 et 5.
- "register" DOIT être exactement l'une de ces valeurs : "familier", "courant", "soutenu", "litteraire", "technique".
- "origin" est une origine étymologique du mot (latin, grec, autre langue, etc) ou null si inconnue.
- les catégories sont des thèmes ou domaines d’usage du mot (exemples : "culinaire", "marine", "informatique", "littérature", "temps", "émotions", "caractère", "nature", "philosophie", "travail", etc)
- 2 ou 3 exemples sont suffisants.
- entre 0 et 2 confusions (mot souvent confondu avec) sont suffisantes, "nuance" doit tenir en une ou deux phrases courtes et expliquer clairement la différence de sens ou de registre.
- Il doit y avoir au moins UNE phrase dans "examples".
- Ne renvoie STRICTEMENT QUE l'objet JSON, sans texte avant ni après, sans commentaires.


Mot à traiter : "${wordText}"
`.trim();

    const raw = await complete(prompt);
    const json = extractJsonFromLlmOutput(raw);
    const word = WordSchema.parse(json);
    return word;
}
