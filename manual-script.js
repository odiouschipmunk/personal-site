// Manual page JavaScript with Undertale-style dialogue system

// Dialogue texts
const dialogueTexts = {
    1: "Hi! My name is Dhruv Panchal, and I'm currently an 11th grader in Princeton Day School. I love computer science and playing squash!",
    2: "I am 16 years old, and I am interested in computer science, especially in machine learning and computer vision.", 
    3: "I have a couple projects. My main project is an autonomous 'squash coach' that analyzes player performance and provides real-time feedback. I made this using custom trained YOLO models and OpenCV. Check it out on my 'Main Story' page!",
};

// Current dialogue state
let currentDialogue = 1;
let isTyping = false;

// Music state variables
let isMuted = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeMusic();
    initializeDialogue();
    addKeyboardListeners();
});

// Initialize background music
function initializeMusic() {
    const music = document.getElementById('backgroundMusic');
    if (!music) return;
    
    // Load saved music state
    const savedMuted = localStorage.getItem('musicMuted') === 'true';
    const savedPosition = parseFloat(localStorage.getItem('musicPosition')) || 0;
    
    if (savedMuted) {
        isMuted = true;
        music.volume = 0;
    } else {
        music.volume = 0.7; // Use 0.7 as normal volume instead of max
        music.currentTime = savedPosition;
        
        // Try to play music
        music.play().catch(e => {
            console.log('Music autoplay blocked, will start on user interaction');
        });
    }
    
    // Save position periodically
    setInterval(() => {
        if (music && !music.paused) {
            localStorage.setItem('musicPosition', music.currentTime.toString());
        }
    }, 1000);
}

// Initialize dialogue system
function initializeDialogue() {
    displayText(dialogueTexts[1]);
}

// Display text with typewriter effect
function displayText(text) {
    const textElement = document.getElementById('textContent');
    if (!textElement) return;
    
    isTyping = true;
    textElement.classList.add('text-fade-out');
    
    setTimeout(() => {
        // Clear existing text
        textElement.textContent = '';
        textElement.classList.remove('text-fade-out');
        
        // Character-by-character typing effect
        let charIndex = 0;
        let typingInterval;
        
        // Function to complete text immediately
        const completeText = () => {
            if (typingInterval) {
                clearInterval(typingInterval);
                typingInterval = null;
            }
            textElement.textContent = text;
            textElement.classList.add('text-fade-in');
            
            setTimeout(() => {
                textElement.classList.remove('text-fade-in');
                isTyping = false;
            }, 500);
        };
        
        // Add click listener to skip animation
        const skipHandler = (e) => {
            e.preventDefault();
            if (isTyping && typingInterval) {
                completeText();
                document.removeEventListener('click', skipHandler);
            }
        };
        document.addEventListener('click', skipHandler);
        
        typingInterval = setInterval(() => {
            if (charIndex < text.length) {
                textElement.textContent += text.charAt(charIndex);
                charIndex++;
                
                // Add typing sound effect occasionally
                if (charIndex % 3 === 0) {
                    playTypingSound();
                }
            } else {
                clearInterval(typingInterval);
                typingInterval = null;
                textElement.classList.add('text-fade-in');
                
                setTimeout(() => {
                    textElement.classList.remove('text-fade-in');
                    isTyping = false;
                }, 500);
                
                // Remove click listener when typing is complete
                document.removeEventListener('click', skipHandler);
            }
        }, 50); // Adjust speed here (lower = faster)
    }, 300);
}

// Add typing sound effect
function playTypingSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1200 + Math.random() * 400; // Random pitch
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // Max volume for typing sounds
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
        // Silently fail if audio context not available
    }
}

// Handle option selection
function selectOption(option) {
    if (isTyping) return; // Prevent spam clicking during text animation
    
    playButtonSound();
    
    // Add visual feedback
    const btn = document.getElementById(`btn${option}`);
    if (btn) {
        btn.classList.add('selected');
        setTimeout(() => {
            btn.classList.remove('selected');
        }, 500);
    }
    
    // Hide option buttons after selection
    const btn1 = document.getElementById('btn1');
    const btn2 = document.getElementById('btn2');
    if (btn1 && btn2) {
        btn1.style.opacity = '0';
        btn1.style.pointerEvents = 'none';
        btn1.style.transform = 'translateY(10px)';
        
        btn2.style.opacity = '0';
        btn2.style.pointerEvents = 'none';
        btn2.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            btn1.style.display = 'none';
            btn2.style.display = 'none';
        }, 300);
    }
    
    // Change dialogue based on option
    if (option === 1) {
        currentDialogue = 2;
        displayText(dialogueTexts[2]);
    } else if (option === 2) {
        currentDialogue = 3;
        displayText(dialogueTexts[3]);
    }
    
    // Add character animation
    animateCharacter();
}

// Animate character sprite
function animateCharacter() {
    const character = document.getElementById('character');
    if (character) {
        character.style.transform = 'scale(1.1)';
        setTimeout(() => {
            character.style.transform = 'scale(1)';
        }, 300);
    }
}

// Go back to main page
function goBack() {
    playButtonSound();
    
    // Save music state
    const music = document.getElementById('backgroundMusic');
    if (music && !music.paused) {
        localStorage.setItem('musicPosition', music.currentTime.toString());
    }
    
    // Add visual feedback
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.classList.add('btn-sound-effect');
    }
    
    // Navigate back after animation
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// Sound effects
function playButtonSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // Max volume for button sounds
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio context not available');
    }
}

// Keyboard listeners for better UX
function addKeyboardListeners() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case '1':
                selectOption(1);
                break;
            case '2':
                selectOption(2);
                break;
            case 'Escape':
            case 'Backspace':
                goBack();
                break;
            case ' ': // Spacebar to continue
                e.preventDefault();
                if (currentDialogue === 1) {
                    selectOption(1);
                }
                break;
        }
    });
}

// Handle page visibility for music
document.addEventListener('visibilitychange', function() {
    const music = document.getElementById('backgroundMusic');
    if (!music) return;
    
    if (document.hidden) {
        // Save position when tab becomes hidden
        if (!music.paused) {
            localStorage.setItem('musicPosition', music.currentTime.toString());
        }
    } else {
        // Resume music when tab becomes visible
        if (!isMuted && music.paused) {
            music.play().catch(console.log);
        }
    }
});

// Save music state when leaving page
window.addEventListener('beforeunload', function() {
    const music = document.getElementById('backgroundMusic');
    if (music && !music.paused) {
        localStorage.setItem('musicPosition', music.currentTime.toString());
    }
});
