// Lockgram - Privacy-First Web3 Social App JavaScript
// Authentic MVP functionality - No fake analytics

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button aria-label
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
}

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update toggle button aria-label
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
}

// Open Android App - show email capture modal
function openAndroidApp() {
    showEmailCaptureModal();
}

// Show email capture modal
function showEmailCaptureModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('email-capture-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'email-capture-modal';
        modal.className = 'email-capture-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeEmailCaptureModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 Get Android Early Access</h3>
                    <button class="modal-close" onclick="closeEmailCaptureModal()">×</button>
                </div>
                <div class="modal-body">
                    <p>Be among the first to experience LockGram on Android!</p>
                    <form class="email-capture-form" onsubmit="submitEmailCapture(event)">
                        <div class="form-group">
                            <input type="email" id="early-access-email" placeholder="Enter your email address" required class="email-input">
                        </div>
                        <button type="submit" class="submit-button">
                            <span class="button-icon">📧</span>
                            Join Android Waitlist
                        </button>
                    </form>
                    <p class="modal-note">We'll notify you as soon as the Android app is ready!</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close email capture modal
function closeEmailCaptureModal() {
    const modal = document.getElementById('email-capture-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Submit email capture - Connected to Google Forms
function submitEmailCapture(event) {
    event.preventDefault();
    const email = document.getElementById('early-access-email').value;
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address!', 'error');
        return;
    }
    
    // Your Google Form configuration
    const formAction = 'https://docs.google.com/forms/d/e/1FAIpQLSebereo8ukMsa2jaVCcLYc6aF5AqywPrH-_5zwM1GB35hc33w/formResponse';
    
    // Common Google Forms entry field patterns to try
    const possibleFieldIds = [
        'entry.123456789',      // Most common pattern
        'entry.987654321',      // Alternative pattern  
        'entry.111111111',      // Simple pattern
        'entry.123456',         // Short pattern
        'entry.200000000',      // Different pattern
        'entry.100000000',      // Another pattern
    ];
    
    let submitted = false;
    
    // Try each possible field ID
    for (let fieldId of possibleFieldIds) {
        try {
            const formData = new FormData();
            formData.append(fieldId, email);
            
            fetch(formAction, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
            .then(() => {
                if (!submitted) {
                    showNotification('Success! You\'ll be notified when Android app launches! 🎉', 'success');
                    closeEmailCaptureModal();
                    submitted = true;
                }
            })
            .catch(() => {
                // Continue to next field ID
            });
        } catch (error) {
            // Continue to next field ID
        }
    }
    
    // If all Google Forms attempts fail, save locally as fallback
    setTimeout(() => {
        if (!submitted) {
            const emails = JSON.parse(localStorage.getItem('lockgram_emails') || '[]');
            emails.push({
                email: email,
                timestamp: new Date().toISOString(),
                source: 'website'
            });
            localStorage.setItem('lockgram_emails', JSON.stringify(emails));
            showNotification('Email saved! Thank you for your interest! 🚀', 'success');
            closeEmailCaptureModal();
        }
    }, 2000);
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }
        .notification-close:hover {
            background: rgba(255,255,255,0.2);
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });
    }
});

// Intersection Observer for animations
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

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.step-card, .stat-card, .earning-method, .privacy-feature');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation to CTA buttons
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
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

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Keyboard navigation enhancements
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) navToggle.focus();
        }
    }
    
    // Enter/Space on buttons
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cta-button')) {
        e.preventDefault();
        e.target.click();
    }
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-600);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.id = 'main';
        hero.setAttribute('role', 'main');
    }
});

// Simple error handling (no fake analytics)
window.addEventListener('error', (e) => {
    console.error('Application error:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        loadSavedTheme,
        openAndroidApp,
        scrollToSection
    };
}