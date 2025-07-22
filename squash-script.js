// Squash Analysis Page JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeSquashPage();
    setupVideoControls();
    setupImageLightbox();
    animateStats();
});

function initializeSquashPage() {
    // Initialize music from main page
    initializePersistentMusic();
    
    // Add scroll animations
    setupScrollAnimations();
    
    // Add video sync functionality
    setupVideoSync();
    
    console.log('Squash analysis page initialized');
}

// Toggle detailed analysis section
function toggleDetailedAnalysis() {
    const detailedSection = document.getElementById('detailedAnalysis');
    const continueBtn = document.querySelector('.arcade-continue-btn .btn-text');
    const btnIcon = document.querySelector('.arcade-continue-btn .btn-icon');
    const progressFill = document.querySelector('.progress-fill');
    const currentSection = document.querySelector('.current-section');
    const totalContent = document.querySelector('.total-content');
    const continueHint = document.querySelector('.continue-hint');
    
    if (detailedSection.classList.contains('hidden')) {
        // Show detailed analysis (expand from compact view)
        detailedSection.classList.remove('hidden');
        detailedSection.style.maxHeight = 'none';
        detailedSection.style.opacity = '1';
        
        // Update progress indicator
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        if (currentSection) {
            currentSection.textContent = 'Full Analysis';
        }
        if (totalContent) {
            totalContent.textContent = 'Complete view active';
        }
        if (continueBtn) {
            continueBtn.textContent = 'COLLAPSE TO QUICK OVERVIEW';
        }
        if (btnIcon) {
            btnIcon.textContent = '▲';
        }
        if (continueHint) {
            continueHint.innerHTML = '<span class="blink">🎮</span> Click to show compact view <span class="blink">🎮</span>';
        }
        
        // Smooth scroll to detailed section
        setTimeout(() => {
            detailedSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
        
    } else {
        // Hide detailed analysis (collapse to compact view)
        detailedSection.classList.add('hidden');
        detailedSection.style.maxHeight = '0';
        detailedSection.style.opacity = '0';
        
        // Reset progress indicator to compact view
        if (progressFill) {
            progressFill.style.width = '30%';
        }
        if (currentSection) {
            currentSection.textContent = 'Quick Overview';
        }
        if (totalContent) {
            totalContent.textContent = '70% more content below';
        }
        if (continueBtn) {
            continueBtn.textContent = 'CONTINUE - VIEW DETAILED ANALYSIS';
        }
        if (btnIcon) {
            btnIcon.textContent = '▼';
        }
        if (continueHint) {
            continueHint.innerHTML = '<span class="blink">🎮</span> More comprehensive data below <span class="blink">🎮</span>';
        }
        
        // Scroll back to continue section
        setTimeout(() => {
            document.querySelector('.continue-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }
}

function setupVideoControls() {
    const videos = document.querySelectorAll('.match-video');
    
    videos.forEach((video, index) => {
        // Set initial playback rate to 5x when metadata loads
        video.addEventListener('loadedmetadata', function() {
            video.playbackRate = 5.0;
            console.log(`Video ${index + 1} metadata loaded, speed set to 5x`);
        });
        
        // Add loading indicator
        video.addEventListener('loadstart', function() {
            console.log(`Video ${index + 1} loading started`);
        });
        
        video.addEventListener('loadeddata', function() {
            console.log(`Video ${index + 1} loaded`);
        });
        
        video.addEventListener('error', function(e) {
            console.error(`Error loading video ${index + 1}:`, e);
            // Show fallback message
            const wrapper = video.closest('.video-wrapper');
            if (wrapper) {
                wrapper.innerHTML = `
                    <div class="video-error">
                        <p>🎥 Video not available</p>
                        <p>File may be missing or corrupted</p>
                    </div>
                `;
            }
        });
    });
}

function setupVideoSync() {
    const originalVideo = document.getElementById('originalVideo');
    const annotatedVideo = document.getElementById('annotatedVideo');
    
    if (originalVideo && annotatedVideo) {
        // Set playback speed to 3x for both videos immediately
        originalVideo.playbackRate = 3.0;
        annotatedVideo.playbackRate = 3.0;
        
        // Auto-start both videos when they're ready
        let originalReady = false;
        let annotatedReady = false;
        
        function tryAutoStart() {
            if (originalReady && annotatedReady) {
                // Sync to start at the same time
                originalVideo.currentTime = 0;
                annotatedVideo.currentTime = 0;
                
                // Start both videos simultaneously
                Promise.all([
                    originalVideo.play().catch(e => console.log('Original video autoplay blocked:', e)),
                    annotatedVideo.play().catch(e => console.log('Annotated video autoplay blocked:', e))
                ]).then(() => {
                    console.log('Both videos started at 3x speed');
                }).catch(e => {
                    console.log('Some videos may require user interaction to play:', e);
                });
            }
        }
        
        // Set up event listeners for when videos are ready
        originalVideo.addEventListener('loadedmetadata', function() {
            originalVideo.playbackRate = 3.0;
            originalReady = true;
            console.log('Original video ready, speed set to 3x');
            tryAutoStart();
        });
        
        annotatedVideo.addEventListener('loadedmetadata', function() {
            annotatedVideo.playbackRate = 3.0;
            annotatedReady = true;
            console.log('Annotated video ready, speed set to 3x');
            tryAutoStart();
        });
        
        // Ensure videos can start loading
        originalVideo.load();
        annotatedVideo.load();
        
        // Error handling
        originalVideo.addEventListener('error', function(e) {
            console.error('Original video error:', e);
        });
        
        annotatedVideo.addEventListener('error', function(e) {
            console.error('Annotated video error:', e);
            console.log('Annotated video source:', annotatedVideo.src);
        });
        
        // Manual sync button (updated for 3x speed)
        const syncButton = document.createElement('button');
        syncButton.textContent = '🎬 Sync & Play Videos (3x)';
        syncButton.className = 'sync-btn';
        syncButton.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            font-family: 'Minecraft', monospace;
            font-size: 1rem;
            padding: 10px 20px;
            background: rgba(152, 251, 152, 0.8);
            color: #228B22;
            border: 2px solid #228B22;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            z-index: 100;
        `;
        
        syncButton.addEventListener('click', function() {
            // Sync and play both videos
            originalVideo.currentTime = 0;
            annotatedVideo.currentTime = 0;
            originalVideo.playbackRate = 3.0;
            annotatedVideo.playbackRate = 3.0;
            
            // Start both videos
            Promise.all([
                originalVideo.play(),
                annotatedVideo.play()
            ]).then(() => {
                syncButton.textContent = '✅ Videos Playing!';
                setTimeout(() => {
                    syncButton.textContent = '🎬 Sync & Play Videos (3x)';
                }, 2000);
            }).catch(e => {
                console.error('Error playing videos:', e);
                syncButton.textContent = '❌ Playback Error';
                setTimeout(() => {
                    syncButton.textContent = '🎬 Sync & Play Videos (3x)';
                }, 2000);
            });
        });
        
        document.body.appendChild(syncButton);
    } else {
        console.log('One or both video elements not found');
    }
}

function setupImageLightbox() {
    const images = document.querySelectorAll('.analysis-graphic, .heatmap-graphic');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            openImageLightbox(img.src, img.alt);
        });
        
        img.style.cursor = 'pointer';
        img.title = 'Click to view full size';
    });
}

function openImageLightbox(src, alt) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        z-index: 1001;
    `;
    
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(lightbox);
    });
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
        }
    });
    
    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);
    
    // Add CSS for fade in animation
    if (!document.querySelector('#lightbox-styles')) {
        const style = document.createElement('style');
        style.id = 'lightbox-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    const sections = document.querySelectorAll('.video-comparison, .insights-section, .visual-analysis, .heatmaps-section, .recommendations-section, .technical-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    const animateValue = (element, start, end, duration) => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            
            // Format the value based on content
            if (element.textContent.includes('/')) {
                // Handle fractions like "6.2/10"
                const parts = element.textContent.split('/');
                element.textContent = current.toFixed(1) + '/' + parts[1];
            } else if (element.textContent.includes('%')) {
                // Handle percentages
                element.textContent = current.toFixed(1) + '%';
            } else if (current < 100) {
                // Small numbers with decimals
                element.textContent = current.toFixed(1);
            } else {
                // Large whole numbers
                element.textContent = Math.floor(current);
            }
        }, 16);
    };
    
    // Animate each stat when it comes into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                // Extract number from text
                let targetValue = 0;
                if (text.includes('/')) {
                    targetValue = parseFloat(text.split('/')[0]);
                } else if (text.includes('%')) {
                    targetValue = parseFloat(text.replace('%', ''));
                } else {
                    targetValue = parseFloat(text);
                }
                
                if (!isNaN(targetValue)) {
                    animateValue(element, 0, targetValue, 1500);
                }
                
                statsObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statValues.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Music functionality (reuse from main page)
