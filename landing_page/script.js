// Smooth scrolling for navigation
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
    if (window.scrollY > 50) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.8)';
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
    button.style.opacity = '0.7';

    // Simulate AI analysis
    setTimeout(() => {
        const results = generateAnalysis(currentRole, targetRole, experience, industry);
        
        document.getElementById('skill-score').textContent = results.skillScore + '%';
        document.getElementById('success-rate').textContent = results.successRate + '%';
        document.getElementById('timeline').textContent = results.timeline;

        // Show results with animation
        const resultsEl = document.getElementById('results');
        resultsEl.style.display = 'block';
        
        // Animate results appearance
        gsap.fromTo(resultsEl, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );

        // Reset button
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    }, 2000);
}

function generateAnalysis(currentRole, targetRole, experience, industry) {
    // Career transition analysis data
    const transitions = {
        'marketing manager->product manager': {
            skillScore: 78,
            successRate: 73,
            timeline: '4-6 months'
        },
        'software engineer->product manager': {
            skillScore: 85,
            successRate: 81,
            timeline: '3-4 months'
        },
        'consultant->product manager': {
            skillScore: 82,
            successRate: 76,
            timeline: '4-5 months'
        },
        'business analyst->product manager': {
            skillScore: 75,
            successRate: 71,
            timeline: '3-5 months'
        },
        'designer->ux researcher': {
            skillScore: 82,
            successRate: 78,
            timeline: '4-6 months'
        },
        'teacher->instructional designer': {
            skillScore: 83,
            successRate: 79,
            timeline: '3-5 months'
        }
    };

    const key = `${currentRole.toLowerCase()}->${targetRole.toLowerCase()}`;
    const match = transitions[key];
    
    if (match) {
        return match;
    }
    
    // Generate realistic fallback
    const experienceBoost = {
        '1-2': 0.85,
        '3-5': 1.0,
        '5-10': 1.15,
        '10+': 1.1
    };
    
    const industryBonus = {
        'tech': 8,
        'finance': 5,
        'healthcare': 3,
        'consulting': 6
    };
    
    const baseScore = 65 + Math.floor(Math.random() * 20);
    const boost = experienceBoost[experience] || 1;
    const bonus = industryBonus[industry] || 0;
    const finalScore = Math.min(95, Math.floor(baseScore * boost) + bonus);
    
    const timelines = ['3-4 months', '4-6 months', '5-8 months', '6-9 months'];
    
    return {
        skillScore: finalScore,
        successRate: Math.max(50, finalScore - 10 + Math.floor(Math.random() * 8)),
        timeline: timelines[Math.floor(Math.random() * timelines.length)]
    };
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate feature cards on scroll
        gsap.utils.toArray('.feature-card').forEach((card, index) => {
            gsap.fromTo(card, 
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        });

        // Animate pricing cards
        gsap.utils.toArray('.pricing-card').forEach((card, index) => {
            gsap.fromTo(card, 
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: index * 0.15,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        });

        // Animate stats counters
        gsap.utils.toArray('.stat-number').forEach(stat => {
            const finalValue = stat.textContent;
            const hasPercent = finalValue.includes('%');
            const hasPlus = finalValue.includes('+');
            const isTime = finalValue.includes('min');
            
            if (hasPercent || hasPlus) {
                const numValue = parseInt(finalValue);
                gsap.fromTo(stat, 
                    { textContent: 0 },
                    {
                        textContent: numValue,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: 1 },
                        scrollTrigger: {
                            trigger: stat,
                            start: 'top 80%',
                            once: true
                        },
                        onUpdate: function() {
                            const currentValue = Math.floor(this.targets()[0].textContent);
                            if (hasPercent) {
                                stat.textContent = currentValue + '%';
                            } else if (hasPlus) {
                                stat.textContent = currentValue + 'K+';
                            }
                        }
                    }
                );
            }
        });

        // Hero content animation
        gsap.timeline()
            .fromTo('.hero-title', 
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
            )
            .fromTo('.hero-description', 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                "-=0.5"
            )
            .fromTo('.hero-buttons', 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
                "-=0.3"
            );

        // Wireframe animation
        gsap.to('.wireframe-left', {
            rotation: 5,
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('.wireframe-right', {
            rotation: -3,
            duration: 25,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // Enhanced form interactions
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Button ripple effects
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
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
                background: rgba(255, 255, 255, 0.2);
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

// Add ripple animation CSS
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

// Parallax effect for wireframes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const wireframes = document.querySelectorAll('.wireframe-left, .wireframe-right');
    
    wireframes.forEach((wireframe, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrolled * speed);
        wireframe.style.transform += ` translateY(${yPos}px)`;
    });
});