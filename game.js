// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const CORGI_MOVE_SPEED = 4;
const TRANSFORM_COOLDOWN = 500; // ms

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let musicGainNode = audioContext.createGain();
musicGainNode.gain.value = 0.3;
musicGainNode.connect(audioContext.destination);

// Sound effects
const sounds = {
    bark: null,
    transform: null,
    collect: null,
    jump: null
};

// Create bark sound
function createBarkSound() {
    const now = audioContext.currentTime;
    const duration = 0.15;
    
    // Create multiple oscillators for a richer sound
    // Low frequency component (body of the bark)
    const lowOsc = audioContext.createOscillator();
    const lowGain = audioContext.createGain();
    lowOsc.type = 'sawtooth';
    lowOsc.frequency.setValueAtTime(150, now);
    lowOsc.frequency.exponentialRampToValueAtTime(80, now + duration);
    
    // Mid frequency component (main bark tone)
    const midOsc = audioContext.createOscillator();
    const midGain = audioContext.createGain();
    midOsc.type = 'square';
    midOsc.frequency.setValueAtTime(400, now);
    midOsc.frequency.exponentialRampToValueAtTime(200, now + duration * 0.7);
    
    // High frequency component (adds texture)
    const highOsc = audioContext.createOscillator();
    const highGain = audioContext.createGain();
    highOsc.type = 'sawtooth';
    highOsc.frequency.setValueAtTime(800, now);
    highOsc.frequency.exponentialRampToValueAtTime(400, now + duration);
    
    // Create noise for texture
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() - 0.5) * 0.5;
    }
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = audioContext.createGain();
    
    // Filter for the noise to make it more bark-like
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 10;
    
    // Set up gain envelopes
    // Sharp attack, quick decay for "woof" sound
    lowGain.gain.setValueAtTime(0, now);
    lowGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    lowGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    midGain.gain.setValueAtTime(0, now);
    midGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
    midGain.gain.setValueAtTime(0.2, now + 0.02);
    midGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    highGain.gain.setValueAtTime(0, now);
    highGain.gain.linearRampToValueAtTime(0.1, now + 0.003);
    highGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.8);
    
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.002);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.6);
    
    // Connect everything
    lowOsc.connect(lowGain);
    lowGain.connect(audioContext.destination);
    
    midOsc.connect(midGain);
    midGain.connect(audioContext.destination);
    
    highOsc.connect(highGain);
    highGain.connect(audioContext.destination);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    // Start and stop
    lowOsc.start(now);
    lowOsc.stop(now + duration);
    
    midOsc.start(now);
    midOsc.stop(now + duration);
    
    highOsc.start(now);
    highOsc.stop(now + duration);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
}

// Create transform sound
function createTransformSound() {
    const duration = 0.3;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + duration/2);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Create collect sound
function createCollectSound() {
    const duration = 0.2;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Create jump sound
function createJumpSound() {
    const duration = 0.15;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Background music - different themes for each level
let musicOscillators = [];
let musicStartTime = 0;
let isMusicPlaying = false;
let currentMusicLevel = -1;

// Music patterns for different levels
const levelMusic = {
    // Level 1 - Tutorial: Light and playful
    1: {
        bassPattern: [
            {note: 130.81, duration: 0.5, time: 0},    // C
            {note: 164.81, duration: 0.5, time: 0.5},  // E
            {note: 196, duration: 0.5, time: 1},       // G
            {note: 164.81, duration: 0.5, time: 1.5},  // E
            {note: 130.81, duration: 0.5, time: 2},    // C
            {note: 196, duration: 0.5, time: 2.5},     // G
            {note: 164.81, duration: 0.5, time: 3},    // E
            {note: 130.81, duration: 0.5, time: 3.5}   // C
        ],
        melodyPattern: [
            {note: 523.25, duration: 0.25, time: 0},    // High C
            {note: 659.25, duration: 0.25, time: 0.25}, // E
            {note: 783.99, duration: 0.25, time: 0.5},  // G
            {note: 659.25, duration: 0.25, time: 0.75}, // E
            {note: 523.25, duration: 0.5, time: 1},     // C
            {note: 392, duration: 0.5, time: 1.5},      // G
            {note: 329.63, duration: 0.5, time: 2},     // E
            {note: 392, duration: 0.5, time: 2.5},      // G
            {note: 523.25, duration: 0.5, time: 3}      // C
        ],
        tempo: 1
    },
    
    // Level 2 - Backyard: Adventurous
    2: {
        bassPattern: [
            {note: 146.83, duration: 0.5, time: 0},    // D
            {note: 146.83, duration: 0.5, time: 0.5},
            {note: 174.61, duration: 0.5, time: 1},    // F
            {note: 196, duration: 0.5, time: 1.5},     // G
            {note: 146.83, duration: 0.5, time: 2},    // D
            {note: 130.81, duration: 0.5, time: 2.5},  // C
            {note: 110, duration: 0.5, time: 3},       // A
            {note: 146.83, duration: 0.5, time: 3.5}   // D
        ],
        melodyPattern: [
            {note: 293.66, duration: 0.5, time: 0},     // D
            {note: 349.23, duration: 0.25, time: 0.5},  // F
            {note: 392, duration: 0.25, time: 0.75},    // G
            {note: 440, duration: 0.5, time: 1},        // A
            {note: 392, duration: 0.5, time: 1.5},      // G
            {note: 349.23, duration: 0.5, time: 2},     // F
            {note: 293.66, duration: 0.5, time: 2.5},   // D
            {note: 261.63, duration: 0.5, time: 3},     // C
            {note: 293.66, duration: 0.5, time: 3.5}    // D
        ],
        tempo: 1.1
    },
    
    // Level 3 - Boss (Sheep): Heroic/Epic
    3: {
        bassPattern: [
            {note: 110, duration: 0.5, time: 0},       // A
            {note: 110, duration: 0.5, time: 0.5},
            {note: 130.81, duration: 0.5, time: 1},    // C
            {note: 146.83, duration: 0.5, time: 1.5},  // D
            {note: 164.81, duration: 0.5, time: 2},    // E
            {note: 146.83, duration: 0.5, time: 2.5},  // D
            {note: 130.81, duration: 0.5, time: 3},    // C
            {note: 110, duration: 0.5, time: 3.5}      // A
        ],
        melodyPattern: [
            {note: 440, duration: 0.75, time: 0},       // A
            {note: 523.25, duration: 0.25, time: 0.75}, // C
            {note: 659.25, duration: 0.5, time: 1},     // E
            {note: 587.33, duration: 0.5, time: 1.5},   // D
            {note: 523.25, duration: 0.5, time: 2},     // C
            {note: 440, duration: 0.5, time: 2.5},      // A
            {note: 392, duration: 0.5, time: 3},        // G
            {note: 440, duration: 0.5, time: 3.5}       // A
        ],
        tempo: 0.9
    },
    
    // Level 4 - Farmer Chase: Tense/Danger
    4: {
        bassPattern: [
            {note: 82.41, duration: 0.25, time: 0},     // Low E
            {note: 82.41, duration: 0.25, time: 0.25},
            {note: 87.31, duration: 0.25, time: 0.5},   // F
            {note: 82.41, duration: 0.25, time: 0.75},  // E
            {note: 98, duration: 0.5, time: 1},         // G
            {note: 92.5, duration: 0.5, time: 1.5},     // F#
            {note: 87.31, duration: 0.5, time: 2},      // F
            {note: 82.41, duration: 1, time: 2.5}       // E
        ],
        melodyPattern: [
            {note: 329.63, duration: 0.125, time: 0},   // E
            {note: 349.23, duration: 0.125, time: 0.125}, // F
            {note: 329.63, duration: 0.25, time: 0.25}, // E
            {note: 392, duration: 0.25, time: 0.5},     // G
            {note: 369.99, duration: 0.25, time: 0.75}, // F#
            {note: 349.23, duration: 0.5, time: 1},     // F
            {note: 329.63, duration: 0.5, time: 1.5},   // E
            {note: 311.13, duration: 0.5, time: 2},     // Eb
            {note: 329.63, duration: 1, time: 2.5}      // E
        ],
        tempo: 1.2
    },
    
    // Level 5 - Pigeon Chaos: Frantic/Comedic
    5: {
        bassPattern: [
            {note: 130.81, duration: 0.25, time: 0},    // C
            {note: 130.81, duration: 0.25, time: 0.25},
            {note: 196, duration: 0.25, time: 0.5},     // G
            {note: 130.81, duration: 0.25, time: 0.75}, // C
            {note: 174.61, duration: 0.25, time: 1},    // F
            {note: 130.81, duration: 0.25, time: 1.25}, // C
            {note: 196, duration: 0.25, time: 1.5},     // G
            {note: 130.81, duration: 0.25, time: 1.75}, // C
        ],
        melodyPattern: [
            {note: 659.25, duration: 0.125, time: 0},   // E
            {note: 783.99, duration: 0.125, time: 0.125}, // G
            {note: 659.25, duration: 0.125, time: 0.25}, // E
            {note: 523.25, duration: 0.125, time: 0.375}, // C
            {note: 783.99, duration: 0.125, time: 0.5},   // G
            {note: 987.77, duration: 0.125, time: 0.625}, // B
            {note: 783.99, duration: 0.125, time: 0.75},  // G
            {note: 659.25, duration: 0.125, time: 0.875}, // E
            {note: 523.25, duration: 0.25, time: 1},      // C
            {note: 587.33, duration: 0.25, time: 1.25},   // D
            {note: 659.25, duration: 0.25, time: 1.5},    // E
            {note: 783.99, duration: 0.25, time: 1.75}    // G
        ],
        tempo: 1.5
    }
};

function createBackgroundMusic(level = currentLevel) {
    // Stop current music if playing
    if (isMusicPlaying) {
        stopBackgroundMusic();
    }
    
    // Don't restart if same level
    if (currentMusicLevel === level) {
        isMusicPlaying = true;
        return;
    }
    
    currentMusicLevel = level;
    isMusicPlaying = true;
    musicStartTime = audioContext.currentTime;
    
    const musicData = levelMusic[level] || levelMusic[1]; // Default to level 1 music
    const { bassPattern, melodyPattern, tempo } = musicData;
    
    function playPattern() {
        const loopDuration = 4 / tempo; // Adjust tempo
        
        // Bass
        bassPattern.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = level === 4 ? 'sawtooth' : 'triangle'; // Harsher sound for danger level
            osc.frequency.value = note.note;
            
            gain.gain.setValueAtTime(0, musicStartTime + note.time / tempo);
            gain.gain.linearRampToValueAtTime(0.1, musicStartTime + note.time / tempo + 0.01);
            gain.gain.setValueAtTime(0.1, musicStartTime + (note.time + note.duration - 0.01) / tempo);
            gain.gain.linearRampToValueAtTime(0, musicStartTime + (note.time + note.duration) / tempo);
            
            osc.connect(gain);
            gain.connect(musicGainNode);
            
            osc.start(musicStartTime + note.time / tempo);
            osc.stop(musicStartTime + (note.time + note.duration) / tempo);
            
            musicOscillators.push(osc);
        });
        
        // Melody
        melodyPattern.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = level === 3 ? 'square' : 'sine'; // Heroic sound for boss
            osc.frequency.value = note.note;
            
            gain.gain.setValueAtTime(0, musicStartTime + note.time / tempo);
            gain.gain.linearRampToValueAtTime(0.08, musicStartTime + note.time / tempo + 0.01);
            gain.gain.setValueAtTime(0.08, musicStartTime + (note.time + note.duration - 0.01) / tempo);
            gain.gain.linearRampToValueAtTime(0, musicStartTime + (note.time + note.duration) / tempo);
            
            osc.connect(gain);
            gain.connect(musicGainNode);
            
            osc.start(musicStartTime + note.time / tempo);
            osc.stop(musicStartTime + (note.time + note.duration) / tempo);
            
            musicOscillators.push(osc);
        });
        
        // Schedule next loop
        musicStartTime += loopDuration;
        if (isMusicPlaying) {
            setTimeout(playPattern, loopDuration * 1000 - 100); // Small overlap
        }
    }
    
    playPattern();
}

