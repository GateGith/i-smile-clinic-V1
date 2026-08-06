(function() {
    'use strict';

    // === INSTAGRAM EMBED HELPER ===
    // This file handles Instagram embeds using existing local video assets
    // No external API calls or downloads required

    function initInstagramVideos() {
        const videoCards = document.querySelectorAll('.instagram-video-card, .video-card');
        if (!videoCards.length) return;

        videoCards.forEach(card => {
            const video = card.querySelector('video');
            if (!video) return;

            // Ensure proper attributes for mobile compatibility
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('muted', '');
            video.setAttribute('preload', 'metadata');
            video.setAttribute('loop', '');

            // Lazy load video source if data-src is present
            const dataSrc = video.getAttribute('data-src');
            if (dataSrc && !video.getAttribute('src')) {
                const loadVideo = () => {
                    if (!video.getAttribute('src')) {
                        video.src = dataSrc;
                        video.load();
                    }
                };

                // Load on first interaction
                const playButton = card.querySelector('.btn-play');
                if (playButton) {
                    playButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        loadVideo();
                        video.play().catch(() => {});
                    });
                } else {
                    // Auto-play if no play button
                    video.addEventListener('mouseenter', loadVideo, { once: true });
                }
            }

            // Add play/pause toggle on video click
            video.addEventListener('click', () => {
                if (video.paused) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });

            // Add visual feedback for playing state
            video.addEventListener('play', () => {
                card.classList.add('playing');
            });

            video.addEventListener('pause', () => {
                card.classList.remove('playing');
            });
        });
    }

    // === INSTAGRAM LIGHTBOX (for images) ===
    function initInstagramLightbox() {
        const instagramImages = document.querySelectorAll('[data-instagram]');
        if (!instagramImages.length) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'instagram-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop" role="button" tabindex="0" aria-label="Fermer"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Fermer" tabindex="0">
                    <i class="fas fa-times"></i>
                </button>
                <img src="" alt="" class="lightbox-image">
                <div class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);

        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');

        const openLightbox = (img) => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || 'Image Instagram';
            caption.textContent = img.getAttribute('data-caption') || '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
            caption.textContent = '';
        };

        instagramImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => openLightbox(img));
        });

        backdrop.addEventListener('click', closeLightbox);
        closeBtn.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // === INSTAGRAM CAROUSEL ===
    function initInstagramCarousel() {
        const carousels = document.querySelectorAll('.instagram-carousel');
        if (!carousels.length) return;

        carousels.forEach(carousel => {
            const items = carousel.querySelectorAll('.carousel-item');
            if (!items.length) return;

            let currentIndex = 0;
            const total = items.length;

            const showItem = (index) => {
                items.forEach((item, i) => {
                    item.classList.toggle('active', i === index);
                });
            };

            const next = () => {
                currentIndex = (currentIndex + 1) % total;
                showItem(currentIndex);
            };

            const prev = () => {
                currentIndex = (currentIndex - 1 + total) % total;
                showItem(currentIndex);
            };

            // Navigation buttons
            const prevBtn = carousel.querySelector('.carousel-prev');
            const nextBtn = carousel.querySelector('.carousel-next');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    prev();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    next();
                });
            }

            // Touch support
            let touchStartX = 0;
            let touchEndX = 0;

            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            const handleSwipe = () => {
                const threshold = 50;
                if (touchStartX - touchEndX > threshold) {
                    next();
                } else if (touchEndX - touchStartX > threshold) {
                    prev();
                }
            };

            // Auto-advance (optional)
            const autoAdvance = carousel.getAttribute('data-auto');
            if (autoAdvance) {
                const interval = parseInt(autoAdvance) || 5000;
                setInterval(next, interval);
            }

            // Initialize
            showItem(currentIndex);
        });
    }

    // === INSTAGRAM GRID (MASONRY FOR INSTAGRAM IMAGES) ===
    function initInstagramGrid() {
        const grids = document.querySelectorAll('.instagram-grid');
        if (!grids.length) return;

        const buildGrid = (grid) => {
            const items = Array.from(grid.children);
            const width = window.innerWidth;
            let columns = 3;

            if (width < 768) columns = 1;
            else if (width < 1024) columns = 2;

            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = '16px';

            items.forEach(item => {
                item.style.width = '100%';
                item.style.height = 'auto';
            });
        };

        grids.forEach(grid => {
            buildGrid(grid);
            window.addEventListener('resize', () => {
                requestAnimationFrame(() => buildGrid(grid));
            }, { passive: true });
        });
    }

    // === INSTAGRAM OFFICIAL EMBED (if needed) ===
    function loadInstagramEmbed() {
        // Load official Instagram embed script only if Instagram embeds are present
        const instagramEmbeds = document.querySelectorAll('blockquote.instagram-media');
        if (!instagramEmbeds.length) return;

        const script = document.createElement('script');
        script.async = true;
        script.src = '//www.instagram.com/embed.js';
        document.body.appendChild(script);
    }

    // === INITIALIZE ALL ===
    document.addEventListener('DOMContentLoaded', () => {
        initInstagramVideos();
        initInstagramLightbox();
        initInstagramCarousel();
        initInstagramGrid();
        loadInstagramEmbed();
    });

    // Expose functions globally if needed
    window.InstagramUtils = {
        initInstagramVideos,
        initInstagramLightbox,
        initInstagramCarousel,
        initInstagramGrid,
        loadInstagramEmbed
    };

})();
