const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const MODEL_NAME = 'models/gemini-pro';

// const { ChatServiceClient } = require('@google-ai/generativelanguage');
// const { GoogleAuth } = require('google-auth-library');

// const client = new ChatServiceClient({
//   authClient: new GoogleAuth({
//     scopes: 'https://www.googleapis.com/auth/generative-language.chat',
//   }),
// });

app.use(express.json());

// === EXISTING AI Career Coach Chat Endpoint ===
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const prompt = `You are an expert AI career coach for CareerPivot. Help with:\n
- Resume optimization and ATS compliance\n
- Interview preparation and practice\n
- Career path planning and transitions\n
- Skill development recommendations\n
- Salary negotiation strategies\n\n
Be practical, actionable, and encouraging.\n\n
User question: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        const data = await response.json();
        if (data.error) return res.status(400).json({ error: 'API Error', details: data.error.message });
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/weekly-plan', async (req, res) => {
    try {
      const tasks = [
        "Complete UX case study",
        "Study system design basics",
        "Polish resume for internships"
      ];
  
      const prompt = `You are a productivity AI. The user has these tasks:\n${tasks.join('\n')}\n
  Generate a simple weekly schedule in this JSON format:\n
  [
    {
      "task": "Task name",
      "day": "Monday",
      "time": "9:00 AM – 10:00 AM",
      "priority": "High"
    }
  ]\n
  Spread tasks across the week in 1–2 hour blocks. Use plain days of the week, and balance workload.`;
  
      console.log("🟡 Sending prompt to Gemini...");
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 400 }
          })
        }
      );
  
      const data = await response.json();
      console.log("🟢 Gemini raw response:", data);
  
      if (data.error) {
        console.error("❌ Gemini error:", data.error);
        return res.status(400).json({ error: 'API Error', details: data.error.message });
      }
  
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      raw = raw.replace(/```json|```/g, "").trim();
      if (!raw.startsWith("[")) raw = "[" + raw;
  
      let parsedTasks = [];
  
      try {
        parsedTasks = JSON.parse(raw);
        if (!Array.isArray(parsedTasks)) throw new Error("Not an array");
      } catch (e) {
        const taskBlocks = raw.match(/\{[^{}]*\}/g);
        for (const b of taskBlocks || []) {
          try {
            parsedTasks.push(JSON.parse(b));
          } catch {
            console.warn("⚠️ Skipping malformed task:", b);
          }
        }
      }
  
      if (parsedTasks.length === 0) {
        console.error("❌ No valid tasks returned");
        return res.status(500).json({ error: "No valid tasks generated", raw });
      }
  
      res.json(parsedTasks);
    } catch (error) {
      console.error('❌ Planner error:', error);
      res.status(500).json({ error: 'Planner failure', message: error.message });
    }
  });

  app.post('/api/skill-gap', async (req, res) => {
    const { resumeSkills, targetSkills } = req.body;
  
    if (!resumeSkills || !targetSkills) {
      return res.status(400).json({ error: 'Missing resumeSkills or targetSkills.' });
    }
  
    const prompt = `
  You are a career advisor AI. Compare the following user resume skills with the target job requirements. Then respond with a JSON object like this:
  {
    "missingSkills": ["..."],
    "recommendations": ["..."]
  }
  
  Resume Skills:
  ${resumeSkills.join(', ')}
  
  Target Job Skills:
  ${targetSkills.join(', ')}
  
  Return only valid JSON. Do not explain.
    `.trim();
  
    try {
      const [response] = await client.chat({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }]
      });
  
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/{[\s\S]+}/);
      if (!match) throw new Error("No valid JSON block found in response.");
  
      const json = JSON.parse(match[0]);
      res.json(json);
    } catch (error) {
      console.error('Skill gap error:', error);
      res.status(500).json({ error: 'Error analyzing skills gap.' });
    }
  });

  app.post('/api/skill-recommendations', async (req, res) => {
    const { skills } = req.body;
  
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Missing or invalid skills array.' });
    }
  
    const prompt = `You're an AI career coach. For the following missing skills:\n\n${skills.join('\n')}\n\nGive concise, practical steps or resources (like project ideas, free courses, etc.) to learn each one.`;
  
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });
  
      const data = await response.json();
  
      if (data.error) {
        console.error("❌ Gemini API error:", data.error);
        return res.status(500).json({ error: data.error.message });
      }
  
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No output received.";
      res.json({ text });
    } catch (error) {
      console.error("❌ Request failed:", error);
      res.status(500).json({ error: 'Failed to fetch recommendations.' });
    }
  });  

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);
});