document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const hoverables = document.querySelectorAll('a, button, .btn, .gallery-item, .reel-card, .slider-bar, .slider-button, .dot, .pricing-toggle');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.backgroundColor = 'transparent';
            });
        });
    }

    // 2. Header Scrolled State
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        updateActiveNavLink();
    });

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section, hero');
    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Statistics Counters
    const statsSection = document.querySelector('.about-section');
    const counterElements = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    function animateCounters() {
        counterElements.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 2000; // ms
            const stepTime = Math.max(Math.floor(duration / target), 15);
            let current = 0;

            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    counter.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    counter.textContent = current + suffix;
                }
            }, stepTime);
        });
    }

    if (statsSection && counterElements.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                animateCounters();
                countersAnimated = true;
            }
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    // 5. Gallery Masonry Lightbox
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentGalleryIndex = 0;
    const galleryImages = [];

    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            galleryImages.push(img.src);
            item.addEventListener('click', () => {
                currentGalleryIndex = index;
                openLightbox(img.src);
            });
        }
    });

    function openLightbox(src) {
        if (lightbox && lightboxImg) {
            lightboxImg.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    function showNextImage() {
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        if (lightboxImg) lightboxImg.src = galleryImages[currentGalleryIndex];
    }

    function showPrevImage() {
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        if (lightboxImg) lightboxImg.src = galleryImages[currentGalleryIndex];
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    // 6. Reels Drag Slider & Unmuted Click Behavior
    const reelsWrapper = document.querySelector('.reels-slider-wrapper');
    const reelsTrack = document.querySelector('.reels-track');
    let isDragging = false;
    let startX;
    let scrollLeft;

    if (reelsWrapper && reelsTrack) {
        // Drag to scroll handling for Desktop
        reelsTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - reelsWrapper.offsetLeft;
            scrollLeft = reelsWrapper.scrollLeft;
            reelsTrack.style.cursor = 'grabbing';
        });

        reelsTrack.addEventListener('mouseleave', () => {
            isDragging = false;
            reelsTrack.style.cursor = 'grab';
        });

        reelsTrack.addEventListener('mouseup', () => {
            isDragging = false;
            reelsTrack.style.cursor = 'grab';
        });

        reelsTrack.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - reelsWrapper.offsetLeft;
            const walk = (x - startX) * 1.5; // scroll speed multiplier
            reelsWrapper.scrollLeft = scrollLeft - walk;
        });

        // Touch events (for browsers/devices that don't support smooth native touch or for mouse emulation)
        reelsTrack.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - reelsWrapper.offsetLeft;
            scrollLeft = reelsWrapper.scrollLeft;
        }, { passive: true });

        reelsTrack.addEventListener('touchend', () => {
            isDragging = false;
        });

        reelsTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - reelsWrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            reelsWrapper.scrollLeft = scrollLeft - walk;
        }, { passive: true });

        // Play-Once-Unmuted Behavior
        const reelCards = document.querySelectorAll('.reel-card');
        reelCards.forEach(card => {
            const video = card.querySelector('.reel-video');
            const overlay = card.querySelector('.reel-overlay');
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                if (video) {
                    if (video.paused) {
                        // Pause all other reels
                        reelCards.forEach(otherCard => {
                            const otherVideo = otherCard.querySelector('.reel-video');
                            const otherOverlay = otherCard.querySelector('.reel-overlay');
                            if (otherVideo && otherVideo !== video) {
                                otherVideo.pause();
                                otherVideo.muted = true;
                                otherVideo.currentTime = 0;
                                if (otherOverlay) otherOverlay.style.opacity = '1';
                            }
                        });
                        
                        // Play this reel unmuted once
                        video.muted = false;
                        video.currentTime = 0;
                        video.play();
                        if (overlay) overlay.style.opacity = '0';
                    } else {
                        // If already playing, pause and reset
                        video.pause();
                        video.muted = true;
                        video.currentTime = 0;
                        if (overlay) overlay.style.opacity = '1';
                    }
                }
            });
            
            if (video) {
                video.addEventListener('ended', () => {
                    video.pause();
                    video.muted = true;
                    video.currentTime = 0;
                    if (overlay) overlay.style.opacity = '1';
                });
            }
        });
    }

    // 7. Before/After Transformation Slider
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const beforeImage = document.querySelector('.image-before');
    const sliderBar = document.querySelector('.slider-bar');
    const sliderButton = document.querySelector('.slider-button');
    let isSliderDragging = false;

    if (sliderWrapper && beforeImage && sliderBar && sliderButton) {
        const moveSlider = (clientX) => {
            const rect = sliderWrapper.getBoundingClientRect();
            let x = clientX - rect.left;
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;
            
            const percentage = (x / rect.width) * 100;
            beforeImage.style.clipPath = 'inset(0 ' + (100 - percentage) + '% 0 0)';
            sliderBar.style.left = percentage + '%';
            sliderButton.style.left = percentage + '%';
        };

        const startDragging = () => { isSliderDragging = true; };
        const stopDragging = () => { isSliderDragging = false; };

        sliderButton.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', (e) => {
            if (isSliderDragging) moveSlider(e.clientX);
        });

        // Mobile touch support
        sliderButton.addEventListener('touchstart', startDragging);
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', (e) => {
            if (isSliderDragging) moveSlider(e.touches[0].clientX);
        });

        // Click to slide
        sliderWrapper.addEventListener('click', (e) => {
            if (e.target !== sliderButton) moveSlider(e.clientX);
        });
    }

    // 8. Pricing Plan Duration Tabs Selector
    const tabButtons = document.querySelectorAll('.pricing-tab-btn');
    const planPrices = {
        // duration key: [Basic Price, Cardio Price, Personal Training Price]
        "1": ["₹1,000", "₹1,500", "₹5,000"],
        "3": ["₹2,500", "₹3,500", "₹12,000"],
        "6": ["₹4,500", "₹6,000", "On Request"],
        "12": ["₹7,500", "₹9,000", "On Request"]
    };
    const priceElements = document.querySelectorAll('.plan-price');
    const pricePeriods = document.querySelectorAll('.plan-price-period');

    if (tabButtons.length > 0 && priceElements.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const duration = btn.getAttribute('data-duration');
                const prices = planPrices[duration];

                priceElements.forEach((priceEl, idx) => {
                    const targetPrice = prices[idx];
                    
                    // Animate change
                    priceEl.style.transform = 'scale(0.8)';
                    priceEl.style.opacity = '0';
                    
                    setTimeout(() => {
                        priceEl.textContent = targetPrice;
                        priceEl.style.transform = 'scale(1)';
                        priceEl.style.opacity = '1';
                    }, 200);

                    if (pricePeriods[idx]) {
                        pricePeriods[idx].textContent = targetPrice === "On Request" ? "" : `/ ${duration} ${duration === "1" ? "month" : "months"}`;
                    }
                });
            });
        });
    }

    // 9. Testimonials Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.testimonials-dots');
    const track = document.querySelector('.testimonials-track');
    let currentTestimonialIndex = 0;

    if (track && testimonialSlides.length > 0 && dotsContainer) {
        // Create dots
        testimonialSlides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToTestimonial(idx));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.dot');

        function goToTestimonial(index) {
            currentTestimonialIndex = index;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
            });
        }

        // Auto rotation
        let autoRotate = setInterval(() => {
            let nextIndex = (currentTestimonialIndex + 1) % testimonialSlides.length;
            goToTestimonial(nextIndex);
        }, 5000);

        // Pause on hover
        track.addEventListener('mouseenter', () => clearInterval(autoRotate));
        track.addEventListener('mouseleave', () => {
            autoRotate = setInterval(() => {
                let nextIndex = (currentTestimonialIndex + 1) % testimonialSlides.length;
                goToTestimonial(nextIndex);
            }, 5000);
        });
    }

    // 10. Motivation Quote Rotator
    const quotes = [
        { text: "No excuses. <span>Only results.</span>", author: "- Gym Creed" },
        { text: "Your only competition is <span>yesterday.</span>", author: "- Fitness Lore" },
        { text: "Pain is temporary. <span>Pride is forever.</span>", author: "- Champion Mindset" },
        { text: "Discipline creates <span>champions.</span>", author: "- Legacy Fitness" },
        { text: "Consistency beats <span>motivation.</span>", author: "- Daily Habit" },
        { text: "Train hard. <span>Stay humble.</span>", author: "- Athlete Code" }
    ];
    const quoteTextEl = document.querySelector('.motivation-quote');
    const quoteAuthorEl = document.querySelector('.motivation-author');
    let currentQuoteIndex = 0;

    if (quoteTextEl && quoteAuthorEl) {
        setInterval(() => {
            quoteTextEl.style.opacity = '0';
            quoteAuthorEl.style.opacity = '0';

            setTimeout(() => {
                currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
                quoteTextEl.innerHTML = quotes[currentQuoteIndex].text;
                quoteAuthorEl.textContent = quotes[currentQuoteIndex].author;
                
                quoteTextEl.style.opacity = '1';
                quoteAuthorEl.style.opacity = '1';
            }, 500);
        }, 4000);
    }

    // 11. Contact Form Submit and Toast Notifications
    const contactForm = document.getElementById('gymContactForm');
    const toast = document.querySelector('.toast');
    const toastMessage = document.querySelector('.toast-message');

    if (contactForm && toast) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate inputs
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showToast("Please fill in all fields.", "error");
                return;
            }

            // Mock submission success
            showToast("Thank you! Your free trial request is sent.", "success");
            contactForm.reset();
            
            // Trigger layout redraw for floating labels
            const inputs = contactForm.querySelectorAll('.form-input');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('blur'));
            });
        });
    }

    function showToast(msg, type = "success") {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = msg;
        toast.style.borderLeftColor = type === "success" ? "#FF5E00" : "#ff3333";
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }

    // Floating label fallback/helper for prefilled values
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value !== "") {
                input.setAttribute('placeholder-shown', 'false');
            } else {
                input.removeAttribute('placeholder-shown');
            }
        });
    });

    // Toggle Facilities View More/Less
    const toggleBtn = document.getElementById('btn-toggle-facilities');
    const hiddenCards = document.querySelectorAll('.facility-card.hidden-card');
    
    if (toggleBtn && hiddenCards.length > 0) {
        let isExpanded = false;
        const hiddenCardsList = Array.from(hiddenCards);
        
        toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            hiddenCardsList.forEach(card => {
                if (isExpanded) {
                    card.classList.remove('hidden-card');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    // Trigger browser reflow
                    card.offsetHeight;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.classList.add('hidden-card');
                }
            });
            toggleBtn.textContent = isExpanded ? 'View Less' : 'View More';
        });
    }

    // Toggle Equipment View More/Less
    const toggleEqBtn = document.getElementById('btn-toggle-equipment');
    const hiddenEqCards = document.querySelectorAll('.equipment-card.hidden-eq');
    
    if (toggleEqBtn && hiddenEqCards.length > 0) {
        let isExpanded = false;
        const hiddenEqCardsList = Array.from(hiddenEqCards);
        
        toggleEqBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            hiddenEqCardsList.forEach(card => {
                if (isExpanded) {
                    card.classList.remove('hidden-eq');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    // Trigger browser reflow
                    card.offsetHeight;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.classList.add('hidden-eq');
                }
            });
            toggleEqBtn.textContent = isExpanded ? 'View Less' : 'View More';
        });
    }

    // Toggle Gallery View More/Less
    const toggleGalleryBtn = document.getElementById('btn-toggle-gallery');
    const hiddenGalleryItems = document.querySelectorAll('.gallery-item.hidden-gallery');
    
    if (toggleGalleryBtn && hiddenGalleryItems.length > 0) {
        let isExpanded = false;
        const hiddenGalleryItemsList = Array.from(hiddenGalleryItems);
        
        toggleGalleryBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            hiddenGalleryItemsList.forEach(item => {
                if (isExpanded) {
                    item.classList.remove('hidden-gallery');
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    // Trigger browser reflow
                    item.offsetHeight;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                } else {
                    item.classList.add('hidden-gallery');
                }
            });
            toggleGalleryBtn.textContent = isExpanded ? 'View Less' : 'View More';
        });
    // Equipment Carousel Slider (Mouse Drag & Touch Swipe Controls)
    const eqWrapper = document.querySelector('.equipment-slider-wrapper');
    const eqTrack = document.querySelector('.equipment-track');
    const btnEqPrev = document.getElementById('btn-eq-prev');
    const btnEqNext = document.getElementById('btn-eq-next');
    let isEqDragging = false;
    let startEqX;
    let scrollEqLeft;

    if (eqWrapper && eqTrack) {
        // Drag to scroll handling for Desktop
        eqTrack.addEventListener('mousedown', (e) => {
            isEqDragging = true;
            startEqX = e.pageX - eqWrapper.offsetLeft;
            scrollEqLeft = eqWrapper.scrollLeft;
            eqTrack.style.cursor = 'grabbing';
        });

        eqTrack.addEventListener('mouseleave', () => {
            isEqDragging = false;
            eqTrack.style.cursor = 'grab';
        });

        eqTrack.addEventListener('mouseup', () => {
            isEqDragging = false;
            eqTrack.style.cursor = 'grab';
        });

        eqTrack.addEventListener('mousemove', (e) => {
            if (!isEqDragging) return;
            e.preventDefault();
            const x = e.pageX - eqWrapper.offsetLeft;
            const walk = (x - startEqX) * 1.5; // scroll speed multiplier
            eqWrapper.scrollLeft = scrollEqLeft - walk;
        });

        // Touch events for swiping
        eqTrack.addEventListener('touchstart', (e) => {
            isEqDragging = true;
            startEqX = e.touches[0].pageX - eqWrapper.offsetLeft;
            scrollEqLeft = eqWrapper.scrollLeft;
        }, { passive: true });

        eqTrack.addEventListener('touchend', () => {
            isEqDragging = false;
        });

        eqTrack.addEventListener('touchmove', (e) => {
            if (!isEqDragging) return;
            const x = e.touches[0].pageX - eqWrapper.offsetLeft;
            const walk = (x - startEqX) * 1.5;
            eqWrapper.scrollLeft = scrollEqLeft - walk;
        }, { passive: true });

        // Prev/Next Navigation Controls
        if (btnEqPrev && btnEqNext) {
            btnEqNext.addEventListener('click', () => {
                const card = eqWrapper.querySelector('.equipment-card');
                const cardWidth = card ? card.offsetWidth + 30 : 320; // card + gap
                eqWrapper.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });

            btnEqPrev.addEventListener('click', () => {
                const card = eqWrapper.querySelector('.equipment-card');
                const cardWidth = card ? card.offsetWidth + 30 : 320; // card + gap
                eqWrapper.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
        }
    }
});