function stopBackgroundMusic() {
    isMusicPlaying = false;
    currentMusicLevel = -1; // Reset so new music plays
    musicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {
            // Already stopped
        }
    });
    musicOscillators = [];
}

// Game state
let gameStarted = false;
let currentLevel = 1;
let treatCount = 0;
let lastTransformTime = 0;
let playerLife = 100;
let maxLife = 100;
let maxPlayerLife = 100;
let particles = [];

// Message system
let gameMessage = '';
let messageTimer = 0;
let messageOpacity = 1;

function showMessage(text, duration = 180) {
    gameMessage = text;
    messageTimer = duration;
    messageOpacity = 1;
}

function updateMessage() {
    if (messageTimer > 0) {
        messageTimer--;
        if (messageTimer < 30) {
            messageOpacity = messageTimer / 30;
        }
    }
}

function drawMessage() {
    if (messageTimer > 0 && gameMessage) {
        ctx.save();
        
        // Set font before measuring
        ctx.font = 'bold 20px Arial';
        
        // Draw background box
        const textWidth = ctx.measureText(gameMessage).width;
        const boxWidth = Math.min(textWidth + 40, canvas.width - 40);
        const boxHeight = 60;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = 100;
        
        ctx.globalAlpha = messageOpacity * 0.9;
        ctx.fillStyle = '#333';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw text
        ctx.globalAlpha = messageOpacity;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gameMessage, canvas.width / 2, boxY + boxHeight / 2);
        
        ctx.restore();
    }
}

function drawTreatCounter() {
    const treatsLeft = level.objects.filter(obj => obj.type === 'treat').length;
    
    if (treatsLeft > 0) {
        ctx.save();
        
        // Position in top right
        const x = canvas.width - 150;
        const y = 20;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 10, y - 5, 140, 30);
        
        // Text
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = treatsLeft <= 2 ? '#ffff00' : '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`Treats left: ${treatsLeft}`, x, y + 15);
        
        // Pulse effect when only a few left
        if (treatsLeft <= 2) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`Treats left: ${treatsLeft}`, x, y + 15);
        }
        
        ctx.restore();
    }
}

function drawLifeBar() {
    ctx.save();
    
    // Position
    const x = 20;
    const y = 60;
    const width = 200;
    const height = 25;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
    
    // Life bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Life bar fill
    const lifePercent = Math.max(0, playerLife) / maxLife;
    const lifeWidth = width * lifePercent;
    
    // Color based on life amount
    if (lifePercent > 0.6) {
        ctx.fillStyle = '#4CAF50';
    } else if (lifePercent > 0.3) {
        ctx.fillStyle = '#FFC107';
    } else {
        ctx.fillStyle = '#F44336';
    }
    
    ctx.fillRect(x, y, lifeWidth, height);
    
    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player && !player.isHuman ? 'Energy' : 'Health', x + width/2, y + height/2);
    
    // Low energy warning
    if (playerLife < 30 && !player.isHuman) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('DANGER! Press N to nap or die!', x + width/2, y + height + 15);
    }
    
    ctx.restore();
}

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Level selection with number keys (for testing)
    if (gameStarted && e.key >= '1' && e.key <= '9') {
        const levelNum = parseInt(e.key);
        if (levelNum <= levels.length) {
            currentLevel = levelNum;
            level = new Level(levels[currentLevel - 1]);
            player = new Player(level.startX, level.startY);
            playerLife = maxLife; // Reset life
            document.getElementById('currentLevel').textContent = currentLevel;
            
            // Clear keys to prevent movement
            for (let key in keys) {
                keys[key] = false;
            }
            
            // Change music for new level
            createBackgroundMusic(currentLevel);
            
            showMessage(`Jumped to Level ${levelNum}`, 90);
        }
    }
    
    e.preventDefault();
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    e.preventDefault();
});


// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.velX = 0;
        this.velY = 0;
        this.isHuman = true;
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Corgi specific
        this.barkCooldown = 0;
        this.sniffMode = false;
        this.sniffRadius = 100;
        this.isNapping = false;
        this.napTimer = 0;
        
        // Visual effects
        this.transformParticles = [];
        this.barkWaves = [];
        this.sleepZ = [];
    }
    
    update(deltaTime) {
        // Life drain for corgi (energy system)
        if (!this.isHuman && !this.isNapping) {
            playerLife -= 0.05; // Slow drain
            if (this.velX !== 0) playerLife -= 0.05; // Extra drain when moving
            if (this.sniffMode) playerLife -= 0.1; // Extra drain when sniffing
            
            // Die if energy reaches 0
            if (playerLife <= 0) {
                showMessage('You collapsed from exhaustion!', 120);
                resetLevel();
                return;
            }
        }
        
        // Handle napping
        if (this.isNapping) {
            this.velX *= 0.9;
            this.napTimer--;
            playerLife = Math.min(maxLife, playerLife + 0.5); // Restore life
            
            // Create sleep Z's
            if (Math.random() < 0.1) {
                this.sleepZ.push({
                    x: this.x + this.width/2,
                    y: this.y,
                    size: 10 + Math.random() * 10,
                    life: 60
                });
            }
            
            if (this.napTimer <= 0 || playerLife >= 80) {
                this.isNapping = false;
                showMessage('Refreshed!', 60);
            }
            
            // Update sleep effects
            this.sleepZ = this.sleepZ.filter(z => {
                z.y -= 0.5;
                z.x += Math.sin(z.life * 0.1) * 0.5;
                z.life--;
                return z.life > 0;
            });
            
            return; // Skip other input during nap
        }
        
        // Handle input
        if (keys['arrowleft'] || keys['a']) {
            this.velX = this.isHuman ? -MOVE_SPEED : -CORGI_MOVE_SPEED;
            this.facing = -1;
        } else if (keys['arrowright'] || keys['d']) {
            this.velX = this.isHuman ? MOVE_SPEED : CORGI_MOVE_SPEED;
            this.facing = 1;
        } else {
            this.velX *= 0.8; // Friction
            if (Math.abs(this.velX) < 0.1) this.velX = 0; // Stop completely when very slow
        }
        
        // Jump
        if ((keys[' '] || keys['arrowup'] || keys['w']) && this.onGround) {
            this.velY = this.isHuman ? JUMP_FORCE : JUMP_FORCE * 0.8;
            this.onGround = false;
            createJumpSound();
        }
        
        // Transform
        if (keys['t'] && Date.now() - lastTransformTime > TRANSFORM_COOLDOWN) {
            this.transform();
            lastTransformTime = Date.now();
        }
        
        // Corgi abilities
        if (!this.isHuman) {
            // Bark
            if (keys['b'] && this.barkCooldown <= 0) {
                this.bark();
                this.barkCooldown = 30;
            }
            this.barkCooldown = Math.max(0, this.barkCooldown - 1);
            
            // Sniff
            this.sniffMode = keys['s'];
            
            // Voluntary nap
            if (keys['n'] && this.onGround && !this.isNapping) {
                this.startNap();
            }
        } else {
            // Can't use corgi abilities as human
            this.sniffMode = false;
        }
        
        // Apply physics
        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;
        
        // Update animation
        this.animationTimer++;
        if (this.animationTimer > 8) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
        
        // Update particles
        this.updateParticles();
        this.updateBarkWaves();
    }
    
    transform() {
        // Check if we're stuck as corgi in farmer level
        if (currentLevel === 4 && !this.isHuman) {
            const melonsLeft = level.objects.filter(obj => obj.type === 'melon').length;
            if (melonsLeft > 0) {
                showMessage(`Can't transform! Eat all ${melonsLeft} melon${melonsLeft > 1 ? 's' : ''} first!`, 120);
                return;
            }
        }
        
        this.isHuman = !this.isHuman;
        
        // Adjust dimensions
        if (this.isHuman) {
            this.width = 40;
            this.height = 60;
            // Restore life when transforming to human
            playerLife = maxLife;
        } else {
            this.width = 50;
            this.height = 35;
            this.y += 25; // Adjust position so feet stay on ground
        }
        
        // Play transform sound
        createTransformSound();
        
        // Create transform particles
        for (let i = 0; i < 20; i++) {
            this.transformParticles.push({
                x: this.x + this.width/2 + (Math.random() - 0.5) * 40,
                y: this.y + this.height/2 + (Math.random() - 0.5) * 40,
                velX: (Math.random() - 0.5) * 4,
                velY: (Math.random() - 0.5) * 4,
                life: 30,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`
            });
        }
        
        // Update UI
        document.getElementById('currentForm').textContent = this.isHuman ? 'Human' : 'Corgi';
    }
    
    startNap() {
        this.isNapping = true;
        this.napTimer = 180; // 3 seconds at 60fps
        this.velX = 0;
        this.sleepZ = [];
    }
    
    bark() {
        // Play bark sound
        createBarkSound();
        
        this.barkWaves.push({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            radius: 10,
            maxRadius: 100,
            opacity: 1
        });
        
        // Check for interactable objects
        level.objects.forEach(obj => {
            if (obj.type === 'lever' || obj.type === 'button') {
                const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
                if (dist < 100) {
                    obj.activated = !obj.activated;
                }
            }
        });
    }
    
    updateParticles() {
        this.transformParticles = this.transformParticles.filter(p => {
            p.x += p.velX;
            p.y += p.velY;
            p.velY += 0.2;
            p.life--;
            return p.life > 0;
        });
    }
    
    updateBarkWaves() {
        this.barkWaves = this.barkWaves.filter(wave => {
            wave.radius += 4;
            wave.opacity = 1 - (wave.radius / wave.maxRadius);
            return wave.radius < wave.maxRadius;
        });
    }
    
    draw() {
        ctx.save();
        
        // Flip sprite if facing left
        if (this.facing === -1) {
            ctx.translate(this.x + this.width/2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x - this.width/2, 0);
        }
        
        // Draw character
        if (this.isHuman) {
            // Human form
            ctx.fillStyle = '#f4a460';
            ctx.fillRect(this.x + 10, this.y + 5, 20, 20); // Head
            ctx.fillStyle = '#4169e1';
            ctx.fillRect(this.x + 5, this.y + 25, 30, 20); // Body
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x + 8, this.y + 45, 10, 15); // Left leg
            ctx.fillRect(this.x + 22, this.y + 45, 10, 15); // Right leg
            
            // Arms
            const armOffset = Math.sin(this.animationFrame * 0.5) * 5;
            ctx.fillRect(this.x - 2, this.y + 25 + armOffset, 8, 15);
            ctx.fillRect(this.x + 34, this.y + 25 - armOffset, 8, 15);
        } else {
            // Corgi form
            ctx.fillStyle = '#ff8c42';
            
            if (this.isNapping) {
                // Curled up sleeping position
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(-Math.PI/6);
                ctx.fillRect(-20, -10, 35, 20); // Body
                ctx.fillRect(10, -15, 15, 15); // Head
                ctx.restore();
                
                // Closed eyes
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + 37, this.y + 8);
                ctx.lineTo(this.x + 41, this.y + 8);
                ctx.moveTo(this.x + 44, this.y + 8);
                ctx.lineTo(this.x + 48, this.y + 8);
                ctx.stroke();
            } else {
                ctx.fillRect(this.x + 5, this.y + 10, 35, 20); // Body
                ctx.fillRect(this.x + 35, this.y + 5, 15, 15); // Head (moved to right side)
                
                // Legs (stubby!)
                const legOffset = Math.sin(this.animationFrame * 0.8) * 2;
                ctx.fillStyle = '#d2691e';
                ctx.fillRect(this.x + 8, this.y + 25, 6, 10 + legOffset);
                ctx.fillRect(this.x + 16, this.y + 25, 6, 10 - legOffset);
                ctx.fillRect(this.x + 24, this.y + 25, 6, 10 + legOffset);
                ctx.fillRect(this.x + 32, this.y + 25, 6, 10 - legOffset);
            }
            
            // Tail (moved to left side)
            ctx.fillStyle = '#ff8c42';
            const tailWag = Math.sin(this.animationFrame * 0.3) * 10;
            ctx.fillRect(this.x - 12, this.y + 12 + tailWag, 12, 8);
            
            // Ears (moved to right side with head)
            ctx.fillStyle = '#d2691e';
            ctx.fillRect(this.x + 37, this.y, 5, 8);
            ctx.fillRect(this.x + 43, this.y, 5, 8);
        }
        
        ctx.restore();
        
        // Draw effects
        this.drawEffects();
    }
    
    drawEffects() {
        // Transform particles
        this.transformParticles.forEach(p => {
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        ctx.globalAlpha = 1;
        
        // Bark waves
        this.barkWaves.forEach(wave => {
            ctx.strokeStyle = `rgba(255, 200, 100, ${wave.opacity})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Sniff mode
        if (this.sniffMode && !this.isHuman) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.sniffRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Sleep Z's
        this.sleepZ.forEach(z => {
            ctx.save();
            ctx.globalAlpha = z.life / 60;
            ctx.font = `${z.size}px Arial`;
            ctx.fillStyle = '#4169e1';
            ctx.fillText('Z', z.x, z.y);
            ctx.restore();
        });
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    draw() {
        if (this.type === 'normal') {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add grass on top
            ctx.fillStyle = '#228b22';
            ctx.fillRect(this.x, this.y, this.width, 5);
        } else if (this.type === 'moving') {
            ctx.fillStyle = '#4682b4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Interactive object class
class InteractiveObject {
    constructor(x, y, type, hidden = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.activated = false;
        this.width = type === 'pen' ? 150 : 40;
        this.height = type === 'pen' ? 100 : 40;
        this.hidden = hidden; // For hidden treats
        this.discovered = false; // Once found, stays visible
        this.pulseAnimation = 0;
    }
    
    draw() {
        if (this.type === 'lever') {
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x + 15, this.y + 20, 10, 20);
            
            ctx.save();
            ctx.translate(this.x + 20, this.y + 20);
            ctx.rotate(this.activated ? Math.PI/4 : -Math.PI/4);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-3, -15, 6, 20);
            ctx.restore();
        } else if (this.type === 'treat') {
            // Update pulse animation
            this.pulseAnimation += 0.05;
            
            // Check if treat should be visible
            const isVisible = !this.hidden || this.discovered;
            const isBeingSniffed = this.hidden && !this.discovered && player && 
                !player.isHuman && player.sniffMode &&
                Math.hypot(this.x + 20 - (player.x + player.width/2), 
                          this.y + 20 - (player.y + player.height/2)) < player.sniffRadius;
            
            if (isVisible || isBeingSniffed) {
                ctx.save();
                
                // If being sniffed but not discovered, show as translucent
                if (isBeingSniffed && !this.discovered) {
                    ctx.globalAlpha = 0.5 + Math.sin(this.pulseAnimation) * 0.3;
                }
                
                // Dog treat
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(this.x + 20, this.y + 20, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Shine effect
                ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x + 20, this.y + 20, 15 + Math.sin(this.pulseAnimation) * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Special effect for hidden treats being discovered
                if (this.hidden && isBeingSniffed) {
                    ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(this.x + 20, this.y + 20, 25 + Math.sin(this.pulseAnimation * 2) * 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                
                ctx.restore();
            }
        } else if (this.type === 'door') {
            ctx.fillStyle = this.activated ? '#90ee90' : '#dc143c';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'melon') {
            // Draw a watermelon
            ctx.save();
            
            // Main melon body
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.ellipse(this.x + 20, this.y + 20, 20, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Dark stripes
            ctx.strokeStyle = '#1b5e20';
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + 10 + i * 8, this.y + 5);
                ctx.lineTo(this.x + 10 + i * 8, this.y + 35);
                ctx.stroke();
            }
            
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(this.x + 15, this.y + 15, 8, 6, -Math.PI/4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        } else if (this.type === 'pen') {
            // Sheep pen goal area
            // Floor/base
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            ctx.fillRect(this.x, this.y + this.height - 20, this.width, 20);
            
            // Fence
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Gate posts
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x - 5, this.y, 10, this.height);
            ctx.fillRect(this.x + this.width - 5, this.y, 10, this.height);
            
            // Back fence (to show depth)
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 20);
            ctx.lineTo(this.x + this.width, this.y + 20);
            ctx.stroke();
            
            // Sign
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('SHEEP PEN', this.x + 10, this.y + this.height + 20);
        }
    }
}

// Farmer enemy class
class Farmer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 70;
        this.velX = 0;
        this.velY = 0;
        this.speed = 2;
        this.onGround = false;
        this.facing = -1;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // AI state
        this.state = 'patrol'; // patrol, chase, stunned, fleeing
        this.patrolStart = x;
        this.patrolRange = 200;
        this.stateTimer = 0;
        this.health = 3;
        this.hitCooldown = 0;
        this.isDefeated = false;
        
        // Visual effects
        this.flashTimer = 0;
        this.sweatDrops = [];
    }
    
    update(player) {
        if (this.isDefeated) return;
        
        this.hitCooldown = Math.max(0, this.hitCooldown - 1);
        this.flashTimer = Math.max(0, this.flashTimer - 1);
        
        // Distance to player
        const distX = player.x - this.x;
        const dist = Math.abs(distX);
        
        // State machine
        switch(this.state) {
            case 'patrol':
                // Patrol back and forth
                if (this.x <= this.patrolStart - this.patrolRange) {
                    this.velX = this.speed;
                } else if (this.x >= this.patrolStart + this.patrolRange) {
                    this.velX = -this.speed;
                } else if (this.velX === 0) {
                    this.velX = this.speed;
                }
                
                // Start chasing if player is close
                if (dist < 150 && !player.isHuman) {
                    this.state = 'chase';
                    showMessage('The farmer spotted you!', 120);
                }
                break;
                
            case 'chase':
                // Chase the player
                if (!player.isHuman) {
                    this.velX = distX > 0 ? this.speed * 1.5 : -this.speed * 1.5;
                    
                    // Create sweat drops when chasing
                    if (Math.random() < 0.1) {
                        this.sweatDrops.push({
                            x: this.x + this.width/2,
                            y: this.y + 10,
                            velX: (Math.random() - 0.5) * 2,
                            velY: -2,
                            life: 20
                        });
                    }
                    
                    // Stop chasing if player transforms or gets far away
                    if (player.isHuman || dist > 300) {
                        this.state = 'patrol';
                        this.velX = 0;
                    }
                } else {
                    this.state = 'fleeing';
                    this.stateTimer = 60;
                }
                break;
                
            case 'stunned':
                this.velX *= 0.8;
                this.stateTimer--;
                if (this.stateTimer <= 0) {
                    this.state = 'patrol';
                }
                break;
                
            case 'fleeing':
                // Run away from human player
                this.velX = distX > 0 ? -this.speed * 2 : this.speed * 2;
                this.stateTimer--;
                
                if (this.stateTimer <= 0 || dist > 200) {
                    this.state = 'patrol';
                }
                break;
        }
        
        // Update facing
        if (Math.abs(this.velX) > 0.1) {
            this.facing = this.velX > 0 ? 1 : -1;
        }
        
        // Apply physics
        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;
        
        // Update animation
        this.animationTimer++;
        if (this.animationTimer > 8) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
        
        // Update effects
        this.sweatDrops = this.sweatDrops.filter(drop => {
            drop.x += drop.velX;
            drop.y += drop.velY;
            drop.velY += 0.3;
            drop.life--;
            return drop.life > 0;
        });
    }
    
    takeDamage() {
        if (this.hitCooldown > 0) return;
        
        this.health--;
        this.hitCooldown = 60;
        this.flashTimer = 30;
        this.state = 'stunned';
        this.stateTimer = 30;
        this.velX = this.facing * -5; // Knockback
        
        if (this.health <= 0) {
            this.isDefeated = true;
            showMessage('Farmer defeated! He ran away!', 180);
        } else {
            showMessage(`Farmer health: ${this.health}/3`, 90);
        }
    }
    
    draw() {
        if (this.isDefeated) return;
        
        ctx.save();
        
        // Flash when hit
        if (this.flashTimer > 0 && this.flashTimer % 6 < 3) {
            ctx.globalAlpha = 0.5;
        }
        
        // Flip sprite
        if (this.facing === -1) {
            ctx.translate(this.x + this.width/2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x - this.width/2, 0);
        }
        
        // Draw farmer
        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 15, this.y + 5, 20, 20);
        
        // Hat
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x + 10, this.y, 30, 8);
        ctx.fillRect(this.x + 5, this.y + 5, 40, 3);
        
        // Body (overalls)
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(this.x + 10, this.y + 25, 30, 30);
        
        // Shirt
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 10, this.y + 25, 30, 15);
        
        // Arms
        const armSwing = Math.sin(this.animationFrame * 0.5) * 10;
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 5, this.y + 25 + armSwing, 8, 20);
        ctx.fillRect(this.x + 37, this.y + 25 - armSwing, 8, 20);
        
        // Legs
        const legSwing = Math.sin(this.animationFrame * 0.8) * 5;
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(this.x + 15, this.y + 55, 10, 15 + legSwing);
        ctx.fillRect(this.x + 25, this.y + 55, 10, 15 - legSwing);
        
        // Pitchfork (when chasing)
        if (this.state === 'chase') {
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 45, this.y + 30);
            ctx.lineTo(this.x + 60, this.y + 10);
            ctx.stroke();
            
            // Fork part
            ctx.strokeStyle = '#666';
            ctx.beginPath();
            ctx.moveTo(this.x + 55, this.y + 15);
            ctx.lineTo(this.x + 60, this.y + 10);
            ctx.lineTo(this.x + 65, this.y + 15);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw sweat drops
        ctx.fillStyle = '#4169e1';
        this.sweatDrops.forEach(drop => {
            ctx.globalAlpha = drop.life / 20;
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Show state for debugging
        if (this.state === 'chase') {
            ctx.fillStyle = 'red';
            ctx.font = '16px Arial';
            ctx.fillText('!', this.x + this.width/2 - 4, this.y - 10);
        }
    }
}

// Pigeon class
class Pigeon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.width = 25;
        this.height = 20;
        this.velX = 0;
        this.velY = 0;
        this.facing = Math.random() > 0.5 ? 1 : -1;
        
        // Flying state
        this.isFlying = false;
        this.flightHeight = 150 + Math.random() * 100; // Random flight height
        this.targetY = y;
        this.landingTimer = 0;
        this.takeoffSpeed = 8;
        
        // Animation
        this.wingFlap = 0;
        this.bobAmount = 0;
        
        // Pigeon behavior
        this.walkSpeed = 0.5 + Math.random() * 0.5;
        this.panicTimer = 0;
        this.hasLeftScreen = false;
    }
    
    update(player, pigeons) {
        if (this.hasLeftScreen) return;
        
        // Check if all pigeons are flying
        const allFlying = pigeons.every(p => p.isFlying || p.hasLeftScreen);
        
        if (allFlying && this.isFlying) {
            // Fly away off screen
            this.velX = 3 * this.facing;
            this.velY = -1;
            this.x += this.velX;
            this.y += this.velY;
            
            if (this.x < -50 || this.x > canvas.width + 50) {
                this.hasLeftScreen = true;
            }
            return;
        }
        
        // React to bark waves
        player.barkWaves.forEach(wave => {
            const dist = Math.hypot(wave.x - (this.x + this.width/2), wave.y - (this.y + this.height/2));
            if (dist < wave.radius && wave.radius < 120 && !this.isFlying) {
                this.isFlying = true;
                this.panicTimer = 180; // 3 seconds of flight
                this.velY = -this.takeoffSpeed;
                this.targetY = this.y - this.flightHeight;
                
                // Panic direction away from bark
                this.facing = wave.x < this.x ? 1 : -1;
                this.velX = this.facing * 2;
            }
        });
        
        if (this.isFlying) {
            // Flying behavior
            this.panicTimer--;
            
            // Wing flapping
            this.wingFlap += 0.3;
            
            // Vertical movement
            if (this.y > this.targetY) {
                this.velY = Math.max(this.velY - 0.3, -4);
            } else {
                this.velY = Math.min(this.velY + 0.1, 0);
                
                // Hover at target height
                if (Math.abs(this.y - this.targetY) < 10) {
                    this.velY = Math.sin(Date.now() * 0.005) * 0.5;
                }
            }
            
            // Horizontal movement (slow down over time)
            this.velX *= 0.98;
            
            // Try to land when panic wears off
            if (this.panicTimer <= 0 && !allFlying) {
                this.isFlying = false;
                this.targetY = this.startY;
                this.landingTimer = 60;
            }
        } else {
            // Ground behavior
            if (this.landingTimer > 0) {
                // Landing
                this.landingTimer--;
                this.velY = Math.min(this.velY + 0.5, 5);
                
                if (this.y >= this.startY) {
                    this.y = this.startY;
                    this.velY = 0;
                    this.landingTimer = 0;
                }
            } else {
                // Walking/pecking
                this.y = this.startY;
                
                // Random walk
                if (Math.random() < 0.02) {
                    this.facing *= -1;
                }
                
                this.velX = this.walkSpeed * this.facing;
                
                // Pecking animation
                this.bobAmount = Math.abs(Math.sin(Date.now() * 0.01)) * 3;
            }
            
            // Wing rest position
            this.wingFlap = Math.sin(Date.now() * 0.002) * 0.1;
        }
        
        // Apply movement
        this.x += this.velX;
        this.y += this.velY;
        
        // Keep in bounds when walking
        if (!this.isFlying && !this.hasLeftScreen) {
            if (this.x < 0) {
                this.x = 0;
                this.facing = 1;
            }
            if (this.x + this.width > canvas.width) {
                this.x = canvas.width - this.width;
                this.facing = -1;
            }
        }
    }
    
    draw() {
        if (this.hasLeftScreen) return;
        
        ctx.save();
        
        // Flip sprite
        if (this.facing === -1) {
            ctx.translate(this.x + this.width/2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x - this.width/2, 0);
        }
        
        // Body
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.ellipse(this.x + 12, this.y + 10 + this.bobAmount, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 5 + this.bobAmount, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 5 + this.bobAmount);
        ctx.lineTo(this.x + 28, this.y + 6 + this.bobAmount);
        ctx.lineTo(this.x + 25, this.y + 7 + this.bobAmount);
        ctx.closePath();
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 21, this.y + 4 + this.bobAmount, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        const wingAngle = this.isFlying ? Math.sin(this.wingFlap) * 0.8 : this.wingFlap;
        ctx.fillStyle = '#5a6a7a';
        
        // Left wing
        ctx.save();
        ctx.translate(this.x + 10, this.y + 10 + this.bobAmount);
        ctx.rotate(-wingAngle);
        ctx.fillRect(-8, -3, 12, 6);
        ctx.restore();
        
        // Right wing
        ctx.save();
        ctx.translate(this.x + 14, this.y + 10 + this.bobAmount);
        ctx.rotate(wingAngle);
        ctx.fillRect(-4, -3, 12, 6);
        ctx.restore();
        
        // Tail
        ctx.fillStyle = '#4a5a6a';
        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y + 12 + this.bobAmount);
        ctx.lineTo(this.x - 2, this.y + 8 + this.bobAmount);
        ctx.lineTo(this.x, this.y + 15 + this.bobAmount);
        ctx.lineTo(this.x + 4, this.y + 15 + this.bobAmount);
        ctx.closePath();
        ctx.fill();
        
        // Legs (only when not flying high)
        if (!this.isFlying || this.landingTimer > 0) {
            ctx.strokeStyle = '#ff6347';
            ctx.lineWidth = 1;
            const legBend = this.isFlying ? 0 : Math.sin(Date.now() * 0.01 + this.x) * 2;
            
            ctx.beginPath();
            ctx.moveTo(this.x + 8, this.y + 16);
            ctx.lineTo(this.x + 8, this.y + 20 + legBend);
            ctx.moveTo(this.x + 16, this.y + 16);
            ctx.lineTo(this.x + 16, this.y + 20 - legBend);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Show panic state
        if (this.isFlying && this.panicTimer > 120) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y - 10, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText('!', this.x + this.width/2 - 3, this.y - 7);
        }
    }
}

