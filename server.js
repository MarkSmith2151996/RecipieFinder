const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.json());

const OPENAI_API_KEY = 'your-openai-api-key';
const DALL_E_API_KEY = 'your-dalle-api-key';

// Endpoint to generate recipe
app.post('/api/generate-recipe', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 500
            })
        });
        const data = await response.json();
        const recipeName = data.choices[0].text.split('\n')[0];
        const recipeSteps = data.choices[0].text.replace(recipeName, '').trim();
        res.json({ recipeName, recipeSteps });
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).send('Error generating recipe');
    }
});

// Endpoint to generate image
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DALL_E_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: '1024x1024'
            })
        });
        const data = await response.json();
        const imageUrl = data.data[0].url;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
