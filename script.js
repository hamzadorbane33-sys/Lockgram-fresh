// LockGram - Interactive Functionality
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initSmoothScrolling();
    initVideoControls();
    initScrollAnimations();
    initMobileMenu();
    initNavbarScroll();
    initFAQAccordion();
    initAnalytics();
    
    console.log('🚀 LockGram app initialized successfully!');
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });
}

// Video Controls and Optimization
function initVideoControls() {
    const videoContainer = document.querySelector('.video-container');
    const videoIframe = document.querySelector('.video-container iframe');
    
    if (videoContainer && videoIframe) {
        // Lazy load video when in viewport
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const src = videoIframe.src;
                    if (!src.includes('autoplay=1')) {
                        videoIframe.src = src + '&autoplay=1';
                    }
                }
            });
        }, { threshold: 0.5 });
        
        videoObserver.observe(videoContainer);
        
        // Add click to play/pause
        videoContainer.addEventListener('click', function() {
            const currentSrc = videoIframe.src;
            if (currentSrc.includes('autoplay=1')) {
                videoIframe.src = currentSrc.replace('autoplay=1', 'autoplay=0');
            } else {
                videoIframe.src = currentSrc + '&autoplay=1';
            }
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .step, .faq-item');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Stagger animation for grid items
                if (entry.target.parentElement.classList.contains('features-grid') ||
                    entry.target.parentElement.classList.contains('testimonials-grid')) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.classList.add('scroll-animate');
        animationObserver.observe(el);
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
}

// FAQ Accordion
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
                
                // Track FAQ interaction
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'faq_interaction', {
                        'event_category': 'engagement',
                        'event_label': question.querySelector('h3').textContent
                    });
                }
            });
        }
    });
}

// Analytics and Tracking
function initAnalytics() {
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('primary') ? 'primary' : 'secondary';
            
            // Track in Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    'event_category': 'engagement',
                    'event_label': buttonText,
                    'button_type': buttonType
                });
            }
            
            // Track in custom analytics
            trackEvent('cta_click', {
                button_text: buttonText,
                button_type: buttonType,
                page_section: getCurrentSection()
            });
        });
    });
    
    // Track video interactions
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.addEventListener('click', function() {
            trackEvent('video_interaction', {
                action: 'play_toggle',
                page_section: 'hero'
            });
        });
    }
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;
            
            // Track milestones
            if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                trackEvent('scroll_depth', { depth: '25%' });
            } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                trackEvent('scroll_depth', { depth: '50%' });
            } else if (maxScrollDepth >= 75 && maxScrollDepth < 90) {
                trackEvent('scroll_depth', { depth: '75%' });
            } else if (maxScrollDepth >= 90) {
                trackEvent('scroll_depth', { depth: '90%' });
            }
        }
    }, 1000));
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = section.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function openTelegramApp() {
    // Track the launch attempt
    trackEvent('telegram_launch', {
        source: 'cta_button',
        page_section: getCurrentSection()
    });
    
    // Try to open Telegram Mini-App
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            // If running in Telegram WebApp
            window.Telegram.WebApp.expand();
        } else {
            // Fallback to opening Telegram with LockGram bot
            const telegramUrl = 'https://t.me/LockGramBot';
            window.open(telegramUrl, '_blank');
        }
    } catch (error) {
        // Fallback for non-Telegram environments
        const telegramUrl = 'https://t.me/LockGramBot';
        window.open(telegramUrl, '_blank');
    }
}

function getCurrentSection() {
    const sections = ['home', 'features', 'guide', 'security', 'faq'];
    const scrollPos = window.pageYOffset + 100;
    
    for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
            const sectionTop = element.offsetTop;
            const sectionBottom = sectionTop + element.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                return section;
            }
        }
    }
    
    return 'unknown';
}