// Sheep boss class
class Sheep {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 40;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
        this.facing = 1;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Sheep behavior
        this.state = 'grazing'; // grazing, fleeing, stubborn
        this.stateTimer = 0;
        this.targetX = x;
        this.fleeDirection = 0;
        this.stubbornness = 0;
        this.isInPen = false;
        
        // Visual
        this.woolBounce = 0;
    }
    
    update(player, barkWaves) {
        // Check if sheep is in pen (check from sheep's feet position)
        const pen = level.objects.find(obj => obj.type === 'pen');
        if (pen && this.x > pen.x && this.x + this.width < pen.x + pen.width &&
            this.y + this.height > pen.y + 20 && this.y + this.height < pen.y + pen.height + 20) {
            this.isInPen = true;
            this.state = 'grazing';
            this.velX = 0;
        }
        
        if (this.isInPen) return;
        
        // React to bark waves
        let barkForce = 0;
        let barkAngle = 0;
        barkWaves.forEach(wave => {
            const dist = Math.hypot(wave.x - (this.x + this.width/2), wave.y - (this.y + this.height/2));
            if (dist < wave.radius && wave.radius < 80) {
                // Calculate push direction
                const angle = Math.atan2(this.y + this.height/2 - wave.y, this.x + this.width/2 - wave.x);
                barkForce = (1 - dist / 80) * 8;
                barkAngle = angle;
                this.fleeDirection = Math.cos(angle) > 0 ? 1 : -1;
                this.state = 'fleeing';
                this.stateTimer = 60;
                this.stubbornness = Math.max(0, this.stubbornness - 1);
                
                // If bark comes from below, make sheep jump
                if (this.onGround && Math.sin(angle) < -0.3) { // More generous angle
                    this.velY = -14; // Stronger jump force
                }
            }
        });
        
        // State machine
        this.stateTimer--;
        
        switch(this.state) {
            case 'grazing':
                this.velX *= 0.9;
                this.woolBounce = Math.sin(Date.now() * 0.003) * 2;
                
                // Randomly become stubborn
                if (Math.random() < 0.001) {
                    this.state = 'stubborn';
                    this.stateTimer = 120;
                    this.stubbornness = 3;
                }
                break;
                
            case 'fleeing':
                if (barkForce > 0) {
                    this.velX = this.fleeDirection * barkForce;
                    // Add slight upward push when barked at from below
                    if (barkAngle && Math.sin(barkAngle) < -0.2 && !this.onGround) {
                        this.velY -= 0.5; // Small upward boost while in air
                    }
                } else {
                    this.velX *= 0.85;
                }
                this.woolBounce = Math.abs(Math.sin(Date.now() * 0.01) * 4);
                
                if (this.stateTimer <= 0) {
                    this.state = this.stubbornness > 0 ? 'stubborn' : 'grazing';
                }
                break;
                
            case 'stubborn':
                // Sheep plants its feet and won't move
                this.velX *= 0.5;
                this.woolBounce = 0;
                
                if (this.stateTimer <= 0) {
                    this.state = 'grazing';
                }
                break;
        }
        
        // Apply physics (lighter gravity for sheep)
        this.velY += GRAVITY * 0.8;
        this.x += this.velX;
        this.y += this.velY;
        
        // Update animation
        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
        
        // Update facing direction
        if (Math.abs(this.velX) > 0.5) {
            this.facing = this.velX > 0 ? 1 : -1;
        }
    }
    
    draw() {
        ctx.save();
        
        // Flip if facing left
        if (this.facing === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, -this.y);
        }
        
        // Draw sheep body (fluffy!)
        ctx.fillStyle = '#f0f0f0';
        
        // Main body with wool texture
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.beginPath();
                ctx.arc(
                    this.x + 10 + i * 15 + Math.sin(i + j) * 2, 
                    this.y + 10 + j * 10 + this.woolBounce, 
                    12, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Head
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 5, this.y + 10, 15, 15);
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 2, this.y + 12, 4, 4);
        ctx.fillRect(this.x + 5, this.y + 12, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y + 13, 2, 2);
        ctx.fillRect(this.x + 7, this.y + 13, 2, 2);
        
        // Legs
        ctx.fillStyle = '#333';
        const legOffset = Math.sin(this.animationFrame * 0.5) * 2;
        ctx.fillRect(this.x + 10, this.y + 30, 4, 10 + legOffset);
        ctx.fillRect(this.x + 20, this.y + 30, 4, 10 - legOffset);
        ctx.fillRect(this.x + 35, this.y + 30, 4, 10 + legOffset);
        ctx.fillRect(this.x + 45, this.y + 30, 4, 10 - legOffset);
        
        // Show state indicator
        if (this.state === 'stubborn') {
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText('!', this.x + this.width/2 - 5, this.y - 5);
        }
        
        ctx.restore();
        
        // Victory indicator if in pen
        if (this.isInPen) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Level class
