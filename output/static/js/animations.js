function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.getAttribute('data-animate');
                element.classList.add(animationType, 'animated');
                observer.unobserve(element); // Stop observing once the animation starts
            }
        });
    }, {
        threshold: 0.2, // Start animation when 20% of the element is visible
        rootMargin: '0px 0px -20% 0px' // Adjust the root margin to trigger the animation earlier
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize animations when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', initAnimations);
