// Resume Builder JavaScript
class ResumeBuilder {
    constructor() {
        this.workExperienceCount = 0;
        this.educationCount = 0;
        this.projectCount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
    }

    setupEventListeners() {
        // Add event listeners for all form inputs
        const inputs = document.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    updatePreview() {
        this.updatePersonalInfo();
        this.updateSummary();
        this.updateWorkExperience();
        this.updateEducation();
        this.updateSkills();
        this.updateProjects();
    }

    updatePersonalInfo() {
        const name = document.getElementById('fullName').value || 'Your Name';
        const email = document.getElementById('email').value || 'email@example.com';
        const phone = document.getElementById('phone').value || '(555) 123-4567';
        const location = document.getElementById('location').value || 'City, State';
        const linkedin = document.getElementById('linkedin').value || 'LinkedIn Profile';

        document.getElementById('previewName').textContent = name;
        document.getElementById('previewEmail').textContent = email;
        document.getElementById('previewPhone').textContent = phone;
        document.getElementById('previewLocation').textContent = location;
        document.getElementById('previewLinkedIn').textContent = linkedin;
    }

    updateSummary() {
        const summary = document.getElementById('summary').value || 'Your professional summary will appear here...';
        document.getElementById('previewSummary').textContent = summary;
    }

    updateWorkExperience() {
        const container = document.getElementById('previewExperience');
        const workItems = document.querySelectorAll('#workExperienceContainer .dynamic-item');
        
        if (workItems.length === 0) {
            container.innerHTML = 'Your work experience will appear here...';
            return;
        }

        let html = '';
        workItems.forEach(item => {
            const title = item.querySelector('[data-field="jobTitle"]').value;
            const company = item.querySelector('[data-field="company"]').value;
            const startDate = item.querySelector('[data-field="startDate"]').value;
            const endDate = item.querySelector('[data-field="endDate"]').value;
            const description = item.querySelector('[data-field="jobDescription"]').value;

            if (title || company) {
                html += `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div class="resume-item-title">${title}</div>
                            <div class="resume-item-date">${startDate} - ${endDate}</div>
                        </div>
                        <div class="resume-item-company">${company}</div>
                        <div class="resume-item-description">${this.formatDescription(description)}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || 'Your work experience will appear here...';
    }

    updateEducation() {
        const container = document.getElementById('previewEducation');
        const educationItems = document.querySelectorAll('#educationContainer .dynamic-item');
        
        if (educationItems.length === 0) {
            container.innerHTML = 'Your education will appear here...';
            return;
        }

        let html = '';
        educationItems.forEach(item => {
            const degree = item.querySelector('[data-field="degree"]').value;
            const school = item.querySelector('[data-field="school"]').value;
            const gradDate = item.querySelector('[data-field="graduationDate"]').value;
            const gpa = item.querySelector('[data-field="gpa"]').value;

            if (degree || school) {
                html += `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div class="resume-item-title">${degree}</div>
                            <div class="resume-item-date">${gradDate}</div>
                        </div>
                        <div class="resume-item-company">${school}</div>
                        ${gpa ? `<div class="resume-item-description">GPA: ${gpa}</div>` : ''}
                    </div>
                `;
            }
        });

        container.innerHTML = html || 'Your education will appear here...';
    }

    updateSkills() {
        const skills = document.getElementById('skills').value;
        const container = document.getElementById('previewSkills');
        
        if (!skills.trim()) {
            container.innerHTML = 'Your skills will appear here...';
            return;
        }

        const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        const skillsHtml = skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        container.innerHTML = `<div class="skills-list">${skillsHtml}</div>`;
    }

    updateProjects() {
        const container = document.getElementById('previewProjects');
        const projectItems = document.querySelectorAll('#projectsContainer .dynamic-item');
        
        if (projectItems.length === 0) {
            container.innerHTML = 'Your projects will appear here...';
            return;
        }

        let html = '';
        projectItems.forEach(item => {
            const title = item.querySelector('[data-field="projectTitle"]').value;
            const tech = item.querySelector('[data-field="technologies"]').value;
            const description = item.querySelector('[data-field="projectDescription"]').value;

            if (title) {
                html += `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div class="resume-item-title">${title}</div>
                        </div>
                        ${tech ? `<div class="resume-item-company">Technologies: ${tech}</div>` : ''}
                        <div class="resume-item-description">${this.formatDescription(description)}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || 'Your projects will appear here...';
    }

    formatDescription(description) {
        if (!description) return '';
        
        // Convert bullet points to HTML list
        const lines = description.split('\n').filter(line => line.trim());
        if (lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'))) {
            const listItems = lines.map(line => {
                const cleanLine = line.trim().replace(/^[•\-]\s*/, '');
                return cleanLine ? `<li>${cleanLine}</li>` : '';
            }).filter(item => item);
            return `<ul>${listItems.join('')}</ul>`;
        }
        
        return description;
    }
}

// Global functions for dynamic content
function addWorkExperience() {
    const container = document.getElementById('workExperienceContainer');
    const index = resumeBuilder.workExperienceCount++;
    
    const html = `
        <div class="dynamic-item">
            <button class="remove-button" onclick="removeItem(this)">×</button>
            <div class="form-group">
                <label class="form-label">Job Title</label>
                <input type="text" class="form-input" data-field="jobTitle" placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="form-input" data-field="company" placeholder="Company Name">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="text" class="form-input" data-field="startDate" placeholder="Jan 2023">
                </div>
                <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="text" class="form-input" data-field="endDate" placeholder="Present">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" data-field="jobDescription" placeholder="• Developed and maintained web applications using React and Node.js
• Collaborated with cross-functional teams to deliver high-quality software
• Improved application performance by 30% through code optimization"></textarea>
                <button class="ai-enhance-button" onclick="enhanceWithAI('experience', this)">✨ AI Enhance</button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    addEventListenersToNewItem(container.lastElementChild);
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const index = resumeBuilder.educationCount++;
    
    const html = `
        <div class="dynamic-item">
            <button class="remove-button" onclick="removeItem(this)">×</button>
            <div class="form-group">
                <label class="form-label">Degree</label>
                <input type="text" class="form-input" data-field="degree" placeholder="Bachelor of Science in Computer Science">
            </div>
            <div class="form-group">
                <label class="form-label">School</label>
                <input type="text" class="form-input" data-field="school" placeholder="University Name">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label class="form-label">Graduation Date</label>
                    <input type="text" class="form-input" data-field="graduationDate" placeholder="May 2023">
                </div>
                <div class="form-group">
                    <label class="form-label">GPA (Optional)</label>
                    <input type="text" class="form-input" data-field="gpa" placeholder="3.8">
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    addEventListenersToNewItem(container.lastElementChild);
}

function addProject() {
    const container = document.getElementById('projectsContainer');
    const index = resumeBuilder.projectCount++;
    
    const html = `
        <div class="dynamic-item">
            <button class="remove-button" onclick="removeItem(this)">×</button>
            <div class="form-group">
                <label class="form-label">Project Title</label>
                <input type="text" class="form-input" data-field="projectTitle" placeholder="E-commerce Web Application">
            </div>
            <div class="form-group">
                <label class="form-label">Technologies</label>
                <input type="text" class="form-input" data-field="technologies" placeholder="React, Node.js, MongoDB, AWS">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" data-field="projectDescription" placeholder="• Built a full-stack e-commerce platform with user authentication
• Implemented payment processing using Stripe API
• Deployed on AWS with CI/CD pipeline"></textarea>
                <button class="ai-enhance-button" onclick="enhanceWithAI('project', this)">✨ AI Enhance</button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    addEventListenersToNewItem(container.lastElementChild);
}

function removeItem(button) {
    button.closest('.dynamic-item').remove();
    resumeBuilder.updatePreview();
}

function addEventListenersToNewItem(item) {
    const inputs = item.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => resumeBuilder.updatePreview());
    });
}

// AI Enhancement Functions
async function enhanceWithAI(type, element) {
    const button = element || event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Enhancing...';
    button.disabled = true;

    try {
        let prompt = '';
        let currentContent = '';

        switch (type) {
            case 'summary':
                currentContent = document.getElementById('summary').value;
                prompt = `Enhance this professional summary for a resume. Make it more compelling, ATS-friendly, and impactful. Keep it 2-3 sentences and under 100 words:

${currentContent}

Enhanced summary:`;
                break;

            case 'skills':
                currentContent = document.getElementById('skills').value;
                prompt = `Optimize this skills list for ATS and relevance. Add important related skills and organize them better. Keep as comma-separated list:

${currentContent}

Optimized skills:`;
                break;

            case 'experience':
                const container = button.closest('.dynamic-item');
                const jobTitle = container.querySelector('[data-field="jobTitle"]').value;
                const company = container.querySelector('[data-field="company"]').value;
                currentContent = container.querySelector('[data-field="jobDescription"]').value;
                prompt = `Enhance this job description for a ${jobTitle} role at ${company}. Make it more impactful with quantified achievements and strong action verbs. Use bullet points:

${currentContent}

Enhanced description:`;
                break;

            case 'project':
                const projectContainer = button.closest('.dynamic-item');
                const projectTitle = projectContainer.querySelector('[data-field="projectTitle"]').value;
                const technologies = projectContainer.querySelector('[data-field="technologies"]').value;
                currentContent = projectContainer.querySelector('[data-field="projectDescription"]').value;
                prompt = `Enhance this project description for ${projectTitle} using ${technologies}. Make it more impressive and technical. Use bullet points:

${currentContent}

Enhanced description:`;
                break;
        }

        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const enhancedText = data.candidates[0].content.parts[0].text;
            
            // Update the appropriate field
            switch (type) {
                case 'summary':
                    document.getElementById('summary').value = enhancedText;
                    break;
                case 'skills':
                    document.getElementById('skills').value = enhancedText;
                    break;
                case 'experience':
                    button.closest('.dynamic-item').querySelector('[data-field="jobDescription"]').value = enhancedText;
                    break;
                case 'project':
                    button.closest('.dynamic-item').querySelector('[data-field="projectDescription"]').value = enhancedText;
                    break;
            }
            
            resumeBuilder.updatePreview();
        }
        
    } catch (error) {
        console.error('AI Enhancement Error:', error);
        alert('Sorry, AI enhancement is not available right now. Please make sure the backend server is running.');
    }

    button.textContent = originalText;
    button.disabled = false;
}

// AI Resume Analysis
async function analyzeResume() {
    const modal = document.getElementById('aiAnalysisModal');
    const content = document.getElementById('analysisContent');
    
    modal.style.display = 'block';
    content.innerHTML = '<div class="loading-spinner">🤖 Analyzing your resume...</div>';

    try {
        // Gather resume data
        const resumeData = {
            name: document.getElementById('fullName').value,
            summary: document.getElementById('summary').value,
            skills: document.getElementById('skills').value,
            experience: getWorkExperienceData(),
            education: getEducationData(),
            projects: getProjectsData()
        };

        const prompt = `Analyze this resume and provide detailed feedback on:
1. ATS Optimization
2. Content Quality
3. Missing Elements
4. Formatting Suggestions
5. Overall Score (1-10)

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please provide specific, actionable advice:`;

        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const analysis = data.candidates[0].content.parts[0].text;
            content.innerHTML = `<div class="analysis-result">${formatAnalysis(analysis)}</div>`;
        } else {
            content.innerHTML = '<div class="error">Sorry, analysis failed. Please try again.</div>';
        }
        
    } catch (error) {
        console.error('Analysis Error:', error);
        content.innerHTML = '<div class="error">Sorry, analysis is not available. Please make sure the backend server is running.</div>';
    }
}

function getWorkExperienceData() {
    const items = document.querySelectorAll('#workExperienceContainer .dynamic-item');
    return Array.from(items).map(item => ({
        title: item.querySelector('[data-field="jobTitle"]').value,
        company: item.querySelector('[data-field="company"]').value,
        startDate: item.querySelector('[data-field="startDate"]').value,
        endDate: item.querySelector('[data-field="endDate"]').value,
        description: item.querySelector('[data-field="jobDescription"]').value
    }));
}

function getEducationData() {
    const items = document.querySelectorAll('#educationContainer .dynamic-item');
    return Array.from(items).map(item => ({
        degree: item.querySelector('[data-field="degree"]').value,
        school: item.querySelector('[data-field="school"]').value,
        graduationDate: item.querySelector('[data-field="graduationDate"]').value,
        gpa: item.querySelector('[data-field="gpa"]').value
    }));
}

function getProjectsData() {
    const items = document.querySelectorAll('#projectsContainer .dynamic-item');
    return Array.from(items).map(item => ({
        title: item.querySelector('[data-field="projectTitle"]').value,
        technologies: item.querySelector('[data-field="technologies"]').value,
        description: item.querySelector('[data-field="projectDescription"]').value
    }));
}

function formatAnalysis(analysis) {
    // Convert markdown-style formatting to HTML
    return analysis
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// Download Functions
function downloadPDF() {
    alert('PDF download would be implemented with a library like jsPDF or html2pdf. For now, you can print this page as PDF using Ctrl+P or Cmd+P.');
}

function downloadWord() {
    // Create a simple Word document structure
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    const docContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Resume</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .resume-name { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px; }
                .resume-contact { text-align: center; margin-bottom: 20px; color: #666; }
                .resume-section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #ccc; }
                .resume-item { margin-bottom: 15px; }
                .resume-item-title { font-weight: bold; }
                .resume-item-date { float: right; font-style: italic; color: #666; }
                .resume-item-company { color: #666; font-style: italic; }
                .skills-list { display: flex; flex-wrap: wrap; }
                .skill-tag { background: #f0f0f0; padding: 2px 8px; margin: 2px; border-radius: 4px; }
            </style>
        </head>
        <body>${resumeContent}</body>
        </html>
    `;

    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.doc';
    a.click();
    URL.revokeObjectURL(url);
}

// Modal Functions
function closeModal() {
    document.getElementById('aiAnalysisModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('aiAnalysisModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize the resume builder
let resumeBuilder;
document.addEventListener('DOMContentLoaded', function() {
    resumeBuilder = new ResumeBuilder();
});