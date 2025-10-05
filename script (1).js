// Initialize with first background and layout
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('bg-1');
    document.body.classList.add('layout-1');
});

// Background switcher function
function changeBackground(bgNumber) {
    // Remove all background classes
    document.body.className = document.body.className.replace(/bg-\d/g, '');

    // Add new background class
    document.body.classList.add(`bg-${bgNumber}`);

    // Update active button
    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.bg-btn')[bgNumber - 1].classList.add('active');

    // Store preference
    localStorage.setItem('preferredBackground', bgNumber);
}

// Layout switcher function
function changeLayout(layoutNumber) {
    // Remove all layout classes
    document.body.className = document.body.className.replace(/layout-\d/g, '');

    // Add new layout class
    document.body.classList.add(`layout-${layoutNumber}`);

    // Update active button
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.layout-btn')[layoutNumber - 1].classList.add('active');

    // Store preference
    localStorage.setItem('preferredLayout', layoutNumber);
}

// Load preferred background on page load
document.addEventListener('DOMContentLoaded', () => {
    const preferred = localStorage.getItem('preferredBackground');
    if (preferred) {
        changeBackground(parseInt(preferred));
    }

    // Removed dynamic text sizing - keep all "Confirmed" text the same size
});

// Removed intersection observer to show all cards immediately

// Add hover sound effect (optional enhancement)
document.querySelectorAll('.slot.filled').forEach(slot => {
    slot.addEventListener('mouseenter', () => {
        slot.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Add ripple effect on click for filled slots
document.querySelectorAll('.slot.filled').forEach(slot => {
    slot.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior

        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(116, 185, 255, 0.3)';
        ripple.style.width = ripple.style.height = '0px';
        ripple.style.left = e.offsetX + 'px';
        ripple.style.top = e.offsetY + 'px';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.transition = 'all 0.6s ease-out';

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.style.width = ripple.style.height = '300px';
            ripple.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            ripple.remove();
        }, 600);

        // Open lightbox with creator info and click position
        openLightbox(this, e);
    });
});

// Lightbox functionality
let currentMouseTracker = null;

function openLightbox(slotElement, clickEvent) {
    const lightbox = document.getElementById('socialLightbox');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    const creatorName = slotElement.querySelector('.slot-name').textContent;
    const instagramUrl = slotElement.getAttribute('href');

    // Set creator name in lightbox
    lightbox.querySelector('.creator-name').textContent = creatorName;

    // Set Instagram URL
    lightbox.querySelector('.social-btn.instagram').setAttribute('href', instagramUrl);

    // Set TikTok URL (you can customize this logic)
    const tiktokHandle = getTikTokHandle(creatorName);
    if (tiktokHandle) {
        lightbox.querySelector('.social-btn.tiktok').setAttribute('href', `https://www.tiktok.com/@${tiktokHandle}`);
    }

    // Position the buttons above the mouse click position
    // Calculate position - center above the exact click location
    const buttonWidth = 115; // Approximate width of both buttons + gap (50px + 50px + 15px gap)
    const mouseX = clickEvent.clientX; // Mouse position relative to viewport
    const mouseY = clickEvent.clientY; // Mouse position relative to viewport
    const leftPosition = mouseX - (buttonWidth / 2);
    const topPosition = mouseY - 70; // Position above the mouse, without adding scroll

    // Apply positioning using fixed positioning for viewport-relative placement
    lightboxContent.style.position = 'fixed';
    lightboxContent.style.left = Math.max(10, Math.min(leftPosition, window.innerWidth - buttonWidth - 10)) + 'px';
    lightboxContent.style.top = Math.max(10, topPosition) + 'px';
    lightboxContent.style.transform = 'none';

    // Store button center position for distance calculation (viewport relative)
    const buttonCenterX = leftPosition + buttonWidth / 2;
    const buttonCenterY = topPosition + 25; // Center of 50px height buttons

    // Remove any existing mouse tracker
    if (currentMouseTracker) {
        document.removeEventListener('mousemove', currentMouseTracker);
    }

    // Track mouse distance from buttons
    currentMouseTracker = function(e) {
        const distance = Math.sqrt(
            Math.pow(e.clientX - buttonCenterX, 2) +
            Math.pow(e.clientY - buttonCenterY, 2)
        );

        // If mouse is more than 50px away, close the lightbox
        if (distance > 50) {
            closeLightbox();
        }
    };

    // Start tracking after a small delay to prevent immediate closing
    setTimeout(() => {
        document.addEventListener('mousemove', currentMouseTracker);
    }, 100);

    // Close on scroll to prevent sticky buttons while scrolling
    const scrollHandler = function() {
        closeLightbox();
    };

    // Also close on touchmove for mobile scrolling
    const touchHandler = function() {
        closeLightbox();
    };

    // Add scroll and touch listeners
    window.addEventListener('scroll', scrollHandler, { once: true });
    window.addEventListener('touchmove', touchHandler, { once: true });
    window.addEventListener('wheel', scrollHandler, { once: true });

    // Show lightbox
    lightbox.style.display = 'block';
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
}

function closeLightbox() {
    const lightbox = document.getElementById('socialLightbox');
    lightbox.classList.remove('active');

    // Remove mouse tracker when closing
    if (currentMouseTracker) {
        document.removeEventListener('mousemove', currentMouseTracker);
        currentMouseTracker = null;
    }

    // Quick fade out (150ms)
    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 150);
}

// Map creator names to TikTok handles
function getTikTokHandle(creatorName) {
    const tiktokHandles = {
        'Men with the Pot': 'menwiththepot',
        'Stack Pack': 'stackpackk',
        'Joshua Moore': 'joshsmoore',
        'NOW WUT': 'nowwutdotcom',
        'Maegan Eats': 'maeganeats',
        'Randy Bowden Jr': 'randybowdenjr',
        'rBeatz Radio': 'rbeatzradio'
    };
    return tiktokHandles[creatorName] || null;
}

// Close lightbox on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// Close lightbox on background click
document.getElementById('socialLightbox').addEventListener('click', (e) => {
    if (e.target.id === 'socialLightbox') {
        closeLightbox();
    }
});