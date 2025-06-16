// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Demo analysis function
function runAnalysis() {
    const currentRole = document.getElementById('current-role').value;
    const targetRole = document.getElementById('target-role').value;
    const experience = document.getElementById('experience').value;
    const industry = document.getElementById('industry').value;

    if (!currentRole || !targetRole || !experience || !industry) {
        alert('Please fill in all fields to run the analysis');
        return;
    }

    // Show loading state
    const button = document.querySelector('button[onclick="runAnalysis()"]');
    const originalText = button.textContent;
    button.textContent = 'Analyzing...';
    button.disabled = true;

    // Simulate AI analysis with realistic data
    setTimeout(() => {
        const results = generateAnalysis(currentRole, targetRole, experience, industry);
        
        document.getElementById('skill-score').textContent = results.skillScore + '%';
        document.getElementById('transferable-skills').textContent = results.transferableSkills;
        document.getElementById('skill-gaps').textContent = results.skillGaps;
        document.getElementById('timeline').textContent = results.timeline;
        document.getElementById('success-rate').textContent = results.successRate + '%';

        document.getElementById('results').style.display = 'block';
        
        // Animate results
        gsap.fromTo('#results', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6 }
        );

        button.textContent = originalText;
        button.disabled = false;
    }, 2500);
}

function generateAnalysis(currentRole, targetRole, experience, industry) {
    // Realistic analysis based on common career transitions
    const transitions = {
        'marketing manager->product manager': {
            skillScore: 78,
            transferableSkills: 'Market Research, User Analytics, Stakeholder Management',
            skillGaps: 'Technical Product Skills, Roadmap Planning',
            timeline: '4-6 months',
            successRate: 73
        },
        'software engineer->product manager': {
            skillScore: 85,
            transferableSkills: 'Technical Architecture, Problem Solving, User Empathy',
            skillGaps: 'Business Strategy, Market Analysis',
            timeline: '3-4 months',
            successRate: 81
        },
        'consultant->product manager': {
            skillScore: 82,
            transferableSkills: 'Strategic Thinking, Client Management, Process Optimization',
            skillGaps: 'Product Development, Agile Methodologies',
            timeline: '4-5 months',
            successRate: 76
        },
        'marketing manager->data scientist': {
            skillScore: 65,
            transferableSkills: 'Analytics, A/B Testing, Customer Insights',
            skillGaps: 'Python, Machine Learning, Statistics',
            timeline: '8-12 months',
            successRate: 58
        },
        'software engineer->data scientist': {
            skillScore: 88,
            transferableSkills: 'Programming, Problem Solving, Technical Skills',
            skillGaps: 'Statistics, Domain Knowledge, ML Frameworks',
            timeline: '4-6 months',
            successRate: 84
        },
        'business analyst->product manager': {
            skillScore: 75,
            transferableSkills: 'Requirements Analysis, Stakeholder Management, Process Improvement',
            skillGaps: 'Product Strategy, User Experience Design',
            timeline: '3-5 months',
            successRate: 71
        },
        'sales manager->business development': {
            skillScore: 89,
            transferableSkills: 'Relationship Building, Revenue Generation, Market Understanding',
            skillGaps: 'Partnership Strategy, Contract Negotiation',
            timeline: '2-3 months',
            successRate: 87
        },
        'designer->ux researcher': {
            skillScore: 82,
            transferableSkills: 'User Empathy, Design Thinking, Prototyping',
            skillGaps: 'Research Methodologies, Data Analysis',
            timeline: '4-6 months',
            successRate: 78
        },
        'project manager->product manager': {
            skillScore: 77,
            transferableSkills: 'Cross-functional Leadership, Timeline Management, Risk Assessment',
            skillGaps: 'Market Research, Product Strategy',
            timeline: '3-4 months',
            successRate: 74
        },
        'teacher->instructional designer': {
            skillScore: 83,
            transferableSkills: 'Curriculum Development, Learning Assessment, Communication',
            skillGaps: 'Educational Technology, LMS Platforms',
            timeline: '3-5 months',
            successRate: 79
        },
        'finance analyst->data analyst': {
            skillScore: 80,
            transferableSkills: 'Quantitative Analysis, Excel Modeling, Report Building',
            skillGaps: 'SQL, Python, Data Visualization',
            timeline: '4-7 months',
            successRate: 72
        }
    };

    const key = `${currentRole.toLowerCase()}->${targetRole.toLowerCase()}`;
    const match = transitions[key];
    
    if (match) {
        return match;
    }
    
    // Generate realistic fallback based on experience level and industry
    const experienceMultiplier = {
        '1-2': 0.8,
        '3-5': 1.0,
        '5-10': 1.2,
        '10+': 1.1
    };
    
    const industryBonus = {
        'tech': 10,
        'finance': 5,
        'healthcare': 3,
        'consulting': 8,
        'retail': 2,
        'other': 0
    };
    
    const baseScore = 60 + Math.floor(Math.random() * 20);
    const expBoost = Math.floor(baseScore * (experienceMultiplier[experience] || 1));
    const finalScore = Math.min(95, expBoost + (industryBonus[industry] || 0));
    
    const genericSkills = [
        'Communication, Problem-Solving, Leadership',
        'Project Management, Analytical Thinking, Teamwork',
        'Strategic Planning, Stakeholder Management, Adaptability',
        'Customer Focus, Process Improvement, Technical Aptitude'
    ];
    
    const genericGaps = [
        'Domain Knowledge, Technical Skills',
        'Industry-Specific Tools, Certification Requirements',
        'Advanced Technical Skills, Platform Knowledge',
        'Specialized Methodologies, Software Proficiency'
    ];
    
    const timelines = ['3-4 months', '4-6 months', '5-8 months', '6-9 months'];
    
    return {
        skillScore: finalScore,
        transferableSkills: genericSkills[Math.floor(Math.random() * genericSkills.length)],
        skillGaps: genericGaps[Math.floor(Math.random() * genericGaps.length)],
        timeline: timelines[Math.floor(Math.random() * timelines.length)],
        successRate: Math.max(45, finalScore - 15 + Math.floor(Math.random() * 10))
    };
}

