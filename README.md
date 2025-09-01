# 🤖 AI Meme Generator
A fun, single-page web application that generates hilarious and unique memes from any user-provided topic. This project showcases a modern approach to web development by using multiple AI models to handle complex tasks, allowing for a creative and dynamic user experience.

## ✨ Features
* Topic-Based Generation: Simply enter a topic, and the app's AI models will generate a relevant, humorous meme image and caption.

* Dual-Model AI Architecture:
 
* An image generation model (imagen-3.0-generate-002) creates the visual content.

* A language model (gemini-2.5-flash-preview-05-20) writes the witty, English-only caption.

* Dynamic Text Placement: The caption is intelligently rendered on the image, wrapping text and resizing to ensure it always fits perfectly within the meme's boundaries.

* Modern UI/UX: Built with Tailwind CSS for a clean, responsive, and visually appealing dark theme.

* One-Click Download: Easily save your newly created meme to your device.

## 🚀 How to Use
1. Clone this repository or download the index.html file.

2. Open index.html in your web browser.

3. Type a topic into the input box.

4. Click "Generate Meme" and wait for the AI to work its magic.

5. Click "Download Meme" to save the image.

## ⚙️ Technical Details
This prototype is a single index.html file, containing all the HTML, CSS (via Tailwind CDN), and JavaScript. It uses fetch to make API calls to the Google Generative Language API for both image and text generation. The text is then programmatically drawn onto an HTML <canvas> element to be merged with the generated image.

This is the most up-to-date documentation. Feel free to use it as a starting point. Let me know if you need any changes!
