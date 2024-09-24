document.addEventListener('DOMContentLoaded', () => {
    // Ensure GSAP and ScrollTrigger are correctly initialized
    gsap.registerPlugin(ScrollTrigger);

    // Function to initialize scroll effects
    function initializeScrollEffects(gemeente) {
        const mapContainer = document.getElementById('map-container');
        const contentWrapper = document.querySelector('.content-wrapper');

        // Scroll-triggered zoom effect on the map
        gsap.to(mapContainer, {
            scrollTrigger: {
                trigger: contentWrapper,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                onUpdate: self => {
                    let progress = self.progress;
                    if (window.zoomToGemeente) {
                        window.zoomToGemeente(progress);
                    }
                }
            }
        });

        // Animate section containers on scroll
        gsap.utils.toArray('.section-container').forEach(section => {
            gsap.fromTo(section, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    // Fade-in Animation for elements with data-animate='fade-in'
    gsap.utils.toArray("[data-animate='fade-in']").forEach((el) => {
        gsap.from(el, {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Slide-in from Left Animation for elements with data-animate='slide-in-left'
    gsap.utils.toArray("[data-animate='slide-in-left']").forEach((el) => {
        gsap.from(el, {
            opacity: 0,
            x: -100,
            duration: 1,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Slide-in from Right Animation for elements with data-animate='slide-in-right'
    gsap.utils.toArray("[data-animate='slide-in-right']").forEach((el) => {
        gsap.from(el, {
            opacity: 0,
            x: 100,
            duration: 1,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Make initializeScrollEffects available globally
    window.initializeScrollEffects = initializeScrollEffects;
});