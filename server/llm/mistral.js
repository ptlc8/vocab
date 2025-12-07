import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey });

let lastAPICallTime = 0;

export async function complete(input) {
    if (!apiKey) {
        throw new Error('MISTRAL_API_KEY is not set in environment variables.');
    }
    while (Date.now() - lastAPICallTime < 1200) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    lastAPICallTime = Date.now();

    let chatResponse;
    do
        try {
            chatResponse = await client.chat.complete({
                model: 'mistral-large-latest',
                messages: [{ role: 'user', content: input }],
            });
        } catch (e) {
            console.error(e);
            continue;
        }
    while (false);
    return chatResponse.choices[0].message.content;
}
