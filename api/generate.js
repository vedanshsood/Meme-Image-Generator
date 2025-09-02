import Replicate from "replicate";

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
    const replicateApiKey = process.env.REPLICATE_API_TOKEN;

    if (!replicateApiKey) {
        return res.status(500).json({ error: 'Replicate API key is not set. Please add REPLICATE_API_TOKEN to your Vercel project environment variables.' });
    }

    const replicate = new Replicate({
        auth: replicateApiKey,
    });

    const maxRetries = 5;
    let retries = 0;
    let delay = 1000; // Start with 1 second delay

    while (retries < maxRetries) {
        try {
            const imagePrompt = `A high-quality, humorous meme image based on the topic: "${topic}". The image should have a witty, English-only caption on it. The text can be at the top or bottom of the image, or both.`;
            
            const output = await replicate.run(
                "stability-ai/stable-diffusion:ac732df8398141485ff76eb0a468e21a0c8411d73c2462804245781a9f5d46a8", {
                    input: {
                        prompt: imagePrompt
                    }
                }
            );

            if (!output || output.length === 0) {
                return res.status(500).json({ error: 'Replicate did not return an image.' });
            }

            const imageURL = output[0];

            // Fetch the image and convert to base64
            const imageResponse = await fetch(imageURL);
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageData = Buffer.from(imageBuffer).toString('base64');
            
            return res.status(200).json({ imageData });

        } catch (error) {
            console.error(`Replicate API error: ${error.message}`);
            if (error.message.includes('500') || error.message.includes('timeout')) {
                retries++;
                console.log(`Retrying... Attempt ${retries} of ${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                // If it's not a 500 or timeout error, we don't need to retry
                return res.status(500).json({ error: 'Failed to generate meme. Please try again later.' });
            }
        }
    }

    return res.status(500).json({ error: 'Failed to generate meme after multiple retries. Please try again later.' });
}
