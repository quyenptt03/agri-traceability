import 'dotenv/config';
import { generatePrompt } from '../utils/promptGenerator';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeFarmEvents = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Corrected model name
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = await response.text();
  console.log('Response from Gemini:', responseText);
  return responseText;
};
export { analyzeFarmEvents };
