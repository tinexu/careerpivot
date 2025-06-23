// Dashboard functionality for CareerPivot
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check authentication
        if (!window.auth || !window.auth.isAuthenticated()) {
            window.location.href = '../login_and_signup/login.html';
            return;
        }

        this.currentUser = window.auth.getCurrentUser();
        this.loadUserData();
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    loadUserData() {
        if (!this.currentUser) return;

        // Update welcome message
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) {
            welcomeName.textContent = this.currentUser.firstName || 'User';
        }

        // Update user info in dropdown
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userInitials = document.getElementById('userInitials');

        if (userName) {
            userName.textContent = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
        }

        if (userEmail) {
            userEmail.textContent = this.currentUser.email || '';
        }

        if (userInitials) {
            const initials = `${this.currentUser.firstName?.[0] || ''}${this.currentUser.lastName?.[0] || ''}`;
            userInitials.textContent = initials.toUpperCase() || 'U';
        }
    }

    initializeEventListeners() {
        // Navigation links - only prevent default for hash links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // Only prevent default for hash links, allow real URLs to navigate
                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.handleNavigation(href);
                }
            });
        });

        // Action buttons
        const startAnalysisBtn = document.querySelector('[onclick="startAnalysis()"]');
        if (startAnalysisBtn) {
            startAnalysisBtn.onclick = () => this.startAnalysis();
        }

        const exploreJobsBtn = document.querySelector('[onclick="exploreJobs()"]');
        if (exploreJobsBtn) {
            exploreJobsBtn.onclick = () => this.exploreJobs();
        }

        // Card actions
        document.querySelectorAll('.card-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.toLowerCase().replace(' ', '-');
                this.handleCardAction(action);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            
            if (userMenu && !userMenu.contains(e.target)) {
                dropdown?.classList.remove('show');
            }
        });
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.animateStats();
        this.loadRecentAnalyses();
        this.loadLearningProgress();
        this.loadSavedJobs();
        this.loadMarketInsights();
    }

    animateStats() {
        // Animate the stat numbers
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach((stat, index) => {
            const finalValue = stat.textContent;
            const hasPercent = finalValue.includes('%');
            const numValue = parseInt(finalValue) || 0;
            
            // Reset to 0 and animate up
            stat.textContent = '0' + (hasPercent ? '%' : '');
            
            setTimeout(() => {
                this.animateNumber(stat, 0, numValue, hasPercent ? '%' : '', 1000);
            }, index * 200);
        });
    }

    animateNumber(element, start, end, suffix, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    loadRecentAnalyses() {
        // This would typically fetch from an API
        // For now, the data is already in the HTML
        console.log('Recent analyses loaded');
    }

    loadLearningProgress() {
        // Animate progress bars
        const progressBars = document.querySelectorAll('.progress-fill');
        
        progressBars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500 + index * 200);
        });
    }

    loadSavedJobs() {
        // This would typically fetch saved jobs from an API
        console.log('Saved jobs loaded');
    }

    loadMarketInsights() {
        // This would typically fetch market insights from an API
        console.log('Market insights loaded');
    }

    handleNavigation(href) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        const clickedLink = document.querySelector(`[href="${href}"]`);
        if (clickedLink) {
            clickedLink.classList.add('active');
        }

        // Handle navigation based on href
        switch (href) {
            case '#overview':
                this.showOverview();
                break;
            case '#analysis':
                this.showAnalysis();
                break;
            case '#jobs':
                this.showJobs();
                break;
            case '#insights':
                this.showInsights();
                break;
            default:
                console.log('Navigation not implemented for:', href);
        }
    }

    showOverview() {
        // Show overview content (current state)
        console.log('Showing overview');
    }

    showAnalysis() {
        // This would show the AI analysis interface
        this.showComingSoon('AI Analysis');
    }

    showJobs() {
        // This would show the job feed
        this.showComingSoon('Job Feed');
    }

    showInsights() {
        // This would show market insights
        this.showComingSoon('Market Insights');
    }

    startAnalysis() {
        // Redirect to analysis page or show modal
        this.showComingSoon('AI Career Analysis');
    }

    exploreJobs() {
        // Redirect to jobs page or show modal
        this.showComingSoon('Job Explorer');
    }

    handleCardAction(action) {
        console.log('Card action:', action);
        this.showComingSoon('Feature');
    }

    showComingSoon(feature) {
        // Create and show coming soon modal
        const modal = document.createElement('div');
        modal.className = 'coming-soon-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 Coming Soon!</h3>
                    <button class="modal-close" onclick="this.closest('.coming-soon-modal').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>${feature}</strong> is currently in development.</p>
                    <p>We're working hard to bring you the best AI-powered career intelligence platform. This feature will be available soon!</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.coming-soon-modal').remove()">
                        Got it
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
                max-width: 400px;
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
            
            .modal-footer {
                padding: 0 24px 24px;
                text-align: right;
            }
            
            .modal-footer .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .modal-footer .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
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
}

// User menu toggle function
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown?.classList.toggle('show');
}

// Logout function
function handleLogout() {
    if (window.auth) {
        window.auth.logout();
    } else {
        window.location.href = '../landing_page/index.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Dashboard();
});

// Show coming soon for navigation items
function showComingSoon(event, feature) {
    event.preventDefault();
    dashboard.showComingSoon(feature);
}

// Show overview (current dashboard)
function showOverview(event) {
    event.preventDefault();
    // Already on overview, just update active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Make functions available globally
window.showComingSoon = showComingSoon;
window.showOverview = showOverview;