function trackEvent(eventName, eventData = {}) {
    // Custom analytics tracking
    console.log(`📊 Event: ${eventName}`, eventData);
    
    // Send to analytics service (placeholder)
    // This would typically send to Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Store in localStorage for offline tracking
    const events = JSON.parse(localStorage.getItem('lockgram_events') || '[]');
    events.push({
        event: eventName,
        data: eventData,
        timestamp: Date.now(),
        url: window.location.href
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('lockgram_events', JSON.stringify(events));
}

function throttle(func, wait) {
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

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Enhanced User Experience Features
class LockGramUX {
    constructor() {
        this.init();
    }
    
    init() {
        this.initTypingEffect();
        this.initParticleBackground();
        this.initProgressBar();
        this.initKeyboardNavigation();
    }
    
    // Typing effect for hero title
    initTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;
        
        const text = heroTitle.innerHTML;
        const words = text.split(' ');
        heroTitle.innerHTML = '';
        
        let currentWordIndex = 0;
        const typingSpeed = 100;
        
        const typeWord = () => {
            if (currentWordIndex < words.length) {
                const span = document.createElement('span');
                span.textContent = words[currentWordIndex] + (currentWordIndex < words.length - 1 ? ' ' : '');
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                heroTitle.appendChild(span);
                
                setTimeout(() => {
                    span.style.transition = 'all 0.3s ease';
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, 50);
                
                currentWordIndex++;
                setTimeout(typeWord, typingSpeed);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWord, 500);
    }
    
    // Particle background effect
    initParticleBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        
        hero.appendChild(canvas);
        
        const resizeCanvas = () => {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 229, 255, ${particle.opacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    // Reading progress bar
    initProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.style.position = 'fixed';
        progressBar.style.top = '0';
        progressBar.style.left = '0';
        progressBar.style.width = '0%';
        progressBar.style.height = '3px';
        progressBar.style.background = 'linear-gradient(90deg, #00E5FF, #8B5CF6)';
        progressBar.style.zIndex = '9999';
        progressBar.style.transition = 'width 0.1s ease';
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        });
    }
    
    // Enhanced keyboard navigation
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Press 'L' to launch LockGram
            if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    openTelegramApp();
                }
            }
            
            // Press 'H' to go to home
            if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    scrollToSection('home');
                }
            }
            
            // Press 'F' to toggle FAQ
            if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    scrollToSection('faq');
                }
            }
        });
    }
}

// Service Worker Registration and Management
class LockGramSW {
    constructor() {
        this.init();
    }
    
    init() {
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
            this.setupMessageHandling();
        }
    }
    
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }
    
    setupMessageHandling() {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                console.log('📦 Cache updated:', event.data.url);
            }
        });
    }
    
    showUpdateNotification() {
        // Simple notification - could be enhanced with a modal
        if (confirm('A new version of LockGram is available. Reload to update?')) {
            window.location.reload();
        }
    }
}

// Performance Monitoring
class LockGramPerformance {
    constructor() {
        this.init();
    }
    
    init() {
        this.measurePageLoad();
        this.measureCoreWebVitals();
        this.monitorResourceLoading();
    }
    
    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            
            trackEvent('page_performance', {
                load_time: loadTime,
                dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                page_load_time: navigation.loadEventEnd - navigation.fetchStart
            });
        });
    }
    
    measureCoreWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            trackEvent('web_vitals', {
                metric: 'LCP',
                value: lastEntry.startTime
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                trackEvent('web_vitals', {
                    metric: 'FID',
                    value: entry.processingStart - entry.startTime
                });
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            trackEvent('web_vitals', {
                metric: 'CLS',
                value: clsValue
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    monitorResourceLoading() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 1000) { // Slow resources
                    trackEvent('slow_resource', {
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize || 0
                    });
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced UX features
    new LockGramUX();
    
    // Initialize service worker
    new LockGramSW();
    
    // Initialize performance monitoring
    new LockGramPerformance();
});

// Error Handling
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
    trackEvent('promise_rejection', {
        reason: e.reason.toString()
    });
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.openTelegramApp = openTelegramApp;
window.trackEvent = trackEvent;