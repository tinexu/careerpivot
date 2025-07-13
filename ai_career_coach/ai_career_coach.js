// AI Career Coach functionality for CareerPivot
class AICareerCoach {
    constructor() {
        this.currentSection = 'chat';
        this.chatMessages = [];
        this.init();
    }

    init() {
        // Check authentication
        if (!window.auth || !window.auth.isAuthenticated()) {
            window.location.href = '../login_and_signup/login.html';
            return;
        }

        this.initializeNavigation();
        this.initializeChat();
        this.initializeResumeBuilder();
        this.initializeInterviewPrep();
        this.loadUserData();
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.coach-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }
    
    switchSection(section) {
        // Update nav
        document.querySelectorAll('.coach-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
        // Update content
        document.querySelectorAll('.content-section').forEach(contentSection => {
            contentSection.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
    
        this.currentSection = section;
    }

    initializeChat() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatInput || !sendBtn) return;

        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        });

        // Send message on Enter (but not Shift+Enter)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
    }

    convertMarkdownToHtml(text) {
        return text
            // Bold: **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic: *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Lists: - item or * item
            .replace(/^[\-\*]\s(.+)$/gm, '<li>$1</li>')
            // Wrap lists
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            // Headers: ### text
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>');
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const message = chatInput.value.trim();
    
        if (!message) return;
    
        this.addMessage(message, 'user');
        chatInput.value = '';
        this.showTypingIndicator();
    
        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
    
            if (!response.ok) throw new Error('Gemini API error');
    
            const data = await response.json();
            this.hideTypingIndicator();
    
            const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiResponse) {
                this.addMessage(aiResponse, 'ai');
            } else {
                throw new Error('No valid AI response');
            }
        } catch (error) {
            console.warn('Falling back to heuristic AI:', error);
            this.hideTypingIndicator();
            const fallback = this.generateAIResponse(message);
            this.addMessage(fallback, 'ai');
        }
    }    
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar ai">AI</div>
            <div class="message-content">
                <div style="display: flex; gap: 4px; align-items: center;">
                    <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.6); border-radius: 50%; animation: pulse 1.4s infinite;"></div>
                    <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.6); border-radius: 50%; animation: pulse 1.4s infinite 0.2s;"></div>
                    <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.6); border-radius: 50%; animation: pulse 1.4s infinite 0.4s;"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
      

    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Convert markdown for AI messages
        const processedContent = sender === 'ai' ? this.convertMarkdownToHtml(content) : content;
        
        messageDiv.innerHTML = `
            <div class="message-avatar ${sender}">${sender === 'ai' ? 'AI' : 'You'}</div>
            <div class="message-content">${processedContent}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-indicator show';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar ai">AI</div>
            <div class="message-content">
                <div class="typing-indicator show">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateAIResponse(userMessage) {
        const responses = {
            resume: [
                "I'd be happy to help optimize your resume! Focus on quantifiable achievements and use strong action verbs. What specific role are you targeting?",
                "Great question about resumes! Make sure to tailor your resume for each application. Would you like me to review a specific section?",
                "For resume optimization, I recommend the STAR method (Situation, Task, Action, Result) for describing your experiences. What industry are you in?",
                "Your resume should tell a compelling story. Start with a strong summary, then showcase your achievements with metrics. Need help with any particular section?",
                "Consider using keywords from the job description in your resume. This helps with ATS systems. What type of positions are you applying for?"
            ],
            interview: [
                "Interview preparation is crucial! Practice the STAR method for behavioral questions and research the company thoroughly. What type of interview are you preparing for?",
                "Let's work on your interview skills! Remember to prepare specific examples that showcase your achievements. What's your biggest concern about the upcoming interview?",
                "Great question about interviews! Confidence comes from preparation. Practice your answers out loud and prepare thoughtful questions for the interviewer.",
                "For technical interviews, practice coding problems and be ready to explain your thought process. For behavioral interviews, prepare stories that highlight your skills.",
                "Remember to research the company culture and values. This helps you ask meaningful questions and show genuine interest. When is your interview scheduled?"
            ],
            career: [
                "Career planning is an exciting journey! Let's identify your strengths and interests first. What field are you most passionate about?",
                "I can help you map out a career path! Consider your current skills, desired outcomes, and market trends. What's your ultimate career goal?",
                "Career transitions can be challenging but rewarding. Let's break down the steps needed to reach your goals. What skills do you want to develop?",
                "Think about where you want to be in 2-3 years. We can work backwards to create a roadmap. What's driving your desire for career change?",
                "Consider both your passions and market opportunities. The sweet spot is where your skills meet market demand. What industries interest you most?"
            ],
            skills: [
                "Skill development is key to career growth! What specific skills are you looking to develop? I can suggest learning paths and resources.",
                "Focus on both hard and soft skills. Technical skills get you interviews, but soft skills help you succeed in the role. What's your current skill gap?",
                "Consider learning skills that are in high demand in your target field. Would you like me to analyze the job market for your area of interest?",
                "Online learning platforms like Coursera, LinkedIn Learning, and industry-specific courses can be great. What's your preferred learning style?"
            ],
            networking: [
                "Networking is incredibly powerful for career growth! Start with your existing connections and expand gradually. What's your networking goal?",
                "LinkedIn is a great platform for professional networking. Make sure your profile is complete and start engaging with industry content.",
                "Consider attending industry events, meetups, and conferences. Virtual events are also great opportunities. What industry are you in?",
                "Don't forget about informational interviews - many professionals are happy to share their experiences. Who would you like to connect with?"
            ],
            salary: [
                "Salary negotiation requires research and preparation. Know your market value and be ready to articulate your worth. What role are you negotiating for?",
                "Research salary ranges on sites like Glassdoor, PayScale, and industry reports. Consider the total compensation package, not just salary.",
                "Timing is important in salary discussions. Wait for the right moment and present your case with data and achievements.",
                "Remember that negotiation isn't just about money - consider benefits, flexibility, professional development, and growth opportunities."
            ],
            default: [
                "That's a great question! I'm here to help with resume building, interview preparation, and career planning. How can I assist you today?",
                "I'd love to help you with that! As your AI career coach, I can provide guidance on resumes, interviews, and career development. What's most important to you right now?",
                "Thanks for reaching out! I specialize in career guidance and can help you succeed. What specific challenge are you facing in your career journey?",
                "I'm here to support your career goals! Whether it's resume optimization, interview prep, or career planning, I'm ready to help. What would you like to focus on?",
                "Every career journey is unique! I can help you navigate yours with personalized advice and strategies. What's your biggest career question right now?"
            ]
        };

        const message = userMessage.toLowerCase();
        let category = 'default';
        
        if (message.includes('resume') || message.includes('cv')) category = 'resume';
        else if (message.includes('interview') || message.includes('preparation')) category = 'interview';
        else if (message.includes('career') || message.includes('job') || message.includes('transition')) category = 'career';
        else if (message.includes('skill') || message.includes('learn') || message.includes('development')) category = 'skills';
        else if (message.includes('network') || message.includes('connect') || message.includes('linkedin')) category = 'networking';
        else if (message.includes('salary') || message.includes('pay') || message.includes('negotiat')) category = 'salary';
        
        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    initializeResumeBuilder() {
        const inputs = ['fullName', 'email', 'phone', 'location', 'summary', 'skills'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updateResumePreview());
            }
        });

        // Initialize with placeholder data
        setTimeout(() => this.updateResumePreview(), 100);
    }

    updateResumePreview() {
        const fullName = document.getElementById('fullName')?.value || 'Your Name';
        const email = document.getElementById('email')?.value || 'email@example.com';
        const phone = document.getElementById('phone')?.value || '(555) 123-4567';
        const location = document.getElementById('location')?.value || 'City, State';
        const summary = document.getElementById('summary')?.value || 'Your professional summary will appear here...';
        const skills = document.getElementById('skills')?.value || 'Your skills will appear here...';

        // Update preview
        const preview = document.getElementById('resumePreview');
        if (preview) {
            const nameElement = preview.querySelector('.resume-name');
            if (nameElement) {
                nameElement.textContent = fullName;
            }
            
            const contact = preview.querySelector('.resume-contact');
            if (contact) {
                contact.innerHTML = `
                    <span>${email}</span>
                    <span>•</span>
                    <span>${phone}</span>
                    <span>•</span>
                    <span>${location}</span>
                `;
            }

            const summaryElements = preview.querySelectorAll('.resume-item-description');
            if (summaryElements.length > 0) {
                summaryElements[0].textContent = summary;
            }

            if (summaryElements.length > 1) {
                summaryElements[summaryElements.length - 1].textContent = skills;
            }
        }
    }

    initializeInterviewPrep() {
        // Add event listeners for practice buttons
        const practiceButtons = document.querySelectorAll('.practice-btn');
        practiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePracticeClick(e.target);
            });
        });

        // Add auto-save for answer inputs
        const answerInputs = document.querySelectorAll('.answer-input');
        answerInputs.forEach(input => {
            input.addEventListener('input', () => {
                // Auto-save functionality could go here
                this.saveAnswer(input);
            });
        });
    }

    handlePracticeClick(button) {
        const buttonText = button.textContent;
        
        if (buttonText.includes('Mock Interview')) {
            this.startMockInterview();
        } else if (buttonText.includes('AI Feedback')) {
            this.provideAIFeedback();
        }
    }

    startMockInterview() {
        // Create mock interview modal or redirect
        this.showFeatureModal('Mock Interview', 'Starting a comprehensive mock interview session with AI-powered feedback and analysis.');
    }

    provideAIFeedback() {
        // Analyze answers and provide feedback
        this.showFeatureModal('AI Feedback', 'Analyzing your answers and providing personalized feedback on content, structure, and delivery.');
    }

    saveAnswer(input) {
        // Save answer to local storage or send to backend
        const questionCard = input.closest('.question-card');
        const question = questionCard?.querySelector('.question')?.textContent;
        const answer = input.value;
        
        if (question && answer) {
            // Save to localStorage for demo purposes
            const answers = JSON.parse(localStorage.getItem('interviewAnswers') || '{}');
            answers[question] = answer;
            localStorage.setItem('interviewAnswers', JSON.stringify(answers));
        }
    }

    loadUserData() {
        // Load user data if available from auth system
        if (window.auth && window.auth.isAuthenticated()) {
            const user = window.auth.getCurrentUser();
            if (user) {
                const fullNameInput = document.getElementById('fullName');
                const emailInput = document.getElementById('email');
                
                if (fullNameInput && user.firstName && user.lastName) {
                    fullNameInput.value = `${user.firstName} ${user.lastName}`;
                }
                
                if (emailInput && user.email) {
                    emailInput.value = user.email;
                }
                
                // Update resume preview with user data
                setTimeout(() => this.updateResumePreview(), 200);
            }
        }

        // Load saved interview answers
        this.loadSavedAnswers();
    }

    loadSavedAnswers() {
        const answers = JSON.parse(localStorage.getItem('interviewAnswers') || '{}');
        const answerInputs = document.querySelectorAll('.answer-input');
        
        answerInputs.forEach(input => {
            const questionCard = input.closest('.question-card');
            const question = questionCard?.querySelector('.question')?.textContent;
            
            if (question && answers[question]) {
                input.value = answers[question];
            }
        });
    }

    showFeatureModal(title, description) {
        // Create and show feature modal
        const modal = document.createElement('div');
        modal.className = 'feature-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 ${title}</h3>
                    <button class="modal-close" onclick="this.closest('.feature-modal').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>${title}</strong> is ready to launch!</p>
                    <p>${description}</p>
                    <div class="feature-preview">
                        <div class="preview-item">✅ AI-powered analysis</div>
                        <div class="preview-item">✅ Personalized feedback</div>
                        <div class="preview-item">✅ Performance tracking</div>
                        <div class="preview-item">✅ Industry best practices</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.feature-modal').remove()">
                        Maybe Later
                    </button>
                    <button class="btn-primary" onclick="this.closest('.feature-modal').remove()">
                        Start Now
                    </button>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
            }
            
            .modal-content {
                position: relative;
                background: rgba(10, 10, 10, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                max-width: 500px;
                margin: 20px;
                backdrop-filter: blur(20px);
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px 24px 0;
            }
            
            .modal-header h3 {
                font-size: 20px;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .modal-body {
                padding: 20px 24px;
            }
            
            .modal-body p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 12px;
                line-height: 1.5;
            }
            
            .modal-body p:last-child {
                margin-bottom: 0;
            }
            
            .feature-preview {
                margin-top: 16px;
                padding: 16px;
                background: rgba(231, 121, 249, 0.05);
                border: 1px solid rgba(231, 121, 249, 0.2);
                border-radius: 8px;
            }
            
            .preview-item {
                color: #06D6A0;
                font-size: 14px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .preview-item:last-child {
                margin-bottom: 0;
            }
            
            .modal-footer {
                padding: 0 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .modal-footer .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            
            .modal-footer .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .modal-footer .btn-primary {
                background: linear-gradient(90deg, #E879F9, #60A5FA);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                font-weight: 500;
            }
            
            .modal-footer .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(231, 121, 249, 0.3);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Close on escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                style.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Export resume functionality
    exportResume() {
        const resumeContent = document.getElementById('resumePreview');
        if (!resumeContent) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${document.getElementById('fullName')?.value || 'Resume'}</title>
                <style>
                    body { font-family: 'Georgia', serif; margin: 0; padding: 20px; }
                    .resume-document { max-width: 800px; margin: 0 auto; }
                    .resume-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #E879F9; }
                    .resume-name { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #333; }
                    .resume-contact { font-size: 14px; color: #666; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
                    .resume-section { margin-bottom: 25px; }
                    .resume-section-title { font-size: 18px; font-weight: bold; color: #E879F9; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .resume-item { margin-bottom: 15px; }
                    .resume-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
                    .resume-item-title { font-weight: bold; color: #333; }
                    .resume-item-date { font-style: italic; color: #666; font-size: 14px; }
                    .resume-item-subtitle { font-style: italic; color: #666; margin-bottom: 8px; }
                    .resume-item-description { color: #555; font-size: 14px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${resumeContent.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait a bit for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            // Clear form inputs
            const inputs = document.querySelectorAll('.form-input, .answer-input');
            inputs.forEach(input => {
                input.value = '';
            });

            // Clear localStorage
            localStorage.removeItem('interviewAnswers');

            // Update resume preview
            this.updateResumePreview();

            // Show success message
            this.showSuccessMessage('All data cleared successfully!');
        }
    }

    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(90deg, #06D6A0, #06D6A0);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        toast.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 3000);
    }
}

// Add experience function (global scope for onclick)
function addExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item';
    newExperience.style.marginTop = '16px';
    newExperience.innerHTML = `
        <input type="text" class="form-input" placeholder="Job Title" style="margin-bottom: 8px;">
        <input type="text" class="form-input" placeholder="Company Name" style="margin-bottom: 8px;">
        <input type="text" class="form-input" placeholder="Duration (e.g., 2020-2023)" style="margin-bottom: 8px;">
        <textarea class="form-input" placeholder="Describe your achievements and responsibilities..." rows="3" style="margin-bottom: 8px;"></textarea>
        <button type="button" onclick="this.parentElement.remove()" style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 4px; padding: 6px 12px; color: #FF6B6B; font-size: 12px; cursor: pointer; transition: all 0.3s ease;">
            Remove Experience
        </button>
    `;
    container.appendChild(newExperience);

    // Add hover effect to remove button
    const removeBtn = newExperience.querySelector('button');
    removeBtn.addEventListener('mouseenter', () => {
        removeBtn.style.background = 'rgba(255, 107, 107, 0.2)';
    });
    removeBtn.addEventListener('mouseleave', () => {
        removeBtn.style.background = 'rgba(255, 107, 107, 0.1)';
    });
}

// Function to load external HTML
async function loadHTMLContent(url, targetId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Add this to your ai_career_coach.js file
async function loadGapAnalyzer() {
    const gapSection = document.getElementById('gap-analyzer-section');
    
    // Only load if not already loaded
    if (!gapSection.hasAttribute('data-loaded')) {
        try {
            const response = await fetch('career_gap_analyzer.html');
            const html = await response.text();
            gapSection.innerHTML = html;
            gapSection.setAttribute('data-loaded', 'true');
            
            // Initialize gap analyzer functionality
            if (typeof initializeGapAnalyzer === 'function') {
                initializeGapAnalyzer();
            }
        } catch (error) {
            console.error('Error loading gap analyzer:', error);
            gapSection.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Error loading Career Gap Analyzer. Please refresh and try again.</div>';
        }
    }
}

// === Skill Gap Analyzer ===
async function analyzeSkillGap() {
    const resumeSkillsInput = document.getElementById('resumeSkillsInput');
    const targetSkillsInput = document.getElementById('targetSkillsInput');
    const outputEl = document.getElementById('skillGapResults');
  
    const resumeSkills = resumeSkillsInput.value.split(',').map(s => s.trim());
    const targetSkills = targetSkillsInput.value.split(',').map(s => s.trim());
  
    if (!resumeSkills.length || !targetSkills.length) {
      outputEl.innerHTML = `<p class="error">Please enter both resume and target job skills.</p>`;
      return;
    }
  
    outputEl.innerHTML = `<p>Analyzing...</p>`;
  
    try {
      const response = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeSkills, targetSkills })
      });
  
      if (!response.ok) throw new Error("Server returned error");
  
      const result = await response.json();
  
      const missing = result.missingSkills?.length
        ? `<ul>${result.missingSkills.map(skill => `<li>🔍 ${skill}</li>`).join('')}</ul>`
        : `<p>No missing skills detected ✅</p>`;
  
      const recommendations = result.recommendations?.length
        ? `<ul>${result.recommendations.map(rec => `<li>📌 ${rec}</li>`).join('')}</ul>`
        : `<p>No recommendations available.</p>`;
  
      outputEl.innerHTML = `
        <h4>Missing Skills</h4>
        ${missing}
        <h4>Recommendations</h4>
        ${recommendations}
      `;
    } catch (err) {
      console.error("Skill gap fetch error:", err);
      outputEl.innerHTML = `<p class="error">Error analyzing skill gap. Try again later.</p>`;
    }
  }  

// Update your showSection function or add this
function showGapAnalyzer() {
    // Hide other sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show gap analyzer section
    const gapSection = document.getElementById('gap-analyzer-section');
    gapSection.style.display = 'block';
    
    // Load the content if not already loaded
    if (!gapSection.hasAttribute('data-loaded')) {
        loadHTMLContent('career_gap_analyzer.html', 'gap-analyzer-section');
        gapSection.setAttribute('data-loaded', 'true');
    }
    
    // Update navigation
    document.querySelectorAll('.coach-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Global utility functions
function exportResume() {
    if (window.aiCoach) {
        window.aiCoach.exportResume();
    }
}

function clearAllData() {
    if (window.aiCoach) {
        window.aiCoach.clearAllData();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.aiCoach = new AICareerCoach();
});

// Make functions available globally
window.addExperience = addExperience;
window.exportResume = exportResume;
window.clearAllData = clearAllData;