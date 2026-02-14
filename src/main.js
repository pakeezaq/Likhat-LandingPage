
// Scroll Reveal
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(sec => observer.observe(sec));

// FAQ Accordion Logic
// (No FAQ elements currently in index.html, but keeping structure ready)

// Urgency Logic
const API_BASE = '/api'; // Relative for Vercel functions
const urgencyBadge = document.getElementById('urgency-badge');
const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const messageEl = document.getElementById('form-message');
const submitBtn = document.querySelector('button[type="submit"]');

async function updateStatus() {
    try {
        const res = await fetch(`${API_BASE}/status`);
        if (res.ok) {
            const data = await res.json();
            const left = Math.max(0, 50 - data.count);

            if (urgencyBadge) {
                if (left <= 0) {
                    urgencyBadge.textContent = "Beta Full • Waitlist Active";
                    urgencyBadge.style.color = "#E07A5F";
                    urgencyBadge.style.borderColor = "#E07A5F";
                    urgencyBadge.style.background = "#FFF5F5";
                } else {
                    urgencyBadge.textContent = `Batch 1: ${left} Spots Left`;
                    urgencyBadge.style.borderColor = "#C8AA6E";
                    urgencyBadge.style.color = "#8C7342";
                    urgencyBadge.style.background = "#FFFCF5";
                }
            }
        }
    } catch (e) {
        if (urgencyBadge) urgencyBadge.textContent = "Limited Access";
    }
}
updateStatus();

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        if (!email) return;

        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Verifying...";
        submitBtn.disabled = true;
        messageEl.textContent = "";
        messageEl.style.color = "#333";

        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                messageEl.textContent = "Spot Reserved. Welcome.";
                messageEl.style.color = "#164E55";
                emailInput.value = "";
                submitBtn.textContent = "Confirmed";
                updateStatus();
            } else if (res.status === 409) {
                throw new Error("Already registered.");
            } else {
                throw new Error("Error connecting.");
            }
        } catch (err) {
            messageEl.textContent = err.message || "Failed";
            messageEl.style.color = "#E07A5F";
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            console.error(err);
        }
    });
}
