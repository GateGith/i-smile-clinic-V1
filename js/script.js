document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // === NAVIGATION MOBILE ===
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const header = document.querySelector('.header');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    }

    // === HEADER SCROLL EFFECT ===
    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // === HERO VIDEO iPHONE AUTOPLAY FIX ===
    const heroVideo = document.getElementById('heroVideo');
    
    if (heroVideo) {
        // Try to play on load
        heroVideo.play().catch(function(error) {
            console.log('Autoplay prevented, waiting for user interaction');
        });
        
        // Start video on first user interaction
        const startVideo = function() {
            heroVideo.play().catch(function(e) {});
            // Remove listeners after first interaction
            document.removeEventListener('touchstart', startVideo);
            document.removeEventListener('scroll', startVideo);
            document.removeEventListener('click', startVideo);
        };
        
        // Listen for user interactions
        document.addEventListener('touchstart', startVideo, { once: true });
        document.addEventListener('scroll', startVideo, { once: true });
        document.addEventListener('click', startVideo, { once: true });
        
        // Ensure video is loaded
        heroVideo.addEventListener('loadeddata', function() {
            heroVideo.play().catch(function(e) {});
        });
    }

    // === SCROLL REVEAL ANIMATIONS ===
    const revealElements = document.querySelectorAll('.service-premium-card, .gallery-item-large, .gallery-item-medium, .gallery-item-small, .instagram-video-card, .review-card, .contact-info, .form-container, .section-header, .about-text, .about-image, .team-card, .value-card');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // === SMOOTH SCROLL FOR ANCHOR LINKS ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // === LAZY LOADING FOR IMAGES ===
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                    }
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        lazyImages.forEach(img => lazyImageObserver.observe(img));
    }

    // === CTA BUTTONS ===
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-whatsapp, .contact-link');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Track clicks (optional analytics)
            console.log('CTA clicked:', this.textContent.trim());
        });
    });

    // === FORM SUBMISSION HANDLING ===
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            formStatus.textContent = 'Envoi en cours...';
            formStatus.className = 'form-status';

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formStatus.textContent = 'Merci ! Votre message a été envoyé avec succès.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    formStatus.textContent = 'Une erreur est survenue. Veuillez réessayer.';
                    formStatus.classList.add('error');
                }
            })
            .catch(error => {
                formStatus.textContent = 'Une erreur est survenue. Veuillez réessayer.';
                formStatus.classList.add('error');
                console.error('Form submission error:', error);
            });
        });
    }

    // === ACCESSIBILITY ENHANCEMENTS ===
    
    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'visually-hidden';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '0';
    skipLink.style.left = '0';
    skipLink.style.padding = '10px 20px';
    skipLink.style.background = 'var(--teal)';
    skipLink.style.color = 'var(--white)';
    skipLink.style.zIndex = '9999';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.addEventListener('focus', () => {
        skipLink.classList.remove('visually-hidden');
    });
    skipLink.addEventListener('blur', () => {
        skipLink.classList.add('visually-hidden');
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // === KEYBOARD NAVIGATION ===
    document.addEventListener('keydown', (e) => {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            const icon = navToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
            navToggle.focus();
        }
    });

    // === PERFORMANCE OPTIMIZATIONS ===
    
    // Debounce scroll events
    function debounce(func, wait) {
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

    // Optimize scroll performance
    const optimizedScroll = debounce(() => {
        // Add any scroll-dependent logic here
    }, 10);

    window.addEventListener('scroll', optimizedScroll, { passive: true });

    // === PRELOAD CRITICAL ASSETS ===
    const preloadCritical = () => {
        const criticalImages = document.querySelectorAll('img[loading="eager"], .hero-video-section img');
        criticalImages.forEach(img => {
            img.loading = 'eager';
            img.decoding = 'async';
        });
    };
    
    preloadCritical();

    // === COUNTER ANIMATIONS (if needed) ===
    const animateCounters = () => {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };

    // === INTERSECTION OBSERVER FOR COUNTERS ===
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    });

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => counterObserver.observe(counter));

    // === FAQ TOGGLES (if present) ===
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = answer.style.display === 'block';
                answer.style.display = isOpen ? 'none' : 'block';
                question.setAttribute('aria-expanded', !isOpen);
            });
        }
    });

    // === VIDEO LAZY LOADING ===
    const videoCards = document.querySelectorAll('.local-video');
    videoCards.forEach(video => {
        video.addEventListener('play', () => {
            video.parentElement.classList.add('playing');
        });
        
        video.addEventListener('pause', () => {
            video.parentElement.classList.remove('playing');
        });
    });

    // === SOCIAL SHARE BUTTONS (if present) ===
    const shareButtons = document.querySelectorAll('[data-share]');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-share');
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(document.title);
            
            let shareUrl = '';
            if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            } else if (platform === 'twitter') {
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            } else if (platform === 'linkedin') {
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // === BACK TO TOP BUTTON (if present) ===
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const toggleBackToTop = () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        };
        
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // === PRINT STYLES ENHANCEMENT ===
    const addPrintStyles = () => {
        const printStyle = document.createElement('style');
        printStyle.media = 'print';
        printStyle.textContent = `
            @media print {
                .header, .bottom-bar, .floating-cta-wa { display: none !important; }
                body { font-size: 12pt; }
                a { text-decoration: underline; }
                a[href]::after { content: " (" attr(href) ")"; }
            }
        `;
        document.head.appendChild(printStyle);
    };
    
    addPrintStyles();

    // === PAGE LOAD COMPLETE ===
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Remove any loading states
        const loaders = document.querySelectorAll('.loading, .skeleton');
        loaders.forEach(loader => {
            loader.classList.remove('loading', 'skeleton');
        });
    });

    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    // === PERFORMANCE MARK ===
    if (window.performance && window.performance.mark) {
        window.performance.mark('dom-interactive');
    }
});
