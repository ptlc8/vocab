import { complete as mistral } from './mistral.js';
import { complete as openai } from './openai.js';

export function complete(input) {
    const useMistral = process.env.LLM_PROVIDER === 'mistral';
    if (useMistral) {
        return mistral(input);
    } else {
        return openai(input);
    }
}
