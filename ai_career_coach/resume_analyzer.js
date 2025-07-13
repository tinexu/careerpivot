// Career Gap Analyzer JavaScript
class CareerGapAnalyzer {
    constructor() {
        this.currentSkills = [];
        this.targetRequirements = [];
        this.gapAnalysis = {};
        this.currentStep = 1;
        this.init();
    }

    init() {
        this.updateProgressIndicator();
        this.bindEventListeners();
    }

    bindEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', this.handleTabSwitch.bind(this));
        });

        // Industry selection
        document.querySelectorAll('.industry-card').forEach(card => {
            card.addEventListener('click', this.handleIndustrySelection.bind(this));
        });
    }

    handleTabSwitch(e) {
        const tabName = e.target.getAttribute('data-tab');

        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to clicked tab
        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    handleIndustrySelection(e) {
        const industry = e.currentTarget.getAttribute('data-industry');

        // Remove active from all cards
        document.querySelectorAll('.industry-card').forEach(card => card.classList.remove('active'));
        // Add active to clicked card
        e.currentTarget.classList.add('active');

        this.analyzeIndustryTrends(industry);
    }

    // Step 1: Analyze Current Skills from Resume
    analyzeCurrentSkills() {
        const resumeData = this.getResumeData();

        if (!resumeData) {
            this.showNotification('No resume data found. Please fill out the Resume Builder first.', 'warning');
            return;
        }

        this.showAnalysisLoading('resumeStatus');

        // Simulate API call delay
        setTimeout(() => {
            const skills = this.extractSkillsFromResume(resumeData);
            this.currentSkills = skills;
            this.displayCurrentSkills(skills);
            this.updateStep(2);
        }, 1500);
    }

    getResumeData() {
        // Try to get data from localStorage first (saved resume)
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            return JSON.parse(savedData);
        }

        // Try to get data from current form fields
        const currentData = {
            fullName: document.getElementById('fullName')?.value || '',
            summary: document.getElementById('summary')?.value || '',
            skills: document.getElementById('skills')?.value || '',
            experiences: []
        };

        // Get experience data
        const experienceItems = document.querySelectorAll('.experience-item');
        experienceItems.forEach(item => {
            const inputs = item.querySelectorAll('input, textarea');
            if (inputs.length >= 4 && inputs[0].value.trim()) {
                currentData.experiences.push({
                    jobTitle: inputs[0].value,
                    company: inputs[1].value,
                    duration: inputs[2].value,
                    description: inputs[3].value
                });
            }
        });

        return currentData.fullName || currentData.summary ? currentData : null;
    }

    extractSkillsFromResume(resumeData) {
        const skills = {
            technical: [],
            professional: [],
            industry: [],
            experienceLevel: 'Entry Level'
        };

        // Extract from skills section
        if (resumeData.skills) {
            const skillsList = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);

            // Categorize skills (simple categorization)
            skillsList.forEach(skill => {
                const lowerSkill = skill.toLowerCase();

                // Technical skills keywords
                if (this.isTechnicalSkill(lowerSkill)) {
                    skills.technical.push(skill);
                } else if (this.isProfessionalSkill(lowerSkill)) {
                    skills.professional.push(skill);
                } else {
                    skills.technical.push(skill); // Default to technical
                }
            });
        }

        // Extract from job descriptions
        if (resumeData.experiences) {
            resumeData.experiences.forEach(exp => {
                if (exp.description) {
                    const extractedSkills = this.extractSkillsFromText(exp.description);
                    extractedSkills.forEach(skill => {
                        if (!skills.technical.includes(skill) && !skills.professional.includes(skill)) {
                            if (this.isTechnicalSkill(skill.toLowerCase())) {
                                skills.technical.push(skill);
                            } else {
                                skills.professional.push(skill);
                            }
                        }
                    });
                }

                // Extract industry experience
                if (exp.company) {
                    const industry = this.inferIndustryFromCompany(exp.company);
                    if (industry && !skills.industry.includes(industry)) {
                        skills.industry.push(industry);
                    }
                }
            });

            // Determine experience level
            skills.experienceLevel = this.calculateExperienceLevel(resumeData.experiences);
        }

        return skills;
    }

    isTechnicalSkill(skill) {
        const technicalKeywords = [
            'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css',
            'aws', 'docker', 'kubernetes', 'git', 'api', 'database', 'mongodb',
            'postgresql', 'mysql', 'typescript', 'angular', 'vue', 'php', 'ruby',
            'c++', 'c#', '.net', 'swift', 'kotlin', 'flutter', 'android', 'ios',
            'machine learning', 'ai', 'data science', 'analytics', 'tableau',
            'power bi', 'excel', 'figma', 'photoshop', 'illustrator', 'sketch'
        ];

        return technicalKeywords.some(keyword => skill.includes(keyword));
    }

    isProfessionalSkill(skill) {
        const professionalKeywords = [
            'leadership', 'management', 'communication', 'teamwork', 'project management',
            'problem solving', 'analytical', 'creative', 'strategic', 'planning',
            'organization', 'time management', 'negotiation', 'presentation',
            'customer service', 'sales', 'marketing', 'writing', 'research'
        ];

        return professionalKeywords.some(keyword => skill.includes(keyword));
    }

    extractSkillsFromText(text) {
        const skills = [];
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
            'Docker', 'Git', 'API', 'Database', 'MongoDB', 'PostgreSQL',
            'Project Management', 'Leadership', 'Communication', 'Analytics',
            'Machine Learning', 'Data Science', 'Agile', 'Scrum', 'DevOps'
        ];

        commonSkills.forEach(skill => {
            if (text.toLowerCase().includes(skill.toLowerCase())) {
                skills.push(skill);
            }
        });

        return skills;
    }

    inferIndustryFromCompany(company) {
        const industryKeywords = {
            'Technology': ['tech', 'software', 'digital', 'startup', 'app', 'platform'],
            'Finance': ['bank', 'financial', 'investment', 'capital', 'trading'],
            'Healthcare': ['health', 'medical', 'hospital', 'pharma', 'biotech'],
            'E-commerce': ['commerce', 'retail', 'marketplace', 'shopping'],
            'Consulting': ['consulting', 'advisory', 'strategy', 'solutions']
        };

        const lowerCompany = company.toLowerCase();
        for (const [industry, keywords] of Object.entries(industryKeywords)) {
            if (keywords.some(keyword => lowerCompany.includes(keyword))) {
                return industry;
            }
        }

        return 'General';
    }

    calculateExperienceLevel(experiences) {
        const totalYears = experiences.reduce((total, exp) => {
            const years = this.extractYearsFromDuration(exp.duration);
            return total + years;
        }, 0);

        if (totalYears < 2) return 'Entry Level';
        if (totalYears < 5) return 'Mid Level';
        if (totalYears < 10) return 'Senior Level';
        return 'Executive Level';
    }

    extractYearsFromDuration(duration) {
        if (!duration) return 0;

        const yearMatch = duration.match(/(\d+)\s*year/i);
        if (yearMatch) return parseInt(yearMatch[1]);

        // Simple calculation for date ranges
        const dateRangeMatch = duration.match(/(\d{4})\s*-\s*(\d{4}|present)/i);
        if (dateRangeMatch) {
            const startYear = parseInt(dateRangeMatch[1]);
            const endYear = dateRangeMatch[2].toLowerCase() === 'present' ?
                new Date().getFullYear() : parseInt(dateRangeMatch[2]);
            return Math.max(0, endYear - startYear);
        }

        return 1; // Default to 1 year
    }

    displayCurrentSkills(skills) {
        // Hide loading and show analysis
        document.getElementById('resumeStatus').classList.add('hidden');
        document.getElementById('skillsAnalysis').classList.remove('hidden');

        // Display technical skills
        this.displaySkillTags('technicalSkills', skills.technical);

        // Display professional skills
        this.displaySkillTags('professionalSkills', skills.professional);

        // Display industry experience
        this.displaySkillTags('industryExperience', skills.industry);

        // Display experience summary
        const experienceSummary = document.getElementById('experienceSummary');
        experienceSummary.innerHTML = `
            <div class="experience-level">${skills.experienceLevel}</div>
            <div class="experience-details">
                ${skills.technical.length + skills.professional.length} total skills identified
            </div>
        `;
    }

    displaySkillTags(containerId, skillArray) {
        const container = document.getElementById(containerId);
        container.innerHTML = skillArray.map(skill =>
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    }

    renderSkillList(skills) {
        const container = document.getElementById("skillsOutput");
        if (!container) return;
      
        container.innerHTML = skills.map(skill => `
          <div class="skill-pill">
            <svg class="icon-check" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M20.285 6.708l-11.25 11.25-5.535-5.536 1.415-1.414 4.12 4.12 9.835-9.836z"/>
            </svg>
            ${skill}
          </div>
        `).join('');
    }      

    async analyzeTargetJob() {
        console.log("🚀 analyzeTargetJob triggered");

        const mustHave = document.getElementById("mustHaveSkills");
        if (!mustHave || mustHave.innerText.trim() === "") {
            console.warn("🟡 Injecting fallback #mustHaveSkills manually");
            mustHave.innerText = `
  - JavaScript
  - React
  - REST APIs
  - Node.js
  `;
        }


        try {
            const mustHaveEl = await waitForElementWithText('#mustHaveSkills', 4000);
            const text = mustHaveEl.innerText.trim();

            const skillLines = text.split('\n').filter(line => line.trim().length > 0);
            console.log("✅ Parsed skills:", skillLines);

            this.currentSkills = skillLines;
            const skillText = document.getElementById("mustHaveSkills").innerText;
            const skills = skillText
                .split('\n')
                .map(s => s.replace(/^-/, '').trim())
                .filter(Boolean);

            this.renderSkillList(skills);

        } catch (err) {
            console.error(err);
        }
    }

    analyzeJobRequirements(jobTitle, company, jobDescription) {
        const requirements = {
            mustHave: [],
            niceToHave: [],
            experience: '',
            responsibilities: []
        };

        // Analyze based on job title
        const titleRequirements = this.getRequirementsByTitle(jobTitle);
        requirements.mustHave = titleRequirements.mustHave;
        requirements.niceToHave = titleRequirements.niceToHave;
        requirements.experience = titleRequirements.experience;

        // If job description is provided, extract additional requirements
        if (jobDescription) {
            const extractedReqs = this.extractRequirementsFromDescription(jobDescription);
            requirements.mustHave = [...new Set([...requirements.mustHave, ...extractedReqs.mustHave])];
            requirements.niceToHave = [...new Set([...requirements.niceToHave, ...extractedReqs.niceToHave])];
            requirements.responsibilities = extractedReqs.responsibilities;
        } else {
            requirements.responsibilities = titleRequirements.responsibilities;
        }

        return requirements;
    }

    async generateSkillRecommendations() {
        console.log("🚀 generateSkillRecommendations triggered");
      
        const mustHaveEl = document.getElementById("mustHaveSkills");
        if (!mustHaveEl) {
          console.warn("⚠️ No #mustHaveSkills element found.");
          return;
        }
      
        const mustHaveText = mustHaveEl.innerText;
        console.log("📋 mustHaveSkills text:", mustHaveText);
      
        const jobSkills = mustHaveText
          .split('\n')
          .map(s => s.replace(/^-/, '').trim().toLowerCase())
          .filter(Boolean);
      
        const currentSkills = (this.currentSkills || []).map(s => s.toLowerCase());
        const missingSkills = jobSkills.filter(skill => !currentSkills.includes(skill));
        console.log("🔍 Missing skills:", missingSkills);
      
        const output = document.getElementById("recommendationsOutput");
        if (!output) {
          console.warn("⚠️ No #recommendationsOutput element found.");
          return;
        }
      
        if (missingSkills.length === 0) {
          output.innerHTML = "<p>🎉 You already meet all the required skills!</p>";
          return;
        }
      
        const prompt = `You're an AI career coach. For the following missing skills:\n\n${missingSkills.join('\n')}\n\nGive concise, practical steps or resources (like project ideas, free courses, etc.) to learn each one.`;
        console.log("📝 Prompt to Gemini:", prompt);
      
        try {
            const res = await fetch('http://localhost:3001/api/skill-recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills: missingSkills })
            });              
      
            const data = await res.json();
            if (data.error) {
              console.error("❌ Server error:", data.error);
              output.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
              return;
            }
            
            output.innerHTML = `<pre>${data.recommendations}</pre>`;            
          console.log("📨 Gemini response:", data);

          const recContainer = document.getElementById("recommendationsOutput");
if (recContainer) {
  recContainer.innerHTML = `<pre style="white-space:pre-wrap;">${data.text}</pre>`;
} else {
  console.warn("⚠️ #recommendationsOutput not found.");
}

      
          if (data.error) {
            console.error("❌ Gemini error:", data.error);
            output.innerHTML = `<p style="color:red;">❌ ${data.error.message}</p>`;
            return;
          }
      
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "⚠️ No recommendations returned.";
          output.innerHTML = `<pre>${text}</pre>`;
        } catch (err) {
          console.error("❌ Request failed:", err);
          output.innerHTML = "<p style='color:red;'>❌ Error fetching recommendations.</p>";
        }
    }      

    getRequirementsByTitle(jobTitle) {
        const title = jobTitle.toLowerCase();

        // Common job requirements database
        const jobRequirements = {
            'software engineer': {
                mustHave: ['JavaScript', 'Python', 'Git', 'API Development', 'Database Design'],
                niceToHave: ['React', 'Node.js', 'AWS', 'Docker', 'TypeScript'],
                experience: '2-5 years of software development experience',
                responsibilities: [
                    'Develop and maintain web applications',
                    'Collaborate with cross-functional teams',
                    'Write clean, maintainable code',
                    'Participate in code reviews'
                ]
            },
            'product manager': {
                mustHave: ['Product Strategy', 'Market Research', 'Analytics', 'Project Management', 'Communication'],
                niceToHave: ['SQL', 'A/B Testing', 'Wireframing', 'Agile', 'User Research'],
                experience: '3-7 years of product management experience',
                responsibilities: [
                    'Define product roadmap and strategy',
                    'Gather and prioritize requirements',
                    'Work with engineering and design teams',
                    'Analyze user feedback and metrics'
                ]
            },
            'data scientist': {
                mustHave: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Analysis'],
                niceToHave: ['R', 'TensorFlow', 'Tableau', 'AWS', 'Deep Learning'],
                experience: '2-5 years of data science experience',
                responsibilities: [
                    'Develop predictive models',
                    'Analyze large datasets',
                    'Present insights to stakeholders',
                    'Collaborate with business teams'
                ]
            },
            'marketing manager': {
                mustHave: ['Digital Marketing', 'Campaign Management', 'Analytics', 'Content Strategy', 'SEO'],
                niceToHave: ['Google Ads', 'Social Media Marketing', 'Email Marketing', 'CRM', 'A/B Testing'],
                experience: '3-6 years of marketing experience',
                responsibilities: [
                    'Develop marketing strategies',
                    'Manage campaigns across channels',
                    'Analyze marketing performance',
                    'Collaborate with sales team'
                ]
            }
        };

        // Find matching job requirements
        for (const [key, reqs] of Object.entries(jobRequirements)) {
            if (title.includes(key)) {
                return reqs;
            }
        }

        // Default generic requirements
        return {
            mustHave: ['Communication', 'Problem Solving', 'Teamwork', 'Time Management'],
            niceToHave: ['Leadership', 'Project Management', 'Analytics'],
            experience: '2-4 years of relevant experience',
            responsibilities: [
                'Execute assigned tasks and projects',
                'Collaborate with team members',
                'Contribute to team goals',
                'Continuous learning and improvement'
            ]
        };
    }

    extractRequirementsFromDescription(description) {
        const requirements = {
            mustHave: [],
            niceToHave: [],
            responsibilities: []
        };

        // Extract skills from job description
        const skillKeywords = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
            'Docker', 'Git', 'API', 'Machine Learning', 'Data Science',
            'Project Management', 'Leadership', 'Communication', 'Analytics'
        ];

        skillKeywords.forEach(skill => {
            if (description.toLowerCase().includes(skill.toLowerCase())) {
                if (description.toLowerCase().includes('required') ||
                    description.toLowerCase().includes('must have')) {
                    requirements.mustHave.push(skill);
                } else {
                    requirements.niceToHave.push(skill);
                }
            }
        });

        // Extract responsibilities (simplified)
        const sentences = description.split('.').filter(s => s.trim().length > 10);
        requirements.responsibilities = sentences.slice(0, 4).map(s => s.trim());

        return requirements;
    }

    displayTargetRequirements(requirements) {
        const targetContainer = document.getElementById('targetAnalysis');

        // Inject the required HTML so the elements exist
        targetContainer.innerHTML = `
            <div class="requirement-category">
                <h4>Must-Have Skills</h4>
                <div class="requirement-tags" id="mustHaveSkills"></div>
            </div>
    
            <div class="requirement-category">
                <h4>Nice-to-Have Skills</h4>
                <div class="requirement-tags" id="niceToHaveSkills"></div>
            </div>
    
            <div class="requirement-category">
                <h4>Experience Requirements</h4>
                <div id="experienceReqs"></div>
            </div>
    
            <div class="requirement-category">
                <h4>Key Responsibilities</h4>
                <div id="keyResponsibilities"></div>
            </div>
        `;

        // ✅ Now the elements exist — safe to inject data
        this.displayRequirementTags('mustHaveSkills', requirements.mustHave);
        this.displayRequirementTags('niceToHaveSkills', requirements.niceToHave);
        document.getElementById('experienceReqs').textContent = requirements.experience;

        const responsibilitiesList = requirements.responsibilities.map(resp =>
            `<li>${resp}</li>`
        ).join('');
        document.getElementById('keyResponsibilities').innerHTML = `<ul>${responsibilitiesList}</ul>`;
    }

    displayRequirementTags(containerId, reqArray) {
        console.log(`Trying to populate containerId="${containerId}" with:`, reqArray);
        const container = document.getElementById(containerId);
        console.log("Resolved DOM element:", container);
        if (!container) {
            console.error(`❌ Element with ID '${containerId}' not found in DOM.`);
            throw new Error(`Element with ID '${containerId}' not found`);
        }

        container.innerHTML = reqArray.map(req =>
            `<span class="requirement-tag">${req}</span>`
        ).join('');
    }


    // Step 3: Perform Gap Analysis
    performGapAnalysis() {
        if (!this.currentSkills ||
            !Array.isArray(this.currentSkills.technical) ||
            !Array.isArray(this.currentSkills.professional)) {
            console.warn("⚠️ currentSkills not properly initialized:", this.currentSkills);
            return;
        }

        if (!this.targetRequirements ||
            !Array.isArray(this.targetRequirements.mustHave) ||
            !Array.isArray(this.targetRequirements.niceToHave)) {
            console.warn("⚠️ targetRequirements not properly initialized:", this.targetRequirements);
            return;
        }

        const userSkills = [...this.currentSkills.technical, ...this.currentSkills.professional];
        const requiredSkills = [...this.targetRequirements.mustHave, ...this.targetRequirements.niceToHave];

        const analysis = {
            strengths: [],
            gaps: [],
            missing: [],
            matchScore: 0
        };

        // Find strengths (skills user has that are required)
        analysis.strengths = userSkills.filter(skill =>
            requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(req.toLowerCase()))
        );

        // Find missing skills (required skills user doesn't have)
        analysis.missing = this.targetRequirements.mustHave.filter(req =>
            !userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(skill.toLowerCase()))
        );

        // Find gaps (nice-to-have skills user doesn't have)
        analysis.gaps = this.targetRequirements.niceToHave.filter(req =>
            !userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(skill.toLowerCase()))
        );

        // Calculate match score
        const totalRequired = this.targetRequirements.mustHave.length;
        const matchedRequired = totalRequired - analysis.missing.length;
        analysis.matchScore = totalRequired > 0 ? Math.round((matchedRequired / totalRequired) * 100) : 0;

        this.gapAnalysis = analysis;
        this.displayGapAnalysis(analysis);
        this.generateRecommendations();
        this.updateStep(4);
    }

    displayGapAnalysis(analysis) {
        document.getElementById('gapAnalysis').classList.remove('hidden');

        // Update match score
        document.getElementById('matchScore').textContent = `${analysis.matchScore}%`;
        document.getElementById('skillsMatch').textContent =
            `${analysis.strengths.length}/${this.targetRequirements.mustHave.length}`;
        document.getElementById('experienceMatch').textContent = this.currentSkills.experienceLevel;

        // Update progress fill
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${analysis.matchScore}%`;
        }

        // Display strengths
        this.displayGapItems('strengthsList', analysis.strengths, 'strength');
        document.getElementById('strengthsCount').textContent = analysis.strengths.length;

        // Display gaps
        this.displayGapItems('gapsList', analysis.gaps, 'gap');
        document.getElementById('gapsCount').textContent = analysis.gaps.length;

        // Display missing skills
        this.displayGapItems('missingList', analysis.missing, 'missing');
        document.getElementById('missingCount').textContent = analysis.missing.length;
    }

    displayGapItems(containerId, items, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = items.map(item =>
            `<span class="gap-item ${type}">${item}</span>`
        ).join('');
    }

    // Step 4: Generate Recommendations
    generateRecommendations() {
        const recommendations = {
            learningPath: this.generateLearningPath(),
            projects: this.generateProjectRecommendations(),
            quickWins: this.generateQuickWins(),
            longTermGoals: this.generateLongTermGoals()
        };

        this.displayRecommendations(recommendations);
    }

    generateLearningPath() {
        const missingSkills = this.gapAnalysis.missing;
        const gapSkills = this.gapAnalysis.gaps.slice(0, 3); // Top 3 gaps

        const learningItems = [];

        // High priority: Missing must-have skills
        missingSkills.forEach((skill, index) => {
            learningItems.push({
                title: `Learn ${skill}`,
                duration: this.getSkillLearningDuration(skill),
                description: this.getSkillLearningDescription(skill),
                priority: 'high'
            });
        });

        // Medium priority: Nice-to-have skills
        gapSkills.forEach(skill => {
            learningItems.push({
                title: `Develop ${skill}`,
                duration: this.getSkillLearningDuration(skill),
                description: this.getSkillLearningDescription(skill),
                priority: 'medium'
            });
        });

        return learningItems;
    }

    getSkillLearningDuration(skill) {
        const durations = {
            'JavaScript': '4-6 weeks',
            'Python': '6-8 weeks',
            'React': '3-4 weeks',
            'SQL': '2-3 weeks',
            'Project Management': '2-4 weeks',
            'Machine Learning': '8-12 weeks',
            'AWS': '4-6 weeks'
        };

        return durations[skill] || '2-4 weeks';
    }

    getSkillLearningDescription(skill) {
        const descriptions = {
            'JavaScript': 'Complete online courses and build interactive web projects',
            'Python': 'Learn fundamentals through coding bootcamp or online platform',
            'React': 'Build component-based applications and understand state management',
            'SQL': 'Practice database queries and learn data manipulation',
            'Project Management': 'Get certified in Agile/Scrum methodologies',
            'Machine Learning': 'Complete ML specialization and work on real datasets',
            'AWS': 'Gain hands-on experience with cloud services and get certified'
        };

        return descriptions[skill] || `Build proficiency through online courses and practical projects`;
    }

    generateProjectRecommendations() {
        const projects = [];
        const missingSkills = this.gapAnalysis.missing;

        // Generate project recommendations based on missing skills
        if (missingSkills.includes('JavaScript') || missingSkills.includes('React')) {
            projects.push({
                title: 'Personal Portfolio Website',
                description: 'Build a responsive portfolio website showcasing your projects and skills',
                skills: ['JavaScript', 'HTML', 'CSS', 'React'],
                icon: '🌐'
            });
        }

        if (missingSkills.includes('Python') || missingSkills.includes('Machine Learning')) {
            projects.push({
                title: 'Data Analysis Project',
                description: 'Analyze a public dataset and create visualizations to tell a story',
                skills: ['Python', 'Pandas', 'Data Visualization', 'Analytics'],
                icon: '📊'
            });
        }

        if (missingSkills.includes('Project Management')) {
            projects.push({
                title: 'Open Source Contribution',
                description: 'Contribute to an open-source project to demonstrate collaboration skills',
                skills: ['Git', 'Collaboration', 'Documentation', 'Code Review'],
                icon: '🤝'
            });
        }

        // Default projects if no specific skills identified
        if (projects.length === 0) {
            projects.push({
                title: 'Industry Case Study',
                description: 'Research and present a solution to a real industry problem',
                skills: ['Research', 'Analysis', 'Presentation', 'Problem Solving'],
                icon: '🔍'
            });
        }

        return projects;
    }

    generateQuickWins() {
        return [
            'Update LinkedIn profile with target job keywords',
            'Follow industry leaders and companies on social media',
            'Join relevant professional communities and forums',
            'Start a learning schedule for priority skills',
            'Network with professionals in your target role'
        ];
    }

    generateLongTermGoals() {
        return [
            {
                title: 'Skill Mastery',
                description: 'Achieve proficiency in all must-have skills',
                icon: '🎯'
            },
            {
                title: 'Portfolio Development',
                description: 'Build 3-5 projects demonstrating key competencies',
                icon: '💼'
            },
            {
                title: 'Professional Network',
                description: 'Connect with 50+ professionals in target industry',
                icon: '🤝'
            },
            {
                title: 'Certification',
                description: 'Obtain relevant industry certifications',
                icon: '🏆'
            }
        ];
    }

    displayRecommendations(recommendations) {
        document.getElementById('recommendations').classList.remove('hidden');

        // Display learning path
        this.displayLearningTimeline(recommendations.learningPath);

        // Display projects
        this.displayProjectsGrid(recommendations.projects);

        // Display quick wins
        this.displayQuickWins(recommendations.quickWins);

        // Display long-term goals
        this.displayLongTermGoals(recommendations.longTermGoals);
    }

    displayLearningTimeline(learningPath) {
        const container = document.getElementById('learningTimeline');
        container.innerHTML = learningPath.map(item => `
            <div class="timeline-item">
                <div class="timeline-header">
                    <h4 class="timeline-title">${item.title}</h4>
                    <span class="timeline-duration">${item.duration}</span>
                </div>
                <p class="timeline-description">${item.description}</p>
            </div>
        `).join('');
    }

    displayProjectsGrid(projects) {
        const container = document.getElementById('projectsGrid');
        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-icon">${project.icon}</div>
                    <h4 class="project-title">${project.title}</h4>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-skills">
                    ${project.skills.map(skill => `<span class="project-skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    displayQuickWins(quickWins) {
        const container = document.getElementById('quickWinsList');
        container.innerHTML = quickWins.map((win, index) => `
            <div class="quick-win-item">
                <div class="quick-win-icon">${index + 1}</div>
                <span class="quick-win-text">${win}</span>
            </div>
        `).join('');
    }

    displayLongTermGoals(goals) {
        const container = document.getElementById('longtermGoals');
        container.innerHTML = goals.map(goal => `
            <div class="longterm-goal">
                <div class="goal-icon">${goal.icon}</div>
                <h4 class="goal-title">${goal.title}</h4>
                <p class="goal-description">${goal.description}</p>
            </div>
        `).join('');
    }

    // Industry Analysis
    analyzeIndustryTrends(industry) {
        this.showAnalysisLoading('targetAnalysis');

        setTimeout(() => {
            const industryRequirements = this.getIndustryRequirements(industry);
            this.targetRequirements = industryRequirements;
            this.displayTargetRequirements(industryRequirements);
            this.performGapAnalysis();
            this.updateStep(3);
        }, 1500);
    }

    getIndustryRequirements(industry) {
        const industryData = {
            'technology': {
                mustHave: ['Programming', 'Problem Solving', 'Git', 'API Development', 'Database'],
                niceToHave: ['Cloud Computing', 'DevOps', 'Machine Learning', 'Mobile Development'],
                experience: '2-5 years in technology sector',
                responsibilities: [
                    'Develop and maintain software applications',
                    'Collaborate in agile development teams',
                    'Participate in code reviews and testing',
                    'Stay updated with latest technologies'
                ]
            },
            'finance': {
                mustHave: ['Financial Analysis', 'Excel', 'Risk Management', 'Compliance', 'Analytics'],
                niceToHave: ['Python', 'SQL', 'Bloomberg Terminal', 'Financial Modeling'],
                experience: '2-4 years in financial services',
                responsibilities: [
                    'Analyze financial data and market trends',
                    'Prepare financial reports and presentations',
                    'Ensure regulatory compliance',
                    'Support investment decisions'
                ]
            },
            'healthcare': {
                mustHave: ['Healthcare Knowledge', 'Compliance', 'Patient Care', 'Medical Terminology'],
                niceToHave: ['Electronic Health Records', 'HIPAA', 'Quality Improvement'],
                experience: '1-3 years in healthcare setting',
                responsibilities: [
                    'Provide quality patient care services',
                    'Maintain accurate medical records',
                    'Follow healthcare protocols and procedures',
                    'Collaborate with healthcare teams'
                ]
            },
            'marketing': {
                mustHave: ['Digital Marketing', 'Content Creation', 'Analytics', 'Campaign Management'],
                niceToHave: ['SEO', 'Social Media', 'Email Marketing', 'Marketing Automation'],
                experience: '2-4 years in marketing roles',
                responsibilities: [
                    'Develop and execute marketing campaigns',
                    'Analyze campaign performance metrics',
                    'Create engaging content for multiple channels',
                    'Collaborate with sales and product teams'
                ]
            },
            'education': {
                mustHave: ['Teaching', 'Curriculum Development', 'Student Assessment', 'Communication'],
                niceToHave: ['Educational Technology', 'Learning Management Systems', 'Data Analysis'],
                experience: '1-3 years in educational environment',
                responsibilities: [
                    'Develop and deliver educational content',
                    'Assess student progress and performance',
                    'Create inclusive learning environments',
                    'Collaborate with educational teams'
                ]
            },
            'consulting': {
                mustHave: ['Problem Solving', 'Analysis', 'Presentation', 'Client Management'],
                niceToHave: ['Project Management', 'Industry Expertise', 'Change Management'],
                experience: '2-5 years in consulting or related field',
                responsibilities: [
                    'Analyze client business challenges',
                    'Develop strategic recommendations',
                    'Present findings to stakeholders',
                    'Manage client relationships'
                ]
            }
        };

        return industryData[industry] || industryData['technology'];
    }

    // Utility Functions
    updateStep(step) {
        this.currentStep = step;
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        const progressFill = document.querySelector('#progressFill');
        const progressSteps = document.querySelectorAll('.progress-step');

        if (progressFill) {
            progressFill.style.width = `${(this.currentStep / 4) * 100}%`;
        }

        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    showAnalysisLoading(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="loading-spinner">
                <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
                <div>Analyzing your data...</div>
            </div>
        `;
        container.classList.remove('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // Export Functions
    exportActionPlan() {
        const actionPlan = this.generateActionPlanDocument();
        this.downloadAsHTML(actionPlan, 'career-action-plan.html');
    }

    generateActionPlanDocument() {
        const currentDate = new Date().toLocaleDateString();

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Development Action Plan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .header { text-align: center; margin-bottom: 40px; }
        .section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .skill-category { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
        .skill-tag { display: inline-block; background: #ecf0f1; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
        .timeline-item { margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .project-card { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #9b59b6; }
        .quick-win { padding: 10px; margin: 5px 0; background: #d5edf8; border-radius: 4px; }
        .match-score { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Career Development Action Plan</h1>
        <p>Generated on: ${currentDate}</p>
        <div class="match-score">Current Match Score: ${this.gapAnalysis.matchScore || 0}%</div>
    </div>

    <div class="section">
        <h2>📊 Current Skills Assessment</h2>
        <div class="skills-grid">
            <div class="skill-category">
                <h3>🛠️ Technical Skills</h3>
                ${this.currentSkills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="skill-category">
                <h3>💼 Professional Skills</h3>
                ${this.currentSkills.professional.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="skill-category">
                <h3>🏢 Industry Experience</h3>
                ${this.currentSkills.industry.map(exp => `<span class="skill-tag">${exp}</span>`).join('')}
            </div>
        </div>
        <p><strong>Experience Level:</strong> ${this.currentSkills.experienceLevel}</p>
    </div>

    <div class="section">
        <h2>🎯 Target Role Requirements</h2>
        <h3>Must-Have Skills:</h3>
        <p>${this.targetRequirements.mustHave.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</p>
        
        <h3>Nice-to-Have Skills:</h3>
        <p>${this.targetRequirements.niceToHave.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</p>
        
        <h3>Experience Requirements:</h3>
        <p>${this.targetRequirements.experience}</p>
    </div>

    <div class="section">
        <h2>📈 Skills Gap Analysis</h2>
        <div class="skills-grid">
            <div class="skill-category">
                <h3>✅ Your Strengths (${this.gapAnalysis.strengths.length})</h3>
                ${this.gapAnalysis.strengths.map(skill => `<span class="skill-tag" style="background: #d5edf8;">${skill}</span>`).join('')}
            </div>
            <div class="skill-category">
                <h3>⚠️ Skills to Develop (${this.gapAnalysis.gaps.length})</h3>
                ${this.gapAnalysis.gaps.map(skill => `<span class="skill-tag" style="background: #fff2e0;">${skill}</span>`).join('')}
            </div>
            <div class="skill-category">
                <h3>❌ Missing Skills (${this.gapAnalysis.missing.length})</h3>
                ${this.gapAnalysis.missing.map(skill => `<span class="skill-tag" style="background: #ffe6e6;">${skill}</span>`).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📚 Learning Path</h2>
        ${this.generateLearningPath().map(item => `
            <div class="timeline-item">
                <h4>${item.title}</h4>
                <p><strong>Duration:</strong> ${item.duration}</p>
                <p>${item.description}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🛠️ Recommended Projects</h2>
        ${this.generateProjectRecommendations().map(project => `
            <div class="project-card">
                <h4>${project.icon} ${project.title}</h4>
                <p>${project.description}</p>
                <p><strong>Skills to develop:</strong> ${project.skills.join(', ')}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>⚡ Quick Wins (30 days)</h2>
        ${this.generateQuickWins().map(win => `<div class="quick-win">• ${win}</div>`).join('')}
    </div>

    <div class="section">
        <h2>🎯 Long-term Goals (3-6 months)</h2>
        ${this.generateLongTermGoals().map(goal => `
            <div class="project-card">
                <h4>${goal.icon} ${goal.title}</h4>
                <p>${goal.description}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📅 Action Timeline</h2>
        <h3>Week 1-2: Foundation</h3>
        <ul>
            <li>Update LinkedIn profile and resume</li>
            <li>Start learning highest priority missing skill</li>
            <li>Join relevant professional communities</li>
        </ul>
        
        <h3>Week 3-8: Skill Building</h3>
        <ul>
            <li>Complete online courses for priority skills</li>
            <li>Start first recommended project</li>
            <li>Network with industry professionals</li>
        </ul>
        
        <h3>Week 9-16: Portfolio Development</h3>
        <ul>
            <li>Complete 2-3 showcase projects</li>
            <li>Obtain relevant certifications</li>
            <li>Begin job search and applications</li>
        </ul>
        
        <h3>Week 17+: Job Search</h3>
        <ul>
            <li>Apply to target positions</li>
            <li>Prepare for technical interviews</li>
            <li>Continue skill development</li>
        </ul>
    </div>

    <div class="section">
        <h2>📋 Progress Tracking</h2>
        <p><strong>Next Review Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        <h3>Weekly Checklist:</h3>
        <ul>
            <li>☐ Dedicated learning time (minimum 5 hours)</li>
            <li>☐ Project progress update</li>
            <li>☐ Networking activity (1 new connection)</li>
            <li>☐ Skill practice and application</li>
            <li>☐ Industry news and trends reading</li>
        </ul>
    </div>

    <footer style="margin-top: 40px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 20px;">
        <p>Generated by CareerPivot AI Career Coach • Keep this plan updated as you progress</p>
    </footer>
</body>
</html>`;
    }

    downloadAsHTML(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Action plan downloaded successfully!', 'success');
    }

    saveDevelopmentPlan() {
        const planData = {
            timestamp: new Date().toISOString(),
            currentSkills: this.currentSkills,
            targetRequirements: this.targetRequirements,
            gapAnalysis: this.gapAnalysis,
            matchScore: this.gapAnalysis.matchScore,
            recommendations: {
                learningPath: this.generateLearningPath(),
                projects: this.generateProjectRecommendations(),
                quickWins: this.generateQuickWins(),
                longTermGoals: this.generateLongTermGoals()
            }
        };

        localStorage.setItem('careerDevelopmentPlan', JSON.stringify(planData));
        this.showNotification('Development plan saved successfully!', 'success');
    }

    loadSavedPlan() {
        const savedPlan = localStorage.getItem('careerDevelopmentPlan');
        if (savedPlan) {
            const planData = JSON.parse(savedPlan);
            this.currentSkills = planData.currentSkills;
            this.targetRequirements = planData.targetRequirements;
            this.gapAnalysis = planData.gapAnalysis;

            // Display loaded data
            this.displayCurrentSkills(this.currentSkills);
            this.displayTargetRequirements(this.targetRequirements);
            this.displayGapAnalysis(this.gapAnalysis);
            this.displayRecommendations(planData.recommendations);

            this.updateStep(4);
            this.showNotification('Previous development plan loaded!', 'success');
        }
    }
}

// Global functions for HTML onclick handlers
function analyzeCurrentSkills() {
    if (window.careerGapAnalyzer) {
        window.careerGapAnalyzer.analyzeCurrentSkills();
    }
}

function analyzeTargetJob() {
    if (window.careerGapAnalyzer) {
        window.careerGapAnalyzer.analyzeTargetJob();
    }
}

function analyzeIndustryTrends(industry) {
    if (window.careerGapAnalyzer) {
        window.careerGapAnalyzer.analyzeIndustryTrends(industry);
    }
}

function exportActionPlan() {
    if (window.careerGapAnalyzer) {
        window.careerGapAnalyzer.exportActionPlan();
    }
}

function saveDevelopmentPlan() {
    if (window.careerGapAnalyzer) {
        window.careerGapAnalyzer.saveDevelopmentPlan();
    }
}

function waitForElement(id, callback, timeout = 3000) {
    const start = performance.now();

    function check() {
        const el = document.getElementById(id);
        if (el) {
            callback(el);
        } else if (performance.now() - start < timeout) {
            requestAnimationFrame(check);
        } else {
            console.warn(`⏱️ Timeout waiting for element #${id}`);
        }
    }

    requestAnimationFrame(check);
}

function waitForElementWithText(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        function check() {
            const el = document.querySelector(selector);
            if (el && el.innerText.trim()) return resolve(el);
            if (Date.now() - start >= timeout) return reject(`⏱️ Timeout waiting for non-empty ${selector}`);
            requestAnimationFrame(check);
        }

        check();
    });
}

