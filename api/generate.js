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

    // Access the API key from a secure environment variable
    const hfApiKey = process.env.HF_API_TOKEN;

    if (!hfApiKey) {
        return res.status(500).json({ error: 'Hugging Face API key is not set. Please add HF_API_TOKEN to your Vercel project environment variables.' });
    }

    const hf = new HfInference(hfApiKey);

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const imagePrompt = `A high-quality, humorous meme image based on the topic: "${topic}". The image should have a witty, English-only caption on it. The text can be at the top or bottom of the image, or both.`;
            
            const imageBlob = await hf.textToImage({
                model: "stabilityai/stable-diffusion-2-1",
                inputs: imagePrompt,
                parameters: {
                    height: 512,
                    width: 512,
                },
            });

            const buffer = await imageBlob.arrayBuffer();
            const imageData = Buffer.from(buffer).toString('base64');

            return res.status(200).json({ imageData });

        } catch (error) {
            console.error("Failed to generate content:", error);
            if (error.message.includes('An error occurred while fetching the blob') && retries < maxRetries - 1) {
                retries++;
                console.log(`Retrying... Attempt ${retries} of ${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
            } else {
                return res.status(500).json({ error: 'Failed to generate meme. Please try again later.' });
            }
        }
    }

    return res.status(500).json({ error: 'Failed to generate meme after multiple retries. Please try again later.' });
}
