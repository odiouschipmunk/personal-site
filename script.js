// Global variables
let isMuted = false;
let currentAvatar = 0;
const avatars = [
    'assets/facing directly.png',
    'assets/sideways.png',
    'assets/completely sideways.png'
];

// Music persistence variables
let musicPosition = 0;
let musicInitialized = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Clear any corrupted localStorage for fresh start (remove this after testing)
    if (localStorage.getItem('musicVolume') === '0' || localStorage.getItem('musicVolume') === 'NaN') {
        localStorage.removeItem('musicVolume');
        localStorage.removeItem('musicMuted');
        localStorage.removeItem('musicPosition');
        console.log('Cleared corrupted music settings');
    }
    
    initializePersistentMusic();
    initializeAvatar();
    addKeyboardListeners();
    addClickEffects();
    
    // Save music state when leaving page
    window.addEventListener('beforeunload', saveMusicState);
    
    // Fallback: try to play music on any user interaction
    document.addEventListener('click', function() {
        const music = document.getElementById('backgroundMusic');
        if (music && music.paused && !isMuted) {
            music.play().catch(console.log);
            console.log('Music started via click fallback');
        }
    }, { once: true });
});

// Persistent Music functionality
function initializePersistentMusic() {
    const music = document.getElementById('backgroundMusic');
    if (!music) return;
    
    // Load saved music state
    const savedPosition = localStorage.getItem('musicPosition');
    const savedMutedState = localStorage.getItem('musicMuted');
    const savedVolume = localStorage.getItem('musicVolume') || '0.7';
    
    console.log('Initializing music - Saved muted state:', savedMutedState, 'Saved volume:', savedVolume);
    
    // Set up initial state
    isMuted = savedMutedState === 'true';
    music.volume = isMuted ? 0 : parseFloat(savedVolume);
    updateMuteUI(isMuted);
    
    // Force music to try playing immediately
    const tryPlayMusic = () => {
        if (!isMuted) {
            music.play().then(() => {
                console.log('Music started successfully, volume:', music.volume);
                musicInitialized = true;
            }).catch(error => {
                console.log('Autoplay blocked, music will try to start on interaction');
                musicInitialized = true;
            });
        } else {
            console.log('Music initialized but muted');
            musicInitialized = true;
        }
    };
    
    // Restore position and start playing
    if (savedPosition) {
        music.addEventListener('loadedmetadata', function() {
            const position = parseFloat(savedPosition);
            if (position >= 0 && position < music.duration) {
                music.currentTime = position;
                console.log('Restored music position to:', position);
            }
            tryPlayMusic();
        }, { once: true });
    } else {
        // No saved position, just start from beginning
        music.addEventListener('canplaythrough', tryPlayMusic, { once: true });
    }
    
    // Fallback: try to play after a short delay
    setTimeout(() => {
        if (!musicInitialized && !isMuted) {
            console.log('Fallback: trying to start music');
            tryPlayMusic();
        }
    }, 1000);
    
    // Save position periodically
    setInterval(() => {
        if (music && !music.paused) {
            localStorage.setItem('musicPosition', music.currentTime.toString());
        }
    }, 1000);
    
    // Handle music end (loop manually to maintain position tracking)
    music.addEventListener('ended', function() {
        music.currentTime = 0;
        localStorage.setItem('musicPosition', '0');
        if (!isMuted) {
            music.play();
        }
    });
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

function saveMusicState() {
    const music = document.getElementById('backgroundMusic');
    if (music) {
        localStorage.setItem('musicPosition', music.currentTime.toString());
        localStorage.setItem('musicMuted', isMuted.toString());
        if (music.volume > 0) {
            localStorage.setItem('musicVolume', music.volume.toString());
        }
        console.log('Saving music state - Position:', music.currentTime, 'Muted:', isMuted, 'Volume:', music.volume);
    }
}

// Debug function to check music state
function debugMusicState() {
    const music = document.getElementById('backgroundMusic');
    console.log('=== MUSIC DEBUG ===');
    console.log('Audio element volume:', music ? music.volume : 'NO AUDIO ELEMENT');
    console.log('Audio element paused:', music ? music.paused : 'NO AUDIO ELEMENT');
    console.log('Audio element currentTime:', music ? music.currentTime : 'NO AUDIO ELEMENT');
    console.log('isMuted variable:', isMuted);
    console.log('Stored musicMuted:', localStorage.getItem('musicMuted'));
    console.log('Stored musicVolume:', localStorage.getItem('musicVolume'));
    console.log('Stored musicPosition:', localStorage.getItem('musicPosition'));
    console.log('==================');
}

// Add keyboard shortcut for debugging
document.addEventListener('keydown', function(event) {
    if (event.key === 'd' || event.key === 'D') {
        if (event.ctrlKey) {
            debugMusicState();
        }
    }
});

function toggleMusic() {
    const music = document.getElementById('backgroundMusic');
    
    if (isMuted) {
        // Unmute: restore volume and play
        const savedVolume = localStorage.getItem('musicVolume') || '0.7';
        music.volume = parseFloat(savedVolume);
        isMuted = false;
        
        // Ensure music is playing
        if (music.paused) {
            music.play().then(() => {
                console.log('Music resumed successfully after unmute');
            }).catch(error => {
                console.log('Failed to resume music after unmute:', error);
                // Force try again after a short delay
                setTimeout(() => {
                    if (music.paused && !isMuted) {
                        music.play().catch(console.log);
                    }
                }, 100);
            });
        }
        
        updateMuteUI(false);
        playButtonSound();
        
        console.log('Music unmuted, volume:', music.volume, 'playing:', !music.paused);
    } else {
        // Mute: save current volume and set to 0
        if (music.volume > 0) {
            localStorage.setItem('musicVolume', music.volume.toString());
        }
        music.volume = 0;
        isMuted = true;
        
        updateMuteUI(true);
        
        console.log('Music muted, volume:', music.volume);
    }
    
    // Save the muted state
    localStorage.setItem('musicMuted', isMuted.toString());
}

// Avatar functionality
function initializeAvatar() {
    const avatar = document.getElementById('avatar');
    
    // Cycle through avatars on click
    avatar.addEventListener('click', function() {
        currentAvatar = (currentAvatar + 1) % avatars.length;
        avatar.src = avatars[currentAvatar];
        playButtonSound();
        
        // Add a little animation
        avatar.style.transform = 'scale(1.2) rotate(360deg)';
        setTimeout(() => {
            avatar.style.transform = 'scale(1)';
        }, 300);
    });
    
    // Random avatar change every 10 seconds
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance
            currentAvatar = (currentAvatar + 1) % avatars.length;
            avatar.src = avatars[currentAvatar];
        }
    }, 10000);
}

