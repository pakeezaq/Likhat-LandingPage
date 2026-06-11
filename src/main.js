// Scroll Reveal with Premium Intersection Observer
const observerOptions = {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe reveal elements, including new reveal-3d animations
document.querySelectorAll('.fade-in, .reveal-left, .reveal-right, .reveal-scale, .reveal-3d').forEach(sec => {
    observer.observe(sec);
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ==========================================
// PREMIUM SCROLL-DRIVEN DYNAMICS
// ==========================================

const navbar = document.querySelector('.navbar');

// Create a premium dynamic scroll progress bar at the top of the viewport
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

// Cache parallax nodes to optimize performance
const parallaxWrappers = document.querySelectorAll('.parallax-wrapper');
const ambientGlows = document.querySelectorAll('.ambient-glow');

let ticking = false;

function handleScrollEffects() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;

    // 1. Fixed Navbar state transition (transparent to premium condensed glass)
    if (navbar) {
        if (scrolled > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // 2. Update Scroll Progress indicator
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolledPercent = height > 0 ? (winScroll / height) * 100 : 0;
    progressBar.style.width = `${scrolledPercent}%`;

    const isMobile = window.innerWidth <= 900;

    // 3. Smooth parallax translation for marked elements (only on desktop > 900px)
    parallaxWrappers.forEach((el) => {
        if (isMobile) {
            el.style.transform = 'none';
            return;
        }

        const parent = el.parentElement;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Only calculate and shift if the element's parent container is visible on screen
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const speed = parseFloat(el.getAttribute('data-speed')) || -0.05;
                
                // Calculate the element's vertical center relative to viewport center
                const elementCenter = rect.top + rect.height / 2;
                const viewportCenter = viewportHeight / 2;
                const distanceFromCenter = viewportCenter - elementCenter;

                // Scale shift based on distance, preventing infinite drift far down the page
                const yOffset = distanceFromCenter * speed;
                el.style.transform = `translateY(${yOffset}px)`;
            }
        }
    });

    // 4. Smooth floating parallax for ambient glow background circles (only on desktop > 900px)
    ambientGlows.forEach((glow, idx) => {
        if (isMobile) {
            glow.style.transform = 'none';
            return;
        }
        const direction = (idx % 2 === 0) ? 1 : -1;
        const speed = (idx % 3 + 1) * 0.035;
        const yOffset = scrolled * speed * direction;
        glow.style.transform = `translateY(${yOffset}px)`;
    });

    ticking = false;
}

// Use RequestAnimationFrame inside scroll listener for 60fps/120fps smooth performance
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleScrollEffects);
        ticking = true;
    }
}, { passive: true });

// Fire once on load to ensure proper initial state
window.addEventListener('DOMContentLoaded', handleScrollEffects);