// Initialize GSAP animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Animate feature cards on scroll
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    once: true
                }
            }
        );
    });

    // Animate pricing cards
    gsap.utils.toArray('.pricing-card').forEach((card, index) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                }
            }
        );
    });

    // Counter animation for stats
    gsap.utils.toArray('.stat-number').forEach(stat => {
        const finalValue = stat.textContent;
        const isPercentage = finalValue.includes('%');
        const isNumber = finalValue.includes('K+') || !isNaN(parseInt(finalValue));
        
        if (isNumber) {
            gsap.fromTo(stat, 
                { textContent: 0 },
                {
                    textContent: finalValue,
                    duration: 2,
                    ease: "power2.out",
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 80%',
                        once: true
                    },
                    onUpdate: function() {
                        if (finalValue.includes('K+')) {
                            const currentValue = Math.floor(this.targets()[0].textContent);
                            stat.textContent = currentValue + 'K+';
                        } else if (finalValue.includes('%')) {
                            const currentValue = Math.floor(this.targets()[0].textContent);
                            stat.textContent = currentValue + '%';
                        }
                    }
                }
            );
        }
    });

    // Animate demo container on scroll
    gsap.fromTo('.demo-container', 
        { opacity: 0, scale: 0.95 },
        {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.demo-container',
                start: 'top 85%',
                once: true
            }
        }
    );

    // Hero elements animation
    gsap.timeline()
        .fromTo('.hero h1', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        )
        .fromTo('.hero .subtitle', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.5"
        )
        .fromTo('.hero-cta', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.3"
        );
});

// Add loading states for form interactions
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.demo-form input, .demo-form select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.style.borderColor = '#667eea';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
    });
});

// Add hover effects for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add subtle parallax effect to floating elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-element');
        const speed = 0.5;

        parallax.forEach(element => {
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });

    // Add click tracking for demo purposes (remove in production)
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);