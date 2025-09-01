// This serverless function acts as a secure proxy for the Gemini API.

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
    }

    // Access the API key from a secure environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not set. Please add GEMINI_API_KEY to your Vercel project environment variables.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Step 1: Generate the meme text using the text model
        const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        const textPrompt = `Generate a funny, concise, and clever meme caption in English for the topic "${topic}". It can be one or two lines.`;
        
        const textResult = await textModel.generateContent(textPrompt);
        const caption = textResult.response.text;
        
        // Step 2: Generate the meme image using the image model
        const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
        const imagePrompt = `A humorous, high-quality, modern internet meme image based on the topic: "${topic}". The image should have an empty space at the top and bottom for text. The style should be realistic and slightly absurd.`;

        const imageResult = await imageModel.generateContent(imagePrompt);
        const imageData = imageResult.response.image.base64;

        res.status(200).json({ imageData, caption });

    } catch (error) {
        console.error("Failed to generate content:", error);
        res.status(500).json({ error: 'Failed to generate meme. Please try again later.' });
    }
}