class Level {
    constructor(levelData) {
        this.platforms = levelData.platforms || [];
        this.objects = levelData.objects || [];
        this.startX = levelData.startX || 100;
        this.startY = levelData.startY || 300;
        this.background = levelData.background || '#87ceeb';
        this.sheep = levelData.sheep || null;
        this.farmers = levelData.farmers || [];
        this.pigeons = levelData.pigeons || [];
        this.isBossLevel = levelData.isBossLevel || false;
        this.isPigeonLevel = levelData.isPigeonLevel || false;
    }
    
    draw() {
        // Draw background
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + Date.now() * 0.02) % (canvas.width + 100) - 50;
            const y = 50 + i * 30;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
            ctx.arc(x + 45, y, 20, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw());
        
        // Draw objects
        this.objects.forEach(obj => obj.draw());
        
        // Draw sheep if present
        if (this.sheep) {
            this.sheep.draw();
        }
        
        // Draw farmers
        this.farmers.forEach(farmer => farmer.draw());
        
        // Draw pigeons
        this.pigeons.forEach(pigeon => pigeon.draw());
    }
}

// Create levels
const levels = [
    // Level 1 - Tutorial
    {
        platforms: [
            new Platform(0, 500, 400, 76),
            new Platform(450, 450, 200, 126),
            new Platform(700, 400, 150, 176),
            new Platform(900, 350, 124, 226)
        ],
        objects: [
            new InteractiveObject(300, 460, 'treat'),
            new InteractiveObject(600, 410, 'lever'),
            new InteractiveObject(800, 360, 'treat'),
            new InteractiveObject(150, 460, 'treat', true), // Hidden treat
            new InteractiveObject(520, 410, 'treat', true)  // Hidden treat
        ],
        startX: 100,
        startY: 400,
        background: '#87ceeb'
    },
    // Level 2 - Backyard
    {
        platforms: [
            new Platform(0, 500, 300, 76),
            new Platform(350, 500, 200, 76),
            new Platform(200, 350, 100, 20),
            new Platform(400, 300, 100, 20),
            new Platform(600, 400, 150, 176),
            new Platform(800, 500, 224, 76)
        ],
        objects: [
            new InteractiveObject(250, 310, 'treat'),
            new InteractiveObject(450, 260, 'lever'),
            new InteractiveObject(700, 460, 'door'),
            new InteractiveObject(900, 460, 'treat'),
            new InteractiveObject(50, 460, 'treat', true),   // Hidden treat
            new InteractiveObject(675, 360, 'treat', true),  // Hidden treat
            new InteractiveObject(450, 460, 'treat', true)   // Hidden treat under platform
        ],
        startX: 50,
        startY: 400,
        background: '#98fb98'
    },
    // Level 3 - Boss: Sheep Herding
    {
        platforms: [
            new Platform(0, 500, 1024, 76),
            new Platform(150, 400, 150, 20),
            new Platform(400, 350, 150, 20),
            new Platform(650, 300, 200, 20), // Platform for the pen
            new Platform(900, 400, 100, 20)
        ],
        objects: [
            new InteractiveObject(700, 200, 'pen'), // Sheep pen on elevated platform
            new InteractiveObject(100, 460, 'treat'),
            new InteractiveObject(500, 310, 'treat'),
            new InteractiveObject(950, 360, 'treat'),
            new InteractiveObject(225, 360, 'treat', true), // Hidden treat on platform
            new InteractiveObject(750, 260, 'treat', true), // Hidden treat near pen
            new InteractiveObject(350, 460, 'treat', true)  // Hidden treat on ground
        ],
        sheep: new Sheep(300, 400),
        startX: 50,
        startY: 400,
        background: '#90ee90',
        isBossLevel: true
    },
    // Level 4 - Farmer Chase
    {
        platforms: [
            new Platform(0, 500, 1024, 76),
            new Platform(100, 400, 80, 20),
            new Platform(250, 350, 100, 20),
            new Platform(450, 300, 80, 20),
            new Platform(600, 400, 150, 20),
            new Platform(850, 350, 100, 20)
        ],
        objects: [
            new InteractiveObject(300, 310, 'treat'),
            new InteractiveObject(650, 360, 'treat'),
            new InteractiveObject(900, 310, 'treat'),
            new InteractiveObject(150, 360, 'treat', true), // Hidden
            new InteractiveObject(490, 260, 'treat', true), // Hidden
            new InteractiveObject(750, 460, 'treat', true),  // Hidden
            new InteractiveObject(500, 460, 'melon'), // Melon for energy
            new InteractiveObject(150, 460, 'melon')  // Another melon
        ],
        farmers: [
            new Farmer(400, 430),
            new Farmer(700, 330)
        ],
        startX: 50,
        startY: 400,
        background: '#ffd4a3'
    },
    // Level 5 - Pigeon Chaos
    {
        platforms: [
            new Platform(0, 500, 1024, 76),
            new Platform(200, 400, 100, 20),
            new Platform(500, 350, 100, 20),
            new Platform(800, 400, 100, 20)
        ],
        objects: [
            new InteractiveObject(100, 460, 'treat'),
            new InteractiveObject(250, 360, 'treat'),
            new InteractiveObject(550, 310, 'treat'),
            new InteractiveObject(850, 360, 'treat'),
            new InteractiveObject(450, 460, 'treat', true), // Hidden
            new InteractiveObject(950, 460, 'treat', true)  // Hidden
        ],
        pigeons: [
            new Pigeon(150, 480),
            new Pigeon(300, 480),
            new Pigeon(450, 480),
            new Pigeon(600, 480),
            new Pigeon(750, 480),
            new Pigeon(900, 480)
        ],
        startX: 50,
        startY: 400,
        background: '#b0c4de',
        isPigeonLevel: true
    }
];

