import {genkit} from 'genkit';
import {googleAI} from 'AIzaSyBMSjcFbZVnor60xcHqRocrKnYmcwJFt3o';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