// Navigation functionality
function navigateToPage(page) {
    playButtonSound();
    
    // Save music state before navigating
    saveMusicState();
    
    // Add visual feedback
    const buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach(btn => {
        if (btn.onclick.toString().includes(page)) {
            btn.style.transform = 'translateY(2px)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-2px)';
            }, 150);
        }
    });
    
    // Navigate to 404 page after animation
    setTimeout(() => {
        window.location.href = '404.html';
    }, 300);
}

// Sound effects
function playButtonSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Web Audio API not supported');
    }
}

// Keyboard navigation
function addKeyboardListeners() {
    let selectedButton = 0;
    const buttons = document.querySelectorAll('.menu-btn');
    
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                selectedButton = (selectedButton - 1 + buttons.length) % buttons.length;
                highlightButton(selectedButton);
                playButtonSound();
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                selectedButton = (selectedButton + 1) % buttons.length;
                highlightButton(selectedButton);
                playButtonSound();
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                buttons[selectedButton].click();
                break;
                
            case 'm':
            case 'M':
                toggleMusic();
                break;
                
            case 'a':
            case 'A':
                document.getElementById('avatar').click();
                break;
        }
    });
    
    // Initialize first button as selected
    highlightButton(0);
}

function highlightButton(index) {
    const buttons = document.querySelectorAll('.menu-btn');
    
    // Remove highlight from all buttons
    buttons.forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.borderColor = '#00ffff';
    });
    
    // Highlight selected button
    buttons[index].style.backgroundColor = 'rgba(0, 255, 255, 0.2)';
    buttons[index].style.borderColor = '#ffffff';
}

// Click effects
function addClickEffects() {
    document.addEventListener('click', function(event) {
        createClickEffect(event.clientX, event.clientY);
    });
}

function createClickEffect(x, y) {
    const effect = document.createElement('div');
    effect.style.position = 'fixed';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    effect.style.width = '10px';
    effect.style.height = '10px';
    effect.style.background = '#00ffff';
    effect.style.borderRadius = '50%';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '1000';
    effect.style.animation = 'clickEffect 0.5s ease-out forwards';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        document.body.removeChild(effect);
    }, 500);
}

// Add click effect animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes clickEffect {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Easter eggs
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(event) {
    konamiCode.push(event.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length &&
        konamiCode.every((key, index) => key === konamiSequence[index])) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s infinite';
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 10000);
    
    // Add rainbow animation
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);
}