function initializePersistentMusic() {
    const music = document.getElementById('backgroundMusic');
    if (!music) return;
    
    // Load saved music state
    const savedPosition = localStorage.getItem('musicPosition');
    const savedMutedState = localStorage.getItem('musicMuted');
    const savedVolume = localStorage.getItem('musicVolume') || '0.7';
    
    // Set up initial state
    window.isMuted = savedMutedState === 'true';
    music.volume = window.isMuted ? 0 : parseFloat(savedVolume);
    updateMuteUI(window.isMuted);
    
    // Restore position
    if (savedPosition && !isNaN(parseFloat(savedPosition))) {
        music.currentTime = parseFloat(savedPosition);
    }
    
    // Try to play if not muted
    if (!window.isMuted) {
        music.play().catch(console.log);
    }
    
    // Save position periodically
    setInterval(() => {
        if (music && !music.paused) {
            localStorage.setItem('musicPosition', music.currentTime.toString());
        }
    }, 1000);
}

function toggleMusic() {
    const music = document.getElementById('backgroundMusic');
    
    if (window.isMuted) {
        // Unmute
        const savedVolume = localStorage.getItem('musicVolume') || '0.7';
        music.volume = parseFloat(savedVolume);
        window.isMuted = false;
        
        if (music.paused) {
            music.play().catch(console.log);
        }
        
        updateMuteUI(false);
    } else {
        // Mute
        if (music.volume > 0) {
            localStorage.setItem('musicVolume', music.volume.toString());
        }
        music.volume = 0;
        window.isMuted = true;
        
        updateMuteUI(true);
    }
    
    localStorage.setItem('musicMuted', window.isMuted.toString());
}

