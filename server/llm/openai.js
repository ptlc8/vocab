import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey });

let lastAPICallTime = 0;

export async function complete(input) {
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    while (Date.now() - lastAPICallTime < 1200) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    lastAPICallTime = Date.now();

    let response;
    do
        try {
            response = await client.responses.create({
                model: 'gpt-5-nano',
                input,
                store: true,
            });
        } catch (e) {
            console.error(e);
            continue;
        }
    while (false);
    return response.output_text;
}
