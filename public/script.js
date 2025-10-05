// Preload critical images to prevent blinking
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo-img');
    const header = document.querySelector('header');

    // Function to ensure smooth loading
    const ensureImageLoaded = () => {
        if (logo.complete && logo.naturalHeight !== 0) {
            // Image is already loaded
            header.classList.add('loaded');
        } else {
            // Wait for image to load
            logo.addEventListener('load', () => {
                header.classList.add('loaded');
            });
        }
    };

    ensureImageLoaded();

    // Initialize with first background and layout
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

    // Set creator name in lightbox
    lightbox.querySelector('.creator-name').textContent = creatorName;

    // Set Instagram URL and show/hide button based on availability
    const instagramUrl = getInstagramUrl(creatorName) || slotElement.getAttribute('href');
    const instagramBtn = lightbox.querySelector('.social-btn.instagram');
    if (instagramUrl && instagramUrl.includes('instagram.com')) {
        instagramBtn.style.display = 'flex';
        instagramBtn.setAttribute('href', instagramUrl);
    } else {
        instagramBtn.style.display = 'none';
    }

    // Set TikTok URL and show/hide button based on availability
    const tiktokHandle = getTikTokHandle(creatorName);
    const tiktokBtn = lightbox.querySelector('.social-btn.tiktok');
    if (tiktokHandle) {
        tiktokBtn.style.display = 'flex';
        tiktokBtn.setAttribute('href', `https://www.tiktok.com/@${tiktokHandle}`);
    } else {
        tiktokBtn.style.display = 'none';
    }

    // Set Twitter URL and show/hide button based on availability
    const twitterUrl = getTwitterUrl(creatorName);
    const twitterBtn = lightbox.querySelector('.social-btn.twitter');
    if (twitterUrl) {
        twitterBtn.style.display = 'flex';
        twitterBtn.setAttribute('href', twitterUrl);
    } else {
        twitterBtn.style.display = 'none';
    }

    // Set YouTube URL and show/hide button based on availability
    const youtubeUrl = getYouTubeHandle(creatorName);
    const youtubeBtn = lightbox.querySelector('.social-btn.youtube');
    if (youtubeUrl) {
        youtubeBtn.style.display = 'flex';
        youtubeBtn.setAttribute('href', youtubeUrl);
    } else {
        youtubeBtn.style.display = 'none';
    }

    // Set Discord URL and show/hide button based on availability
    const discordUrl = getDiscordHandle(creatorName);
    const discordBtn = lightbox.querySelector('.social-btn.discord');
    if (discordUrl) {
        discordBtn.style.display = 'flex';
        discordBtn.setAttribute('href', discordUrl);
    } else {
        discordBtn.style.display = 'none';
    }

    // Set Website URL and show/hide button based on availability
    const websiteUrl = getWebsiteUrl(creatorName);
    const websiteBtn = lightbox.querySelector('.social-btn.website');
    if (websiteUrl) {
        websiteBtn.style.display = 'flex';
        websiteBtn.setAttribute('href', websiteUrl);
    } else {
        websiteBtn.style.display = 'none';
    }

    // Position the buttons above the mouse click position
    // Calculate position - center above the exact click location
    // Count visible buttons to calculate total width dynamically
    const visibleButtons = [
        instagramUrl && instagramUrl.includes('instagram.com'),
        tiktokHandle,
        twitterUrl,
        youtubeUrl,
        discordUrl,
        websiteUrl
    ].filter(Boolean).length;

    // Each button is 50px wide with 15px gap between them
    const buttonWidth = visibleButtons * 50 + (visibleButtons - 1) * 15;
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

        // If mouse is more than 120px away, close the lightbox (increased for 3 buttons)
        if (distance > 120) {
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

// Map creator names to Instagram URLs
function getInstagramUrl(creatorName) {
    const instagramUrls = {
        'Men with the Pot': 'https://www.instagram.com/menwiththepot/',
        'Stack Pack': 'https://www.instagram.com/stackpack/',
        'Joshua Moore': 'https://www.instagram.com/joshsmoore/',
        'NOW WUT': 'https://www.instagram.com/nowwutdotcom/',
        'Maegan Eats': 'https://www.instagram.com/maegan_eats/',
        'Randy Bowden Jr': 'https://www.instagram.com/randybowdenjr/',
        'rBeatz Radio': 'https://www.instagram.com/rbeatzradio/',
        'Absolute Motivation': 'https://www.instagram.com/absolutemotivationofficial/',
        'Over Exposed': 'https://www.instagram.com/oe.nft?igsh=MWxxczNrYnFtZHB1YQ=='
    };
    return instagramUrls[creatorName] || false;
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
        'rBeatz Radio': 'rbeatzradio',
        'Absolute Motivation': 'absolutemotivationtok'
    };
    return tiktokHandles[creatorName] || null;
}

// Map creator names to YouTube URLs
function getYouTubeHandle(creatorName) {
    const youtubeUrls = {
        'Maegan Eats': 'https://youtube.com/@maeganelena?si=I2C1aDCSWxxAGdeX',
        'Randy Bowden Jr': null, // No YouTube
        'rBeatz Radio': 'https://youtube.com/@rbeatzradio?si=mtioXQYIHv_9ImRh',
        'Absolute Motivation': 'https://youtube.com/@absolutemotivation?si=AJ6OuS5i4B9QhUIz'
    };
    return youtubeUrls[creatorName] || false;
}

// Map creator names to Twitter URLs
function getTwitterUrl(creatorName) {
    const twitterUrls = {
        'Over Exposed': 'https://x.com/Over___Exposed'
    };
    return twitterUrls[creatorName] || false;
}

// Map creator names to Discord URLs
function getDiscordHandle(creatorName) {
    const discordUrls = {
        'Over Exposed': 'https://discord.gg/xE9VpCHyj9'
    };
    return discordUrls[creatorName] || false;
}

// Map creator names to Website URLs
function getWebsiteUrl(creatorName) {
    const websiteUrls = {
        'Science Under Nature': 'https://scienceundernature.com/?srsltid=AfmBOoq_G24JHqeC_yiIFHPNLheh6c93qYGeb01ufIbxGh85Ox-oFPjl',
        'Over Exposed': 'https://overexposed.io'
    };
    return websiteUrls[creatorName] || false;
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