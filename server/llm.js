import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

var lastAPICallTime = 0;

export async function complete(question) {
    while (Date.now() - lastAPICallTime < 1200) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    lastAPICallTime = Date.now();

    var chatResponse;
    do
        try {
            chatResponse = await client.chat.complete({
                model: 'mistral-large-latest',
                messages: [{ role: 'user', content: question }],
            });
        } catch (e) {
            continue;
        }
    while (false);

    return chatResponse.choices[0].message.content;
}