function updateMuteUI(muted) {
    const muteBtn = document.getElementById('muteBtn');
    const muteText = document.getElementById('muteText');
    
    if (muteBtn && muteText) {
        if (muted) {
            muteText.textContent = '🔇 MUSIC OFF';
            muteBtn.classList.add('muted');
        } else {
            muteText.textContent = '🔊 MUSIC ON';
            muteBtn.classList.remove('muted');
        }
    }
}

// Add some Easter eggs
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        // Show a spring message
        showSpringMessage('🌸 Spring analysis saved to memory! 🌸');
    }
    
    if (event.key === 'r' || event.key === 'R') {
        // Restart all videos
        const videos = document.querySelectorAll('.match-video');
        videos.forEach(video => {
            video.currentTime = 0;
        });
        showSpringMessage('🎬 Videos restarted! 🎬');
    }
});

function showSpringMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(152, 251, 152, 0.95);
        color: #228B22;
        padding: 20px 40px;
        border-radius: 15px;
        font-family: 'Minecraft', monospace;
        font-size: 1.2rem;
        font-weight: bold;
        text-shadow: 0 0 10px #98FB98;
        box-shadow: 0 0 30px rgba(50, 205, 50, 0.5);
        z-index: 1000;
        animation: springBounce 2s ease-out;
    `;
    
    // Add bounce animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes springBounce {
            0% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.5); 
            }
            50% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1.1); 
            }
            100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(1); 
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        document.body.removeChild(messageDiv);
        document.head.removeChild(style);
    }, 2000);
}

// Error handling for missing files
window.addEventListener('load', function() {
    // Check if videos loaded properly
    const videos = document.querySelectorAll('.match-video');
    videos.forEach((video, index) => {
        if (video.error) {
            console.error(`Video ${index + 1} failed to load:`, video.error);
        }
    });
    
    // Check if images loaded properly
    const images = document.querySelectorAll('.analysis-graphic, .heatmap-graphic');
    images.forEach((img, index) => {
        img.addEventListener('error', function() {
            console.error(`Image ${index + 1} failed to load:`, img.src);
            img.style.display = 'none';
            
            // Add placeholder
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                background: rgba(152, 251, 152, 0.2);
                border: 2px dashed #32CD32;
                border-radius: 10px;
                color: #228B22;
                font-family: 'Minecraft', monospace;
                text-align: center;
            `;
            placeholder.innerHTML = '📊<br>Chart not available<br>File may be missing';
            
            img.parentNode.insertBefore(placeholder, img);
        });
    });
});