let level = new Level(levels[currentLevel - 1]);
let player = new Player(level.startX, level.startY);

// Farmer collision detection
function checkFarmerCollisions(farmer) {
    if (farmer.isDefeated) return;
    
    // Reset farmer ground state
    farmer.onGround = false;
    
    // Check farmer platform collisions
    level.platforms.forEach(platform => {
        if (farmer.x < platform.x + platform.width &&
            farmer.x + farmer.width > platform.x &&
            farmer.y < platform.y + platform.height &&
            farmer.y + farmer.height > platform.y) {
            
            // Landing on top
            if (farmer.velY > 0 && farmer.y < platform.y) {
                farmer.y = platform.y - farmer.height;
                farmer.velY = 0;
                farmer.onGround = true;
            }
        }
    });
    
    // Keep farmer in bounds
    if (farmer.x < 0) {
        farmer.x = 0;
        farmer.velX *= -1;
    }
    if (farmer.x + farmer.width > canvas.width) {
        farmer.x = canvas.width - farmer.width;
        farmer.velX *= -1;
    }
    
    // Check collision with player
    if (player.x < farmer.x + farmer.width &&
        player.x + player.width > farmer.x &&
        player.y < farmer.y + farmer.height &&
        player.y + player.height > farmer.y) {
        
        if (player.isHuman) {
            // Human can attack farmer
            if (keys[' '] || keys['e']) {
                farmer.takeDamage();
                // Push player back slightly
                player.velX = farmer.x > player.x ? -5 : 5;
            }
        } else {
            // Corgi takes damage from farmer
            playerLife -= 20;
            showMessage('Ouch! The farmer hit you!', 90);
            
            // Knockback
            player.velX = farmer.x > player.x ? -8 : 8;
            player.velY = -5;
            
            // Check if dead
            if (playerLife <= 0) {
                showMessage('The farmer knocked you out!', 120);
                resetLevel();
            }
        }
    }
}