const analyzer = new CareerGapAnalyzer();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("mustHaveSkills").innerText = `
  - JavaScript
  - React
  - REST APIs
  - Node.js
    `;
  
    document.getElementById("analyzeButton")?.addEventListener("click", () => {
      analyzer.analyzeTargetJob();
    });
  
    document.getElementById("recommendBtn")?.addEventListener("click", () => {
      analyzer.generateSkillRecommendations();
    });
  });

// document.addEventListener("DOMContentLoaded", () => {
//     waitForElement("mustHaveSkills", () => {
//         console.log("✅ #mustHaveSkills is now in the DOM");

//         // Init CareerGapAnalyzer
//         window.careerGapAnalyzer = new CareerGapAnalyzer();

//         // Hook up button only *after* the DOM is ready
//         const analyzeBtn = document.getElementById("analyzeTargetBtn");
//         if (analyzeBtn) {
//             analyzeBtn.addEventListener("click", () => {
//                 window.careerGapAnalyzer.analyzeTargetJob();
//             });
//         }
//     });
// });

// const analyzer = new CareerGapAnalyzer();

// document.addEventListener("DOMContentLoaded", () => {
//   // This binds the click to the button
//   document.getElementById("recommendBtn")?.addEventListener("click", () => {
//     analyzer.generateSkillRecommendations();
//   });
// }); 