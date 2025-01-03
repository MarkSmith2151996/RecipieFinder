import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize express app
const app = express();
const port = 3000;

// Allow CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Set up static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname)));

// Root route serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const OPENAI_API_KEY = 'your-api-key-here';

// API route to generate a recipe based on ingredients
app.post('/api/generate-recipe', async (req, res) => {
    const { ingredients } = req.body;
    
    try {
        const prompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}. Format the response as follows:
        Recipe Name: [name]
        Ingredients: [list]
        Instructions: [numbered steps]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a professional chef.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the response
        const recipeName = content.match(/Recipe Name: (.*)/i)?.[1] || 'Untitled Recipe';
        const ingredients = content.match(/Ingredients:([\s\S]*?)Instructions:/i)?.[1] || '';
        const instructions = content.match(/Instructions:([\s\S]*$)/i)?.[1] || '';

        res.json({ 
            recipeName, 
            ingredients: ingredients.trim(),
            instructions: instructions.trim() 
        });
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).send('Error generating recipe');
    }
});

// API route to generate an image based on the recipe name
app.post('/api/generate-image', async (req, res) => {
    const { recipeName } = req.body;
    
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: `Professional food photography of ${recipeName}, appetizing presentation, high resolution`,
                n: 1,
                size: '1024x1024'
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        res.json({ imageUrl: data.data[0].url });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
