// Initialize page animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate skill progress bars
    const skillBars = document.querySelectorAll('.skill-progress-fill');
    const goalBars = document.querySelectorAll('.goal-progress-fill');
    
    const animateProgressBars = (bars) => {
        bars.forEach((bar, index) => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, index * 200 + 500);
        });
    };
    
    animateProgressBars(skillBars);
    animateProgressBars(goalBars);
    
    // Animate stats on load
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        setTimeout(() => {
            animateValue(stat, 0, parseFloat(finalValue) || finalValue, 1000, finalValue);
        }, index * 300 + 800);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.skill-item, .goal-item, .insight-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click handlers for action buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Show notification based on button text
            const buttonText = this.textContent.trim();
            showNotification(buttonText);
        });
    });
});

function animateValue(element, start, end, duration, finalText) {
    const startTime = performance.now();
    const isNumber = !isNaN(end);
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (isNumber) {
            const current = start + (end - start) * easeOutQuart(progress);
            element.textContent = Math.floor(current);
        } else {
            // For non-numeric values, just show final value when animation completes
            if (progress >= 1) {
                element.textContent = finalText;
            }
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = finalText;
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function showNotification(actionType) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(90deg, #E879F9 0%, #C084FC 25%, #A78BFA 50%, #818CF8 75%, #60A5FA 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
        font-family: 'Satoshi', 'SF Pro Display', system-ui, sans-serif;
        font-size: 14px;
        max-width: 300px;
    `;
    
    let message = '';
    switch(actionType) {
        case 'Update Skills Assessment':
            message = '🎯 Skills assessment updated successfully!';
            break;
        case 'Find Matching Jobs':
            message = '🔍 Searching for jobs matching your profile...';
            break;
        case 'Get AI Career Coach':
            message = '🤖 AI Career Coach activated!';
            break;
        default:
            message = '✅ Action completed!';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add intersection observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for scroll animation
document.querySelectorAll('.profile-card, .ai-insights').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Skills data management functions
const SkillsManager = {
    skills: {
        technical: [
            { name: 'JavaScript', level: 'Expert', progress: 95 },
            { name: 'React', level: 'Advanced', progress: 85 },
            { name: 'Node.js', level: 'Advanced', progress: 80 },
            { name: 'Python', level: 'Intermediate', progress: 65 }
        ],
        soft: [
            { name: 'Leadership', level: 'Advanced', progress: 85 },
            { name: 'Communication', level: 'Expert', progress: 90 },
            { name: 'Problem Solving', level: 'Expert', progress: 92 },
            { name: 'Project Management', level: 'Advanced', progress: 78 }
        ]
    },
    
    addSkill: function(category, skill) {
        this.skills[category].push(skill);
        this.renderSkills();
    },
    
    updateSkill: function(category, skillName, newData) {
        const skill = this.skills[category].find(s => s.name === skillName);
        if (skill) {
            Object.assign(skill, newData);
            this.renderSkills();
        }
    },
    
    removeSkill: function(category, skillName) {
        this.skills[category] = this.skills[category].filter(s => s.name !== skillName);
        this.renderSkills();
    },
    
    renderSkills: function() {
        // This would re-render the skills sections
        // Implementation depends on whether you want to use a framework
        console.log('Skills updated:', this.skills);
    }
};

// Goals data management
const GoalsManager = {
    goals: [
        { title: 'Tech Lead Role', progress: 75, icon: 'clipboard' },
        { title: 'Learn AI/ML', progress: 45, icon: 'trending-up' },
        { title: 'System Architecture', progress: 60, icon: 'layers' }
    ],
    
    updateGoalProgress: function(goalTitle, newProgress) {
        const goal = this.goals.find(g => g.title === goalTitle);
        if (goal) {
            goal.progress = newProgress;
            this.renderGoals();
        }
    },
    
    addGoal: function(goal) {
        this.goals.push(goal);
        this.renderGoals();
    },
    
    renderGoals: function() {
        console.log('Goals updated:', this.goals);
    }
};

// Career insights and recommendations
const CareerInsights = {
    generateRecommendations: function(userProfile) {
        // Mock AI recommendations based on user profile
        const recommendations = [
            {
                type: 'skill',
                title: 'Skill Recommendations',
                content: 'Based on your career goals, consider learning TypeScript and GraphQL.'
            },
            {
                type: 'career',
                title: 'Career Trajectory',
                content: 'You\'re on track to reach a tech lead role within 18 months.'
            },
            {
                type: 'market',
                title: 'Market Opportunities',
                content: 'The demand for senior engineers with your skill set has increased 40% this quarter.'
            }
        ];
        
        return recommendations;
    },
    
    updateInsights: function() {
        const insights = this.generateRecommendations({
            skills: SkillsManager.skills,
            goals: GoalsManager.goals
        });
        
        console.log('Updated insights:', insights);
        return insights;
    }
};

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SkillsManager,
        GoalsManager,
        CareerInsights
    };
}