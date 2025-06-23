// Job Search functionality for CareerPivot
class JobSearch {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.savedJobs = JSON.parse(localStorage.getItem('careerpivot_saved_jobs') || '[]');
        this.currentFilters = {};
        this.currentSort = 'relevance';
        this.currentPage = 1;
        this.jobsPerPage = 10;
        this.isLoading = false;
        
        // API Configuration from config.js
        this.API_KEY = window.CONFIG?.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY_HERE';
        this.API_HOST = window.CONFIG?.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';
        
        this.init();
    }

    init() {
        // Check authentication
        if (!window.auth || !window.auth.isAuthenticated()) {
            window.location.href = '../login_and_signup/login.html';
            return;
        }

        // Debug: Check if config loaded
        console.log('🔍 CONFIG check:', window.CONFIG);
        console.log('🔑 API_KEY:', this.API_KEY);
        console.log('🌐 API_HOST:', this.API_HOST);

        this.loadUserData();
        
        // Start with mock data, then load real data
        this.loadMockJobs();
        this.displayJobs();
        
        // Load real jobs in background if we have a valid API key
        if (this.API_KEY && 
            this.API_KEY !== 'YOUR_RAPIDAPI_KEY_HERE' && 
            !this.API_KEY.includes('your-full-api-key-here')) {
            console.log('✅ Valid API key detected, loading real jobs...');
            this.searchRealJobs('product manager', 'United States');
        } else {
            console.log('❌ No valid API key, using mock data');
        }
        
        this.initializeEventListeners();
    }

    async searchRealJobs(query = '', location = '') {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        );

        try {
            // Check if we have a valid API key
            if (!this.API_KEY || this.API_KEY === 'YOUR_RAPIDAPI_KEY_HERE' || this.API_KEY.includes('your-full-api-key-here')) {
                console.log('🔑 Add your RapidAPI key to get real job data!');
                this.showApiKeyMessage();
                return;
            }

            const url = `https://${this.API_HOST}/search`;
            const params = new URLSearchParams({
                query: query || 'product manager',
                page: '1',
                num_pages: '1',
                country: 'us',
                ...(location && { location })
            });

            console.log('🚀 Making API request to:', `${url}?${params}`);

            const fetchPromise = fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': this.API_KEY,
                    'X-RapidAPI-Host': this.API_HOST
                }
            });

            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            console.log('📡 API Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('📡 API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API Response received:', data);
            this.processRealJobs(data.data || []);
            
        } catch (error) {
            console.error('🚨 API Error Details:', error);
            
            if (error.message.includes('timeout')) {
                this.showNotification('API request timed out. Using demo data.', 'error');
            } else {
                this.showApiError(error.message);
            }
            
            // Fall back to enhanced mock data
            this.loadMockJobs();
            this.displayJobs();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    processRealJobs(realJobs) {
        // Convert real job data to our format
        const processedJobs = realJobs.map((job, index) => ({
            id: `real_${job.job_id || index}`,
            title: job.job_title || 'Untitled Position',
            company: job.employer_name || 'Company',
            location: job.job_city && job.job_state 
                ? `${job.job_city}, ${job.job_state}` 
                : job.job_country || 'Remote',
            type: job.job_employment_type || 'Full-time',
            salary: this.formatSalary(job.job_min_salary, job.job_max_salary),
            salaryMin: job.job_min_salary || 0,
            salaryMax: job.job_max_salary || 0,
            experience: this.determineExperienceLevel(job.job_title, job.job_description),
            companySize: 'unknown',
            postedDate: this.formatDate(job.job_posted_at_datetime_utc),
            matchScore: this.calculateMatchScore(job),
            description: this.truncateDescription(job.job_description || 'No description available'),
            skills: this.extractSkills(job.job_description || ''),
            requirements: this.extractRequirements(job.job_description || ''),
            saved: false,
            isReal: true,
            originalData: job
        }));

        // Replace mock data with real data
        this.jobs = processedJobs;
        this.filteredJobs = [...this.jobs];
        
        // Mark saved jobs
        this.jobs.forEach(job => {
            job.saved = this.savedJobs.includes(job.id);
        });

        this.updateJobCount();
        this.displayJobs();
        
        this.showNotification(`Loaded ${processedJobs.length} real jobs!`, 'success');
    }

    formatSalary(min, max) {
        if (!min && !max) return 'Salary not specified';
        if (!max) return `${(min/1000).toFixed(0)}k+`;
        if (!min) return `Up to ${(max/1000).toFixed(0)}k`;
        return `${(min/1000).toFixed(0)}k - ${(max/1000).toFixed(0)}k`;
    }

    determineExperienceLevel(title, description) {
        const titleLower = title.toLowerCase();
        const descLower = (description || '').toLowerCase();
        
        if (titleLower.includes('senior') || titleLower.includes('lead') || 
            titleLower.includes('principal') || descLower.includes('8+ years')) {
            return 'senior';
        }
        if (titleLower.includes('junior') || titleLower.includes('entry') || 
            descLower.includes('entry level') || descLower.includes('0-2 years')) {
            return 'entry';
        }
        return 'mid';
    }

    formatDate(dateString) {
        if (!dateString) return 'Recently posted';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
        return 'Over a month ago';
    }

    calculateMatchScore(job) {
        // Simple AI matching algorithm
        let score = 70; // Base score
        
        const title = (job.job_title || '').toLowerCase();
        const desc = (job.job_description || '').toLowerCase();
        
        // Boost for relevant skills
        const skillBoosts = {
            'product': 10,
            'management': 8,
            'strategy': 6,
            'analytics': 5,
            'sql': 4,
            'python': 4
        };
        
        Object.entries(skillBoosts).forEach(([skill, boost]) => {
            if (title.includes(skill) || desc.includes(skill)) {
                score += boost;
            }
        });
        
        return Math.min(95, Math.max(65, score + Math.floor(Math.random() * 10)));
    }

    extractSkills(description) {
        const commonSkills = [
            'Python', 'SQL', 'JavaScript', 'React', 'Product Strategy', 
            'Analytics', 'A/B Testing', 'User Research', 'Figma', 'Jira',
            'AWS', 'Machine Learning', 'Data Analysis', 'Agile', 'Scrum'
        ];
        
        return commonSkills.filter(skill => 
            description.toLowerCase().includes(skill.toLowerCase())
        ).slice(0, 4);
    }

    extractRequirements(description) {
        // Simple requirement extraction
        const lines = description.split('\n').filter(line => 
            line.toLowerCase().includes('year') || 
            line.toLowerCase().includes('experience') ||
            line.toLowerCase().includes('degree')
        );
        
        return lines.slice(0, 3).map(line => line.trim()).filter(Boolean);
    }

    truncateDescription(description) {
        if (!description) return 'No description available';
        return description.length > 200 
            ? description.substring(0, 200) + '...'
            : description;
    }

    showApiKeyMessage() {
        const jobsList = document.getElementById('jobsList');
        jobsList.innerHTML = `
            <div class="api-setup-message">
                <div class="setup-card">
                    <h3>🚀 Ready for Real Job Data!</h3>
                    <p>To get live job postings, you need a free API key:</p>
                    <ol>
                        <li>Go to <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch" target="_blank">RapidAPI JSearch</a></li>
                        <li>Sign up for free (100 requests/month)</li>
                        <li>Copy your API key</li>
                        <li>Replace 'YOUR_RAPIDAPI_KEY_HERE' in the code</li>
                    </ol>
                    <p>For now, showing mock data with full functionality!</p>
                    <button onclick="jobSearch.loadMockJobs(); jobSearch.displayJobs();" class="try-demo-btn">
                        Continue with Demo Data
                    </button>
                </div>
            </div>
        `;
    }

    showApiError(error) {
        this.showNotification(`API Error: ${error}. Showing demo data.`, 'error');
        this.loadMockJobs();
        this.displayJobs();
    }

    showLoadingState() {
        const jobsList = document.getElementById('jobsList');
        jobsList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">
                    <h3>Loading real job data...</h3>
                    <p>Fetching latest positions from top job boards</p>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Animate progress bar
        setTimeout(() => {
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '60%';
            }
        }, 1000);
        
        setTimeout(() => {
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '90%';
            }
        }, 3000);
    }

    hideLoadingState() {
        // Loading state will be replaced by displayJobs()
    }

    loadUserData() {
        const currentUser = window.auth.getCurrentUser();
        if (currentUser) {
            const userInitials = document.getElementById('userInitials');
            if (userInitials) {
                const initials = `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`;
                userInitials.textContent = initials.toUpperCase() || 'U';
            }
        }
    }

    loadMockJobs() {
        // Mock job data - in production this would come from APIs
        this.jobs = [
            {
                id: 1,
                title: "Senior Product Manager",
                company: "TechCorp Inc.",
                location: "San Francisco, CA",
                type: "Full-time",
                salary: "$140k - $180k",
                salaryMin: 140000,
                salaryMax: 180000,
                experience: "senior",
                companySize: "large",
                postedDate: "2 days ago",
                matchScore: 92,
                description: "Lead product strategy and development for our AI-powered platform. Work with cross-functional teams to deliver innovative solutions.",
                skills: ["Product Strategy", "User Research", "SQL", "Python"],
                requirements: ["5+ years product management", "Technical background", "Leadership experience"],
                saved: false
            },
            {
                id: 2,
                title: "Product Manager",
                company: "StartupXYZ",
                location: "Remote",
                type: "Full-time",
                salary: "$120k - $150k",
                salaryMin: 120000,
                salaryMax: 150000,
                experience: "mid",
                companySize: "startup",
                postedDate: "1 day ago",
                matchScore: 87,
                description: "Join our fast-growing startup to build the future of fintech. Own the product roadmap and drive growth initiatives.",
                skills: ["Product Strategy", "Analytics", "A/B Testing", "Figma"],
                requirements: ["3+ years product management", "Fintech experience preferred", "Data-driven mindset"],
                saved: true
            },
            {
                id: 3,
                title: "Associate Product Manager",
                company: "BigTech Corp",
                location: "Seattle, WA",
                type: "Full-time",
                salary: "$100k - $130k",
                salaryMin: 100000,
                salaryMax: 130000,
                experience: "mid",
                companySize: "large",
                postedDate: "3 days ago",
                matchScore: 78,
                description: "Great entry point into product management at a leading tech company. Work on consumer-facing products used by millions.",
                skills: ["Product Strategy", "User Research", "Excel", "Jira"],
                requirements: ["2+ years experience", "Technical degree", "Customer obsession"],
                saved: false
            },
            {
                id: 4,
                title: "Principal Product Manager",
                company: "InnovateLabs",
                location: "Austin, TX",
                type: "Full-time",
                salary: "$160k - $200k",
                salaryMin: 160000,
                salaryMax: 200000,
                experience: "senior",
                companySize: "medium",
                postedDate: "1 week ago",
                matchScore: 95,
                description: "Lead product vision for next-generation AI tools. Drive strategy across multiple product lines and mentor junior PMs.",
                skills: ["Product Strategy", "AI/ML", "Leadership", "Market Analysis"],
                requirements: ["8+ years product management", "AI/ML experience", "Team leadership"],
                saved: false
            },
            {
                id: 5,
                title: "Product Manager - Data Platform",
                company: "DataFlow Systems",
                location: "New York, NY",
                type: "Full-time",
                salary: "$130k - $160k",
                salaryMin: 130000,
                salaryMax: 160000,
                experience: "mid",
                companySize: "medium",
                postedDate: "4 days ago",
                matchScore: 83,
                description: "Own the product strategy for our enterprise data platform. Work with engineering teams to build scalable data solutions.",
                skills: ["SQL", "Python", "Data Analysis", "Product Strategy"],
                requirements: ["4+ years product management", "Data platform experience", "Technical background"],
                saved: false
            },
            {
                id: 6,
                title: "Junior Product Manager",
                company: "GrowthStart",
                location: "Los Angeles, CA",
                type: "Full-time",
                salary: "$90k - $110k",
                salaryMin: 90000,
                salaryMax: 110000,
                experience: "entry",
                companySize: "startup",
                postedDate: "5 days ago",
                matchScore: 72,
                description: "Perfect for career changers looking to break into product management. Mentorship and growth opportunities available.",
                skills: ["Product Strategy", "Analytics", "User Research", "Wireframing"],
                requirements: ["1+ years relevant experience", "Analytical mindset", "Growth-oriented"],
                saved: false
            }
        ];

        // Mark saved jobs
        this.jobs.forEach(job => {
            job.saved = this.savedJobs.includes(job.id);
        });

        this.filteredJobs = [...this.jobs];
        this.updateJobCount();
    }

    initializeEventListeners() {
        // Search inputs
        document.getElementById('jobTitle').addEventListener('input', this.debounce(() => this.searchJobs(), 300));
        document.getElementById('location').addEventListener('input', this.debounce(() => this.searchJobs(), 300));

        // Enter key support
        document.getElementById('jobTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchJobs();
        });
        document.getElementById('location').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchJobs();
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    searchJobs() {
        const jobTitle = document.getElementById('jobTitle').value.toLowerCase();
        const location = document.getElementById('location').value.toLowerCase();

        // If we have real API access and search terms, fetch real data
        if (this.API_KEY && 
            this.API_KEY !== 'YOUR_RAPIDAPI_KEY_HERE' && 
            !this.API_KEY.includes('your-full-api-key-here') &&
            (jobTitle || location)) {
            this.searchRealJobs(jobTitle, location);
            return;
        }

        // Otherwise, filter existing jobs
        this.filteredJobs = this.jobs.filter(job => {
            const titleMatch = !jobTitle || 
                job.title.toLowerCase().includes(jobTitle) ||
                job.company.toLowerCase().includes(jobTitle) ||
                job.skills.some(skill => skill.toLowerCase().includes(jobTitle));

            const locationMatch = !location || 
                job.location.toLowerCase().includes(location) ||
                location.includes('remote') && job.location.toLowerCase().includes('remote');

            return titleMatch && locationMatch && this.matchesFilters(job);
        });

        this.sortJobs();
        this.currentPage = 1;
        this.displayJobs();
        this.updateJobCount();
    }

    matchesFilters(job) {
        // Experience filter
        if (this.currentFilters.experience && job.experience !== this.currentFilters.experience) {
            return false;
        }

        // Salary filter
        if (this.currentFilters.salary) {
            const [min, max] = this.currentFilters.salary.split('-').map(s => 
                s.replace('k', '000').replace('+', '').replace('$', '').trim()
            );
            const minSalary = parseInt(min) || 0;
            const maxSalary = max ? parseInt(max) : Infinity;

            if (job.salaryMin < minSalary || (maxSalary !== Infinity && job.salaryMax > maxSalary)) {
                return false;
            }
        }

        // Job type filter
        if (this.currentFilters.jobType && job.type.toLowerCase() !== this.currentFilters.jobType) {
            return false;
        }

        // Company size filter
        if (this.currentFilters.companySize && job.companySize !== this.currentFilters.companySize) {
            return false;
        }

        return true;
    }

    sortJobs() {
        this.filteredJobs.sort((a, b) => {
            switch (this.currentSort) {
                case 'match':
                    return b.matchScore - a.matchScore;
                case 'date':
                    return new Date(b.postedDate) - new Date(a.postedDate);
                case 'salary':
                    return b.salaryMax - a.salaryMax;
                case 'relevance':
                default:
                    return b.matchScore - a.matchScore; // Default to match score
            }
        });
    }

    displayJobs() {
        const jobsList = document.getElementById('jobsList');
        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        const jobsToShow = this.filteredJobs.slice(0, endIndex);

        if (jobsToShow.length === 0) {
            jobsList.innerHTML = `
                <div class="no-jobs">
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        jobsList.innerHTML = jobsToShow.map(job => this.createJobCard(job)).join('');

        // Update load more button
        const loadMoreBtn = document.querySelector('.load-more');
        if (endIndex >= this.filteredJobs.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createJobCard(job) {
        return `
            <div class="job-card ${job.saved ? 'saved' : ''}" data-job-id="${job.id}">
                <div class="job-header">
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <div class="job-company">${job.company}</div>
                        <div class="job-location">${job.location}</div>
                    </div>
                    <div class="job-actions">
                        <div class="match-score">${job.matchScore}% match</div>
                        <button class="save-btn ${job.saved ? 'saved' : ''}" onclick="jobSearch.toggleSaveJob(${job.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="job-details">
                    <div class="job-description">
                        ${job.description}
                    </div>
                    
                    <div class="job-tags">
                        ${job.skills.map(skill => `<span class="job-tag skill">${skill}</span>`).join('')}
                        <span class="job-tag">${job.type}</span>
                        <span class="job-tag">${job.experience} level</span>
                    </div>
                </div>
                
                <div class="job-footer">
                    <div class="job-salary">${job.salary}</div>
                    <div class="job-posted">${job.postedDate}</div>
                </div>
            </div>
        `;
    }

    toggleSaveJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        job.saved = !job.saved;
        
        if (job.saved) {
            this.savedJobs.push(jobId);
        } else {
            this.savedJobs = this.savedJobs.filter(id => id !== jobId);
        }

        localStorage.setItem('careerpivot_saved_jobs', JSON.stringify(this.savedJobs));
        
        // Update the card appearance
        const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
        const saveBtn = jobCard.querySelector('.save-btn');
        
        if (job.saved) {
            jobCard.classList.add('saved');
            saveBtn.classList.add('saved');
        } else {
            jobCard.classList.remove('saved');
            saveBtn.classList.remove('saved');
        }

        // Show notification
        this.showNotification(job.saved ? 'Job saved!' : 'Job removed from saved', 'success');
    }

    updateJobCount() {
        const jobCount = document.getElementById('jobCount');
        if (jobCount) {
            jobCount.textContent = this.filteredJobs.length.toLocaleString();
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'success' ? 'rgba(6, 214, 160, 0.1)' : 
                         type === 'error' ? 'rgba(255, 107, 107, 0.1)' : 
                         'rgba(96, 165, 250, 0.1)'};
            border: 1px solid ${type === 'success' ? '#06D6A0' : 
                                type === 'error' ? '#FF6B6B' : 
                                '#60A5FA'};
            border-radius: 12px;
            padding: 16px 20px;
            color: ${type === 'success' ? '#06D6A0' : 
                     type === 'error' ? '#FF6B6B' : 
                     '#60A5FA'};
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            backdrop-filter: blur(20px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function searchJobs() {
    jobSearch.searchJobs();
}

function toggleFilters() {
    const filtersPanel = document.getElementById('filtersPanel');
    filtersPanel.classList.toggle('show');
}

function updateFilters() {
    const filterCount = document.getElementById('filterCount');
    const experience = document.getElementById('experienceFilter').value;
    const salary = document.getElementById('salaryFilter').value;
    const jobType = document.getElementById('jobTypeFilter').value;
    const companySize = document.getElementById('companySizeFilter').value;

    jobSearch.currentFilters = {
        experience: experience || null,
        salary: salary || null,
        jobType: jobType || null,
        companySize: companySize || null
    };

    // Count active filters
    const activeFilters = Object.values(jobSearch.currentFilters).filter(Boolean).length;
    filterCount.textContent = activeFilters;
    
    // Auto-apply filters
    jobSearch.searchJobs();
}

function clearFilters() {
    document.getElementById('experienceFilter').value = '';
    document.getElementById('salaryFilter').value = '';
    document.getElementById('jobTypeFilter').value = '';
    document.getElementById('companySizeFilter').value = '';
    
    jobSearch.currentFilters = {};
    document.getElementById('filterCount').textContent = '0';
    jobSearch.searchJobs();
}

function applyFilters() {
    updateFilters();
    toggleFilters();
}

function sortJobs() {
    const sortBy = document.getElementById('sortBy').value;
    jobSearch.currentSort = sortBy;
    jobSearch.sortJobs();
    jobSearch.displayJobs();
}

function loadMoreJobs() {
    jobSearch.currentPage++;
    jobSearch.displayJobs();
}

// Initialize job search when DOM is loaded
let jobSearch;
document.addEventListener('DOMContentLoaded', function() {
    jobSearch = new JobSearch();
});

// Make jobSearch available globally
window.jobSearch = jobSearch;