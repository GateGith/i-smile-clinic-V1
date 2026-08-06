(function() {
    'use strict';

    // === MASONRY GALLERY ===
    function initMasonryGallery() {
        const galleryContainers = document.querySelectorAll('.service-gallery, .gallery-editorial-grid');
        
        galleryContainers.forEach(container => {
            const items = Array.from(container.children);
            if (!items.length) return;

            // Responsive columns count
            const getColumns = () => {
                const width = window.innerWidth;
                if (width >= 1200) return 4;
                if (width >= 992) return 3;
                if (width >= 768) return 2;
                return 1;
            };

            let columns = getColumns();

            const buildMasonry = () => {
                const newColumns = getColumns();
                if (newColumns === columns) return;
                columns = newColumns;

                // Clear and rebuild
                container.innerHTML = '';
                const columnElements = [];
                
                for (let i = 0; i < columns; i++) {
                    const col = document.createElement('div');
                    col.className = 'masonry-col';
                    col.style.cssText = 'display:grid;grid-template-columns:1fr;gap:12px;';
                    columnElements.push(col);
                    container.appendChild(col);
                }

                // Distribute items by shortest column
                items.forEach((item, index) => {
                    const colIndex = index % columns;
                    columnElements[colIndex].appendChild(item);
                });
            };

            buildMasonry();
            window.addEventListener('resize', () => {
                requestAnimationFrame(buildMasonry);
            }, { passive: true });
        });
    }

    // === LIGHTBOX ===
    function initLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item[data-full], .service-gallery-item img');
        if (!galleryItems.length) return;

        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'simple-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop" role="button" tabindex="0" aria-label="Fermer la lightbox"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Fermer" tabindex="0">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-prev" aria-label="Précédent" tabindex="0">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <img src="" alt="" class="lightbox-image">
                <button class="lightbox-next" aria-label="Suivant" tabindex="0">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);

        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');

        let currentIndex = 0;
        let images = [];

        const openLightbox = (index) => {
            currentIndex = index;
            const img = images[index];
            lightboxImg.src = img.dataset.full || img.src;
            lightboxImg.alt = img.alt || 'Image galerie';
            
            const parent = img.closest('.gallery-item, .service-gallery-item');
            const captionText = parent ? parent.querySelector('.caption')?.textContent : '';
            caption.textContent = captionText || '';
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            openLightbox(currentIndex);
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % images.length;
            openLightbox(currentIndex);
        };

        // Event listeners
        galleryItems.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                images = Array.from(galleryItems);
                openLightbox(index);
            });
        });

        backdrop.addEventListener('click', closeLightbox);
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        // Touch support for swipe
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                showNext();
            } else if (touchEndX - touchStartX > swipeThreshold) {
                showPrev();
            }
        };
    }

    // === BEFORE / AFTER SLIDER ===
    function initBeforeAfterSlider() {
        const sliders = document.querySelectorAll('.ba-slider');
        if (!sliders.length) return;

        sliders.forEach(slider => {
            const overlay = slider.querySelector('.ba-overlay');
            const handle = slider.querySelector('.ba-handle');
            if (!overlay || !handle) return;

            // Set initial position to 50%
            const setPosition = (percent) => {
                const clamped = Math.max(0, Math.min(100, percent));
                overlay.style.width = clamped + '%';
                handle.style.left = clamped + '%';
            };

            setPosition(50);

            let isDragging = false;

            const getPosition = (clientX) => {
                const rect = slider.getBoundingClientRect();
                const x = clientX - rect.left;
                return (x / rect.width) * 100;
            };

            const startDrag = (e) => {
                isDragging = true;
                slider.classList.add('is-dragging');
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', endDrag);
                e.preventDefault();
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                setPosition(getPosition(e.clientX));
            };

            const endDrag = () => {
                isDragging = false;
                slider.classList.remove('is-dragging');
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', endDrag);
            };

            // Pointer events (mouse + touch + stylus)
            handle.addEventListener('pointerdown', startDrag);

            // Touch support fallback
            let touchMoveHandler = (e) => {
                if (e.changedTouches && e.changedTouches[0]) {
                    setPosition(getPosition(e.changedTouches[0].clientX));
                }
            };

            handle.addEventListener('touchstart', (e) => {
                isDragging = true;
                document.addEventListener('touchmove', touchMoveHandler, { passive: true });
                document.addEventListener('touchend', () => {
                    isDragging = false;
                    document.removeEventListener('touchmove', touchMoveHandler);
                }, { once: true });
            }, { passive: true });

            // Keyboard support
            handle.setAttribute('tabindex', '0');
            handle.setAttribute('role', 'slider');
            handle.setAttribute('aria-valuemin', '0');
            handle.setAttribute('aria-valuemax', '100');
            handle.setAttribute('aria-valuenow', '50');
            handle.setAttribute('aria-label', 'Curseur de comparaison avant/après');

            handle.addEventListener('keydown', (e) => {
                const step = 5;
                const current = parseFloat(overlay.style.width) || 50;
                
                if (e.key === 'ArrowLeft') {
                    setPosition(current - step);
                    e.preventDefault();
                }
                if (e.key === 'ArrowRight') {
                    setPosition(current + step);
                    e.preventDefault();
                }
            });

            // Click on slider to jump
            slider.addEventListener('click', (e) => {
                if (e.target !== handle) {
                    setPosition(getPosition(e.clientX));
                }
            });

            // Responsive: maintain percentage on resize
            window.addEventListener('resize', () => {
                const current = parseFloat(overlay.style.width) || 50;
                setPosition(current);
            }, { passive: true });
        });
    }

    // === LAZY LOADING FOR GALLERY IMAGES ===
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('.gallery-item img, .service-gallery-item img');
        
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            lazyImages.forEach(img => {
                img.loading = 'lazy';
                img.decoding = 'async';
            });
        } else {
            // Fallback with Intersection Observer
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        lazyObserver.unobserve(img);
                    }
                });
            }, { threshold: 0.1, rootMargin: '50px' });

            lazyImages.forEach(img => lazyObserver.observe(img));
        }
    }

    // === IMAGE PRELOAD ON HOVER ===
    function initPreloadOnHover() {
        const galleryItems = document.querySelectorAll('.gallery-item, .service-gallery-item');
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;

            item.addEventListener('mouseenter', () => {
                if (!img.complete && img.dataset.src) {
                    const preload = new Image();
                    preload.src = img.dataset.src;
                }
            }, { once: true });
        });
    }

    // === RESPONSIVE GALLERY ===
    function initResponsiveGallery() {
        const galleries = document.querySelectorAll('.gallery-editorial-grid, .service-gallery');
        
        const adjustGallery = () => {
            galleries.forEach(gallery => {
                const items = gallery.querySelectorAll('.gallery-item-large, .gallery-item-medium, .gallery-item-small, .service-gallery-item');
                const width = window.innerWidth;
                
                items.forEach(item => {
                    if (width < 768) {
                        // Mobile: all items span 1 column
                        item.style.gridColumn = '1';
                    } else if (width < 1024) {
                        // Tablet: adjust based on class
                        if (item.classList.contains('gallery-item-large')) {
                            item.style.gridColumn = 'span 2';
                        } else {
                            item.style.gridColumn = '1';
                        }
                    } else {
                        // Desktop: use original classes
                        if (item.classList.contains('gallery-item-large')) {
                            item.style.gridColumn = 'span 2';
                        } else if (item.classList.contains('gallery-item-medium')) {
                            item.style.gridColumn = '1';
                        } else if (item.classList.contains('gallery-item-small')) {
                            item.style.gridColumn = '1';
                        }
                    }
                });
            });
        };

        adjustGallery();
        window.addEventListener('resize', adjustGallery, { passive: true });
    }

    // === INITIALIZE ALL ===
    document.addEventListener('DOMContentLoaded', () => {
        initMasonryGallery();
        initLightbox();
        initBeforeAfterSlider();
        initLazyLoading();
        initPreloadOnHover();
        initResponsiveGallery();
    });

    // Expose functions globally if needed
    window.GalleryUtils = {
        initMasonryGallery,
        initLightbox,
        initBeforeAfterSlider,
        initLazyLoading,
        initPreloadOnHover,
        initResponsiveGallery
    };

})();