// Sheep collision detection
function checkSheepCollisions() {
    const sheep = level.sheep;
    
    // Reset sheep ground state
    sheep.onGround = false;
    
    // Check sheep platform collisions
    level.platforms.forEach(platform => {
        if (sheep.x < platform.x + platform.width &&
            sheep.x + sheep.width > platform.x &&
            sheep.y < platform.y + platform.height &&
            sheep.y + sheep.height > platform.y) {
            
            // Landing on top
            if (sheep.velY > 0 && sheep.y < platform.y) {
                sheep.y = platform.y - sheep.height;
                sheep.velY = 0;
                sheep.onGround = true;
            }
        }
    });
    
    // Keep sheep in bounds
    if (sheep.x < 0) {
        sheep.x = 0;
        sheep.velX *= -0.5;
    }
    if (sheep.x + sheep.width > canvas.width) {
        sheep.x = canvas.width - sheep.width;
        sheep.velX *= -0.5;
    }
    
    // Check for victory (sheep in pen)
    if (sheep.isInPen && level.isBossLevel && !level.sheepSuccessShown) {
        level.sheepSuccessShown = true;
        showMessage('Great job! You herded the sheep into the pen! Now head to the right to continue.', 300);
    }
}

// Collision detection
function checkCollisions() {
    // Reset ground state
    player.onGround = false;
    
    // Check platform collisions
    level.platforms.forEach(platform => {
        // Horizontal collision
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Landing on top
            if (player.velY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }
            // Hitting from below
            else if (player.velY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velY = 0;
            }
            // Side collisions
            else if (player.velX > 0) {
                player.x = platform.x - player.width;
                player.velX = 0;
            } else if (player.velX < 0) {
                player.x = platform.x + platform.width;
                player.velX = 0;
            }
        }
    });
    
    // Check object collisions
    level.objects = level.objects.filter(obj => {
        if (obj.type === 'treat') {
            // Check if we're sniffing near a hidden treat
            if (obj.hidden && !obj.discovered && !player.isHuman && player.sniffMode) {
                const dist = Math.hypot(obj.x + 20 - (player.x + player.width/2), 
                                      obj.y + 20 - (player.y + player.height/2));
                if (dist < player.sniffRadius) {
                    obj.discovered = true;
                    showMessage('Hidden treat discovered!', 120);
                }
            }
            
            // Only collect if visible
            if (!obj.hidden || obj.discovered) {
                if (player.x < obj.x + obj.width &&
                    player.x + player.width > obj.x &&
                    player.y < obj.y + obj.height &&
                    player.y + player.height > obj.y) {
                    treatCount++;
                    document.getElementById('treatCount').textContent = treatCount;
                    createCollectSound();
                    
                    if (obj.hidden) {
                        // Bonus points for hidden treats
                        treatCount++;
                        document.getElementById('treatCount').textContent = treatCount;
                        showMessage('Bonus treat! +2', 90);
                    }
                    
                    return false; // Remove treat
                }
            }
        } else if (obj.type === 'melon') {
            // Melon can only be eaten by corgi
            if (!player.isHuman &&
                player.x < obj.x + obj.width &&
                player.x + player.width > obj.x &&
                player.y < obj.y + obj.height &&
                player.y + player.height > obj.y) {
                
                // Restore full energy
                playerLife = maxPlayerLife;
                createCollectSound();
                
                // Check if this was the last melon in level 4
                const melonsLeft = level.objects.filter(o => o.type === 'melon' && o !== obj).length;
                if (currentLevel === 4 && melonsLeft === 0) {
                    showMessage('All melons eaten! You can transform again!', 180);
                } else {
                    showMessage('Energy restored! The melon was delicious!', 150);
                }
                
                // Visual effect
                for (let i = 0; i < 10; i++) {
                    particles.push({
                        x: obj.x + 20,
                        y: obj.y + 20,
                        velX: (Math.random() - 0.5) * 8,
                        velY: -Math.random() * 10,
                        life: 60,
                        color: '#ff69b4'
                    });
                }
                
                return false; // Remove melon
            }
        }
        return true;
    });
    
    // Check bounds
    if (player.y > canvas.height) {
        resetLevel();
    }
    
    // Check level completion
    if (player.x > canvas.width - 50) {
        // Count remaining treats
        const treatsLeft = level.objects.filter(obj => obj.type === 'treat').length;
        
        // Check if all treats collected
        if (treatsLeft > 0) {
            // Push player back
            player.x = canvas.width - 60;
            player.velX = -5;
            
            // Show reminder message (only once per attempt)
            if (!level.treatReminderShown) {
                level.treatReminderShown = true;
                const message = treatsLeft === 1 ? 
                    'You must collect the last treat before proceeding!' :
                    `You must collect all ${treatsLeft} remaining treats before proceeding!`;
                showMessage(message, 240);
            }
        } else if (level.isBossLevel && level.sheep && !level.sheep.isInPen) {
            // On boss level, also require sheep to be in pen
            // Push player back
            player.x = canvas.width - 60;
            player.velX = -5;
            
            // Show reminder message (only once)
            if (!level.bossReminderShown) {
                level.bossReminderShown = true;
                showMessage('You must herd the sheep into the pen before proceeding!', 240);
            }
        } else {
            // All requirements met, proceed to next level
            nextLevel();
        }
    }
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw
    level.draw();
    player.update(deltaTime);
    
    // Update sheep if present
    if (level.sheep) {
        level.sheep.update(player, player.barkWaves);
        checkSheepCollisions();
    }
    
    // Update farmers
    level.farmers.forEach(farmer => {
        farmer.update(player);
        checkFarmerCollisions(farmer);
    });
    
    // Update pigeons
    level.pigeons.forEach(pigeon => {
        pigeon.update(player, level.pigeons);
    });
    
    // Check pigeon level completion
    if (level.isPigeonLevel) {
        const allPigeonsGone = level.pigeons.every(p => p.hasLeftScreen);
        if (allPigeonsGone && !level.pigeonVictoryShown) {
            level.pigeonVictoryShown = true;
            showMessage('All pigeons flew away! You can proceed!', 180);
        }
    }
    
    checkCollisions();
    
    // Update and draw particles
    particles = particles.filter(particle => {
        particle.x += particle.velX;
        particle.y += particle.velY;
        particle.velY += 0.5; // gravity
        particle.life--;
        
        if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.life / 60;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            ctx.restore();
            return true;
        }
        return false;
    });
    
    player.draw();
    
    // Update and draw messages
    updateMessage();
    drawMessage();
    
    // Draw UI elements
    drawLifeBar();
    drawTreatCounter();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Game control functions
