const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);
        console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
        
        const prompt = `You are an expert AI career coach for CareerPivot. Help with:
- Resume optimization and ATS compliance  
- Interview preparation and practice
- Career path planning and transitions
- Skill development recommendations
- Salary negotiation strategies

Be practical, actionable, and encouraging.

User question: ${message}`;

        console.log('Making request to Gemini API...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                }
            })
        });

        console.log('Gemini response status:', response.status);
        const data = await response.json();
        console.log('Gemini response received');
        
        // Check if response has error
        if (data.error) {
            console.error('Gemini API error:', data.error);
            return res.status(400).json({ 
                error: 'API Error', 
                details: data.error.message 
            });
        }
        
        res.json(data);
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- API Key loaded:', !!process.env.GEMINI_API_KEY);
});