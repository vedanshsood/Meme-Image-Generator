import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
    }

    // Access the API keys from a secure environment variable
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const hfApiKey = process.env.HF_API_TOKEN;

    if (!geminiApiKey || !hfApiKey) {
        return res.status(500).json({ error: 'One or more API keys are not set. Please add GEMINI_API_KEY and HF_API_TOKEN to your Vercel project environment variables.' });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const hf = new HfInference(hfApiKey);

    try {
        // Step 1: Generate the meme text using the Gemini model
        const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const textPrompt = `Generate a funny, concise, and clever meme caption in English for the topic "${topic}". It can be one or two lines.`;
        
        const textResult = await textModel.generateContent(textPrompt);
        const caption = textResult.response.text;
        
        // Step 2: Generate the meme image using the Hugging Face model
        const imagePrompt = `A humorous, high-quality, modern internet meme image based on the topic: "${topic}".`;
        
        const imageBlob = await hf.textToImage({
            model: "black-forest-labs/FLUX.1-dev",
            inputs: imagePrompt,
            parameters: {
                height: 512,
                width: 512,
            },
        });

        // Convert the image blob to a base64 string
        const buffer = await imageBlob.arrayBuffer();
        const imageData = Buffer.from(buffer).toString('base64');

        res.status(200).json({ imageData, caption });

    } catch (error) {
        console.error("Failed to generate content:", error);
        res.status(500).json({ error: 'Failed to generate meme. Please try again later.' });
    }
}