function startGame() {
    gameStarted = true;
    document.getElementById('startScreen').classList.add('hidden');
    
    // Clear any stuck keys
    for (let key in keys) {
        keys[key] = false;
    }
    
    // Show hint about sniffing
    setTimeout(() => {
        showMessage('Tip: As a corgi, hold S to sniff for hidden treats!', 300);
    }, 1000);
    
    // Start background music after user interaction to comply with browser policies
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            createBackgroundMusic();
        });
    } else {
        createBackgroundMusic();
    }
}

function resetLevel() {
    player = new Player(level.startX, level.startY);
    playerLife = maxLife; // Reset life
    
    // Clear any stuck keys to prevent movement
    for (let key in keys) {
        keys[key] = false;
    }
    
    // Reset sheep if present
    if (level.sheep) {
        level.sheep = new Sheep(levels[currentLevel - 1].sheep.x, levels[currentLevel - 1].sheep.y);
    }
    
    // Reset farmers
    if (levels[currentLevel - 1].farmers) {
        level.farmers = levels[currentLevel - 1].farmers.map(f => new Farmer(f.x, f.y));
    }
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > levels.length) {
        // Game complete!
        showMessage('Congratulations! You completed all levels!', 300);
        currentLevel = 1;
    }
    level = new Level(levels[currentLevel - 1]);
    player = new Player(level.startX, level.startY);
    document.getElementById('currentLevel').textContent = currentLevel;
    
    // Show level-specific messages
    if (currentLevel === 4) {
        setTimeout(() => {
            showMessage('Farmers are angry! Once corgi, you must eat ALL melons to transform back!', 350);
        }, 500);
    } else if (currentLevel === 5) {
        setTimeout(() => {
            showMessage('Keep all pigeons in the air by barking! Once all fly, they\'ll leave!', 300);
        }, 500);
    }
    
    // Clear any stuck keys to prevent movement
    for (let key in keys) {
        keys[key] = false;
    }
    
    // Change music for new level
    createBackgroundMusic(currentLevel);
    
    // Show level-specific messages
    if (level.isBossLevel) {
        showMessage('BOSS LEVEL: Herd the stubborn sheep into the pen using your bark!', 300);
    } else if (level.farmers && level.farmers.length > 0) {
        showMessage('DANGER: Farmers hate corgis! Transform to human to fight back!', 300);
    }
}

// Start game loop
requestAnimationFrame(gameLoop);