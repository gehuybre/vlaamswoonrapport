const ZOOM_START = 0.2;
const ZOOM_END = 0.8;
const SCROLL_BUFFER = 50;

function initializeScrollEffects(gemeente) {
    const mapContainer = document.getElementById('map-container');
    const contentWrapper = document.querySelector('.content-wrapper');
    const sections = document.querySelectorAll('.section-container'); // Selecteer alle secties
    let isInitialScroll = true;
    let initialScrollTop = 0;
    let lastScrollTop = 0;
    let ticking = false;

    function updateScrollEffects() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerHeight = mapContainer.offsetHeight;

        if (isInitialScroll) {
            if (Math.abs(scrollTop - initialScrollTop) > SCROLL_BUFFER) {
                isInitialScroll = false;
            } else {
                ticking = false;
                return;
            }
        }

        let progress = Math.min(1, Math.max(0, scrollTop / containerHeight));

        if (progress < ZOOM_START) {
            progress = 0;
        } else if (progress > ZOOM_END) {
            progress = 1;
        } else {
            progress = (progress - ZOOM_START) / (ZOOM_END - ZOOM_START);
        }

        if (window.zoomToGemeente) {
            window.zoomToGemeente(progress);
        }

        // Beheer alleen de verticale positie van de content-wrapper
        contentWrapper.style.transform = `translateY(${50 * (1 - progress)}px)`;

        // Controleer de zichtbaarheid van elke sectie op basis van scrollpositie
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.classList.add('animated'); // Voeg 'animated' klasse toe als de sectie in beeld is
            }
        });

        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });

    initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

window.initializeScrollEffects = initializeScrollEffects;
