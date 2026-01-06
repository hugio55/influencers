// Global data
let influencersData = [];

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Format followers for display (e.g., 14700000 -> "14.7M")
function formatFollowers(num) {
    if (num >= 1000000) {
        const millions = num / 1000000;
        if (millions >= 10) return `${Math.round(millions)}M`;
        return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (num >= 1000) {
        const thousands = num / 1000;
        if (thousands >= 100) return `${Math.round(thousands / 10) * 10}K`;
        return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return num.toString();
}

// Load data - tries API first (Render), falls back to static JSON (Netlify)
async function loadInfluencers() {
    let data = null;
    let useStaticFallback = false;

    // Try API first (works on Render)
    try {
        const res = await fetch('/api/influencers');
        if (res.ok) {
            const apiData = await res.json();
            // API returns pre-calculated stats
            influencersData = apiData.influencers;
            document.getElementById('filledSlots').textContent = apiData.stats.filledSlots;
            document.getElementById('totalSlots').textContent = apiData.stats.totalSlots;
            document.getElementById('currentReach').textContent = apiData.stats.currentReachDisplay;
            document.getElementById('goalReach').textContent = apiData.stats.goalReachDisplay;
            renderGrid(apiData.influencers, apiData.stats.totalSlots);
            return;
        }
        useStaticFallback = true;
    } catch (e) {
        useStaticFallback = true;
    }

    // Fallback to static JSON (works on Netlify)
    if (useStaticFallback) {
        try {
            const res = await fetch('data/influencers.json');
            data = await res.json();

            influencersData = data.influencers;

            // Calculate stats client-side
            const filledSlots = data.influencers.length;
            const totalSlots = data.settings.totalSlots;
            const totalReach = data.influencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);

            // Add formatted followers to each influencer
            data.influencers.forEach(inf => {
                inf.followersDisplay = formatFollowers(inf.followers || 0);
            });

            // Update stats display
            document.getElementById('filledSlots').textContent = filledSlots;
            document.getElementById('totalSlots').textContent = totalSlots;
            document.getElementById('currentReach').textContent = formatFollowers(totalReach);
            document.getElementById('goalReach').textContent = formatFollowers(data.settings.goalReach);

            // Render grid
            renderGrid(data.influencers, totalSlots);
        } catch (err) {
            console.error('Failed to load influencers:', err);
            const grid = document.getElementById('slotsGrid');
            if (grid) {
                grid.innerHTML = '<div style="text-align:center;padding:40px;color:#ff6b6b;">Failed to load data. Please refresh the page.</div>';
            }
        }
    }
}

// Render the slots grid
function renderGrid(influencers, totalSlots) {
    const grid = document.getElementById('slotsGrid');
    grid.innerHTML = '';

    // Render filled slots
    influencers.forEach((inf, index) => {
        const slot = document.createElement('div');
        slot.className = 'slot filled';
        slot.dataset.index = index;

        slot.innerHTML = `
            <div class="slot-number">${String(index + 1).padStart(2, '0')}</div>
            <div class="slot-content">
                <div class="slot-info">
                    <div class="slot-name">${escapeHtml(inf.name)}</div>
                </div>
                <div class="slot-meta">
                    <div class="slot-category">${escapeHtml(inf.category)}</div>
                    <div class="slot-followers">${escapeHtml(inf.followersDisplay)}</div>
                </div>
            </div>
        `;

        // Click handler
        slot.addEventListener('click', (e) => {
            e.preventDefault();
            createRipple(e, slot);
            openLightbox(inf, e);
        });

        // Hover effect
        slot.addEventListener('mouseenter', () => {
            slot.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        grid.appendChild(slot);
    });

    // Render empty slots
    for (let i = influencers.length; i < totalSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot empty';
        slot.innerHTML = `
            <div class="slot-number">${String(i + 1).padStart(2, '0')}</div>
            <div class="slot-content">
                <div class="slot-name">Available</div>
            </div>
        `;
        grid.appendChild(slot);
    }
}

// Create ripple effect
function createRipple(e, element) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(116, 185, 255, 0.3)';
    ripple.style.width = ripple.style.height = '0px';
    ripple.style.left = e.offsetX + 'px';
    ripple.style.top = e.offsetY + 'px';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.transition = 'all 0.6s ease-out';

    element.appendChild(ripple);

    setTimeout(() => {
        ripple.style.width = ripple.style.height = '300px';
        ripple.style.opacity = '0';
    }, 10);

    setTimeout(() => ripple.remove(), 600);
}

// Lightbox functionality
let currentMouseTracker = null;

function openLightbox(influencer, clickEvent) {
    const lightbox = document.getElementById('socialLightbox');
    const lightboxContent = lightbox.querySelector('.lightbox-content');

    // Set creator name
    lightbox.querySelector('.creator-name').textContent = influencer.name;

    // Social buttons config
    const socialConfig = [
        { key: 'instagram', selector: '.social-btn.instagram' },
        { key: 'tiktok', selector: '.social-btn.tiktok' },
        { key: 'twitter', selector: '.social-btn.twitter' },
        { key: 'youtube', selector: '.social-btn.youtube' },
        { key: 'discord', selector: '.social-btn.discord' },
        { key: 'website', selector: '.social-btn.website' }
    ];

    let visibleCount = 0;

    // Show/hide buttons based on available links
    socialConfig.forEach(({ key, selector }) => {
        const btn = lightbox.querySelector(selector);
        const url = influencer.social?.[key];

        if (url && url.trim()) {
            btn.style.display = 'flex';
            btn.setAttribute('href', url);
            visibleCount++;
        } else {
            btn.style.display = 'none';
        }
    });

    // If no socials, don't open lightbox
    if (visibleCount === 0) return;

    // Position the buttons above the mouse click
    const buttonWidth = visibleCount * 50 + (visibleCount - 1) * 15;
    const mouseX = clickEvent.clientX;
    const mouseY = clickEvent.clientY;
    const leftPosition = mouseX - (buttonWidth / 2);
    const topPosition = mouseY - 70;

    lightboxContent.style.position = 'fixed';
    lightboxContent.style.left = Math.max(10, Math.min(leftPosition, window.innerWidth - buttonWidth - 10)) + 'px';
    lightboxContent.style.top = Math.max(10, topPosition) + 'px';
    lightboxContent.style.transform = 'none';

    // Store button center for distance calculation
    const buttonCenterX = leftPosition + buttonWidth / 2;
    const buttonCenterY = topPosition + 25;

    // Remove existing mouse tracker
    if (currentMouseTracker) {
        document.removeEventListener('mousemove', currentMouseTracker);
    }

    // Track mouse distance
    currentMouseTracker = function(e) {
        const distance = Math.sqrt(
            Math.pow(e.clientX - buttonCenterX, 2) +
            Math.pow(e.clientY - buttonCenterY, 2)
        );

        if (distance > 120) {
            closeLightbox();
        }
    };

    // Start tracking after delay
    setTimeout(() => {
        document.addEventListener('mousemove', currentMouseTracker);
    }, 100);

    // Close on scroll
    const scrollHandler = () => closeLightbox();
    window.addEventListener('scroll', scrollHandler, { once: true });
    window.addEventListener('touchmove', scrollHandler, { once: true });
    window.addEventListener('wheel', scrollHandler, { once: true });

    // Show lightbox
    lightbox.style.display = 'block';
    setTimeout(() => lightbox.classList.add('active'), 10);
}

function closeLightbox() {
    const lightbox = document.getElementById('socialLightbox');
    lightbox.classList.remove('active');

    if (currentMouseTracker) {
        document.removeEventListener('mousemove', currentMouseTracker);
        currentMouseTracker = null;
    }

    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 150);
}

// Close lightbox on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// Close lightbox on background click
document.getElementById('socialLightbox').addEventListener('click', (e) => {
    if (e.target.id === 'socialLightbox') closeLightbox();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo-img');
    const header = document.querySelector('header');

    if (logo.complete && logo.naturalHeight !== 0) {
        header.classList.add('loaded');
    } else {
        logo.addEventListener('load', () => header.classList.add('loaded'));
    }

    document.body.classList.add('bg-1');
    document.body.classList.add('layout-1');

    // Load influencers from API
    loadInfluencers();
});
