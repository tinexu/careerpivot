# Overview:
Elevatr is a smart career development assistant that helps users pivot into new industries by identifying the gaps between their current skills and their target roles. Built as a full-stack web application, Elevatr uses AI to analyze a user’s background and recommend concrete next steps—like projects, learning goals, or job matches—based on real-world job data and semantic matching.

# AI Components:
In addition to a built-in chatbot specializing in career inquiries and assistance, Elevatr has much AI running in the background:
- Skill Extraction: Users input their current skills and experience. The app parses this input into structured data using prompt-based LLM calls or rule-based tokenization.
- Job Trend Matching: Elevatr scrapes live job postings, extracts required qualifications, and embeds them using sentence similarity models to build a searchable knowledge base.
- Gap Analysis: It compares the user’s profile with target job vectors using embedding-based similarity scoring and returns ranked gaps.
- Generative Suggestions: Once the gaps are identified, Elevatr prompts an LLM to generate personalized project ideas or action steps to help the user close them.

# Tech Stack:
- Frontend: HTML/CSS, JavaScript
- Backend: Node.js, Express.js
- Data: Got job postings using the JSearch API via RapidAPI
- LLM Integration: Google's Gemini powers the chatbot
- Deployment: Vercel
