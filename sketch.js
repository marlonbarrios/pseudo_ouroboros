// Adapted from the following Processing example:
// http://processing.org/learning/topics/follow3.html

// The amount of points in the path
let points = 40;  // Fixed number of segments

// The distance between the points (will be adjusted based on canvas size)
let baseSegmentLength = 45;
let segmentLength;

// Array to store all points of the snake
let segments = []; 

// Variables for Perlin noise
let noiseOffsetX = 0;
let noiseOffsetY = 10000;
let baseNoiseSpeed = 0.02;
let noiseSpeed = baseNoiseSpeed;
let baseNoiseAmount = 30;
let noiseAmount;

// Variables for autonomous movement
let targetX;
let targetY;
let changeDirectionTime = 0;
let directionInterval = 100;
let speedMultiplier = 1;
let restTimer = 0;

// Add these variables at the top with other declarations
let osc;
let reverb;
let delay;
let filter;
let soundTimer = 0;
let soundInterval = 100;

// Add these variables at the top
let minSpeed = 0.05;  // Minimum speed to prevent complete stopping
let lastValidTarget = null;

// Add these variables at the top
let edgeExploring = false;
let edgeTimer = 0;
let edgePoint = null;
let edgeDirection = 1;  // 1 for clockwise, -1 for counterclockwise

// Add these variables at the top
let soundEnabled = false;
let audioStarted = false;

// Add these variables at the top
let isResting = false;
let restPosition = null;
let restDuration = 0;
let timeSinceLastRest = 0;
let minTimeBetweenRests = 600;  // Frames before can rest again

// Add these variables at the top
let recorder;
let recording = false;
let chunks = [];
let mediaStream;

// Add this variable at the top
let showUI = true;

// Add these variables at the top
let lastPosition;
let movementAmount = 0;
let soundThreshold = 0.5;
let lastSoundTime = 0;
let minSoundInterval = 50;  // Minimum time between sounds
let lastSoundIntensity = 0;
let soundDecay = 0.95;  // How quickly sound intensity fades

// Add these variables at the top
let velocityHistory = [];
let historyLength = 10;
let turnAmount = 0;
let lastDirection;

// Add these variables at the top
let curvature = 0;
let bendAmount = 0;
let stretchAmount = 0;

// Add these variables at the top
let sniffingIntensity = 0;
let sniffingFrequency = 0;
let sniffingPhase = 0;
let lastSniffPoint = null;
let harmonics = [];
let sniffingSoundTimer = 0;

// Add these variables at the top
let droneOsc1, droneOsc2;
let droneLfo;
let droneFilter;
let droneReverb;
let droneDepth = 0;

// Add these variables at the top
let evolutionTime = 0;
let complexityLevel = 0;
let maxComplexity = 5;
let lastEvolutionCheck = 0;
let evolutionInterval = 30000; // Time between evolutions (30 seconds)

// Add these variables at the top
let headGlow = 0;  // Current glow intensity
let maxGlow = 1.5;  // Maximum glow multiplier
let glowDecay = 0.95;  // How quickly glow fades
let edgeGlowDistance = 200;  // Increased edge detection range
let edgeIntensity = 0;      // New variable for edge effect intensity
let edgeParticles = [];     // Array for edge investigation particles

// Add these variables at the top
let clickOsc;
let clickEnv;
let lastClickTime = 0;
let minClickInterval = 100;  // Minimum time between clicks
let clickIntensity = 0;

// Add these variables at the top
let selfExploring = false;
let selfExploreTimer = 0;
let selfExploreTarget = 0;
let squeakOsc;
let squeakEnv;
let lastSqueakTime = 0;

// Update these variables at the top
let bodyGlow = [];  // Array to store glow values for each segment
let maxBodyGlow = 2.0;  // Maximum body glow intensity
let bodyGlowDecay = 0.97;  // How quickly body glow fades

// Update these variables at the top
let trail = [];  // Array to store trail positions
let trailLength = 300;  // Much longer trail for more persistence
let trailOpacity = [];  // Array to store opacity values
let trailDecay = 0.997;  // Much slower decay for longer-lasting trails
let trailWidth = 100;   // Match snake's full body width
let trailSpread = 2;    // How much the trail spreads over time

// Add these variables at the top
let fragments = [];
let fragmenting = false;
let reassembling = false;
let fragmentTimer = 0;
let fragmentDuration = 200;  // How long to stay fragmented

// Add these variables at the top
let nutrients = [];  // Array to store nutrient particles
let metabolicTimer = 0;
let metabolicRate = 0.015;  // Increased excretion rate
let maxNutrients = 400;    // More particles allowed
let reabsorptionRadius = 150; // Larger absorption radius

// Add these variables at the top
let foldingNutrients = false;
let foldTarget = null;
let foldProgress = 0;
let foldDuration = 150;    // Slower folding for visibility
let nutrientCluster = [];
let digestingTimer = 0;

// Add these safety limits
let MAX_TRAIL_LENGTH = 300;
let MAX_NUTRIENT_AGE = 10;
let MAX_CLUSTER_SIZE = 15;
let MIN_PERFORMANCE_FPS = 30;
let lastFrameTime = 0;
let frameTimeThreshold = 1000/30; // 30 FPS minimum

// Add these safety checks at the top
let lastCleanupTime = 0;
let cleanupInterval = 1000; // Cleanup every second
let isProcessingCluster = false;
let maxProcessingTime = 16; // Max ms for processing

// Add these variables at the top
let nutrientGlowIntensity = 2.0; // Brighter glow
let absorptionParticles = [];

// Add these variables at the top
let edgeBuffer = 100;  // Distance from edge to start containment
let edgeForce = 0.2;   // Strength of edge repulsion

// Add these variables at the top
let evolutionLevel = 0;          // Current evolution stage
let maxEvolution = 5;            // Maximum evolution level
let growthFactor = 1.0;         // Size multiplier
let colorEvolution = 0;         // Color complexity
let soundEvolution = 0;         // Sound evolution
let lastTouchTime = 0;          // Time tracking for touches
let touchCooldown = 1000;       // Minimum time between evolutions

// Add these variables at the top
let foodParticles = [];
let attractionForce = 0.5;
let foodRadius = 15;
let maxFoodParticles = 50;
let foodAttractionRadius = 200;

// Add these variables at the top
let organismSize = 1.0;          // Base size that grows with feeding
let maxOrganismSize = 2.5;      // Maximum growth limit
let digestionEnergy = 0;        // Energy from eating
let energyDecayRate = 0.001;    // How fast energy depletes
let particleNutrition = 0.05;   // How much each particle contributes to growth

// Add these variables at the top
let eatSound;
let digestSound;
let growthSound;
let lastEatSound = 0;
let minEatSoundInterval = 200;  // Minimum time between eat sounds
let digestPitch = 1.0;         // Base pitch for digest sounds
let growthPitch = 220;        // Base frequency for growth sounds

// Add these variables at the top
let spawnParticles = [];         // Particles for spawn effect
let spawnSound;                  // Sound for spawning food
let spawnReverb;                // Reverb for spawn sound
let lastSpawnPitch = 440;       // Track pitch for variation
let spawnRadius = 100;          // Size of spawn effect

// Add these variables at the top
let technoSynth;
let technoLFO;
let technoDelay;
let technoFilter;
let baseBeat = 0;
let beatPattern = [1, 0, 0.5, 0, 1, 0.3, 0, 0.7];
let beatIndex = 0;
let lastBeatTime = 0;
let beatInterval = 200; // 120 BPM
let filterSweep = 0;

// Add these variables at the top
let evolutionState = {
    movement: 0,        // 0-1: Controls movement complexity
    sound: 0,          // 0-1: Controls sound complexity
    awakening: 0,      // 0-1: Overall evolution progress
    startTime: 0,      // When the evolution began
    evolutionDuration: 180000  // 3 minutes for full evolution
};

// Add these variables at the top
let volumeFluctuation = 0;
let volumeNoiseOffset = 0;
let volumeNoiseSpeed = 0.001;
let volumeNoiseAmount = 0.3;  // Maximum volume fluctuation (30%)

// Add these variables at the top
let bgColor = {
    r: 5,    // Darker base values
    g: 5,
    b: 10,
    targetR: 5,
    targetG: 5,
    targetB: 10,
    noiseOffsetR: 0,
    noiseOffsetG: 1000,
    noiseOffsetB: 2000,
    noiseSpeed: 0.0005,
    lerpSpeed: 0.005
};

// Update dayNightCycle object with color parameters
let dayNightCycle = {
    hour: 0,
    brightness: 0,
    lastUpdate: 0,
    updateInterval: 1000,
    activityLevel: 0,
    minBrightness: 0.02,
    maxBrightness: 0.2,
    minActivity: 0.3,
    maxActivity: 1.5,
    // Add color parameters for different times of day
    colors: {
        night: { r: 15, g: 113, b: 115 },     // "0f7173" Deep teal
        dawn: { r: 216, g: 164, b: 127 },     // "d8a47f" Warm sand
        day: { r: 239, g: 131, b: 84 },       // "ef8354" Coral
        dusk: { r: 238, g: 75, b: 106 },      // "ee4b6a" Rose
        deepNight: { r: 223, g: 59, b: 87 }   // "df3b57" Deep rose
    }
};

// Add these variables at the top
let timeDisplay = {
    x: 0,
    y: 0,
    padding: 20,
    fontSize: 16,
    opacity: 180
};

// Add organism color palette using the same colors
let organismColors = {
    night: {
        body: { r: 239, g: 131, b: 84, a: 180 },     // "ef8354" Coral
        glow: { r: 216, g: 164, b: 127, a: 160 }     // "d8a47f" Warm sand
    },
    dawn: {
        body: { r: 238, g: 75, b: 106, a: 160 },     // "ee4b6a" Rose
        glow: { r: 223, g: 59, b: 87, a: 140 }       // "df3b57" Deep rose
    },
    day: {
        body: { r: 15, g: 113, b: 115, a: 170 },     // "0f7173" Teal
        glow: { r: 239, g: 131, b: 84, a: 130 }      // "ef8354" Coral
    },
    deepNight: {
        body: { r: 223, g: 59, b: 87, a: 190 },      // "df3b57" Deep rose
        glow: { r: 238, g: 75, b: 106, a: 170 }      // "ee4b6a" Rose
    }
};

// Define the strict color palette
const PALETTE = {
    deepTeal: { r: 25, g: 83, b: 95 },    // 19535f
    jade: { r: 11, g: 122, b: 117 },      // 0b7a75
    sand: { r: 215, g: 201, b: 170 },     // d7c9aa
    rust: { r: 123, g: 45, b: 38 },       // 7b2d26
    pearl: { r: 240, g: 243, b: 245 }     // f0f3f5
};

// Add these variables for the palette-based sound design
const SOUND_PALETTE = {
    warmSand: { freq: 220, // d8a47f - warm, mellow tone
        modulation: 0.3,
        resonance: 2 },
    coral: { freq: 330, // ef8354 - bright, energetic
        modulation: 0.5,
        resonance: 3 },
    rose: { freq: 440, // ee4b6a - higher, shimmering
        modulation: 0.7,
        resonance: 4 },
    deepRose: { freq: 550, // df3b57 - intense, rich
        modulation: 0.8,
        resonance: 5 },
    teal: { freq: 165, // 0f7173 - deep, mysterious
        modulation: 0.4,
        resonance: 2.5 }
};

// Add these variables for spatial audio
let mainReverb;
let spatialDelay;
let spatialFilter;
let lastPanPosition = 0;
let panSmoothness = 0.1;

// Add safety limits for audio parameters
let MAX_FEEDBACK = 0.7;  // Maximum feedback allowed
let MIN_FILTER_FREQ = 20;  // Minimum filter frequency
let MAX_FILTER_FREQ = 20000;  // Maximum filter frequency
let MAX_REVERB_TIME = 5;  // Maximum reverb time in seconds
let MAX_DELAY_TIME = 1;  // Maximum delay time in seconds
let MAX_VOLUME = 0.8;  // Maximum volume multiplier

// Add these variables at the top for intersection effects
let intersectionEffects = [];
let maxIntersectionEffects = 20;
let intersectionGlow = 0;
let intersectionSound;
let lastIntersectionSound = 0;
let minIntersectionSoundInterval = 300; // Minimum time between sounds

// Add these variables at the top for Ouroboros effect
let isOuroboros = false;
let ouroborosTimer = 0;
let ouroborosEffects = [];
let ouroborosSound;
let lastOuroborosSound = 0;
let ouroborosDuration = 180; // Duration of the effect in frames

// Update setupAudio function to include safety limits
function setupAudio() {
    // Create spatial audio effects with safety limits
    mainReverb = new Tone.Reverb({
        decay: Math.min(4.0, MAX_REVERB_TIME),
        wet: Math.min(0.3, MAX_FEEDBACK),
        preDelay: Math.min(0.2, MAX_DELAY_TIME)
    }).toDestination();
    
    spatialDelay = new Tone.PingPongDelay({
        delayTime: Math.min(0.3, MAX_DELAY_TIME),
        feedback: Math.min(0.2, MAX_FEEDBACK),
        wet: Math.min(0.15, MAX_FEEDBACK)
    }).connect(mainReverb);
    
    spatialFilter = new Tone.Filter({
        frequency: constrain(2000, MIN_FILTER_FREQ, MAX_FILTER_FREQ),
        type: "lowpass",
        rolloff: -24
    }).connect(spatialDelay);
    
    // Create main panner
    mainPanner = new Tone.Panner(0).connect(spatialFilter);
    
    // Setup oscillator with spatial routing and volume safety
    osc = new Tone.Oscillator({
        frequency: 440,
        type: "sine",
        volume: -12 * MAX_VOLUME
    }).connect(mainPanner).start();
    
    // Setup drone sounds with spatial routing and volume safety
    droneOsc1 = new Tone.Oscillator({
        frequency: 100,
        type: "sine",
        volume: -24 * MAX_VOLUME
    }).connect(mainPanner).start();
    
    droneOsc2 = new Tone.Oscillator({
        frequency: 150,
        type: "sine",
        volume: -24 * MAX_VOLUME
    }).connect(mainPanner).start();
    
    // Add intersection sound synth
    intersectionSound = new Tone.Synth({
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.2,
            release: 0.5
        }
    }).connect(mainReverb);
    
    // Add Ouroboros sound - a mystical chord
    ouroborosSound = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.4,
            release: 1
        }
    }).connect(mainReverb);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// Adjust snake properties based on new canvas size
	segmentLength = baseSegmentLength * (sqrt(windowWidth * windowHeight) / sqrt(800 * 600));
	noiseAmount = baseNoiseAmount * (sqrt(windowWidth * windowHeight) / sqrt(800 * 600));
	
	// Ensure snake is within bounds after resize
	for (let segment of segments) {
		segment.x = constrain(segment.x, 0, windowWidth);
		segment.y = constrain(segment.y, 0, windowHeight);
	}
	
	// Update target position if it's out of bounds
	targetX = constrain(targetX, 100, windowWidth-100);
	targetY = constrain(targetY, 100, windowHeight-100);
}

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.style('z-index', '10');  // Set canvas above other elements
	canvas.position(0, 0);  // Position at top-left
	canvas.style('pointer-events', 'none');  // Allow clicking through canvas to elements below
	
	// Initialize audio components with proper gain
	osc = new p5.Oscillator('sawtooth');
	reverb = new p5.Reverb();
	delay = new p5.Delay();
	filter = new p5.LowPass();
	
	// Disconnect default connections
	osc.disconnect();
	filter.disconnect();
	delay.disconnect();
	reverb.disconnect();
	
	// Build audio chain with proper gains
	osc.connect(filter);
	filter.connect(delay);
	delay.connect(reverb);
	reverb.connect();  // Connect to master output
	
	// Set initial parameters with higher volumes
	filter.freq(800);
	filter.res(3);     // More resonance
	
	delay.setType('pingPong');
	delay.delayTime(0.2);
	delay.feedback(0.4);   // More feedback
	
	reverb.set(2, 3);     // More reverb
	reverb.amp(0.8);      // Higher reverb volume
	
	// Initialize oscillator
	osc.amp(0);
	osc.start();  // Start oscillator but with zero amplitude
	audioStarted = false;
	
	// Initialize segment length based on canvas size
	segmentLength = baseSegmentLength * (sqrt(windowWidth * windowHeight) / sqrt(800 * 600));
	noiseAmount = baseNoiseAmount * (sqrt(windowWidth * windowHeight) / sqrt(800 * 600));
	
	// Initialize the snake segments in a relaxed curve
	let centerX = windowWidth / 2;
	let centerY = windowHeight / 2;
	
	for (let i = 0; i < points; i++) {
		// Create a gentle S-curve with some natural variation
		let t = i / (points - 1);  // Normalized position along the snake
		let curveX = centerX + sin(t * PI * 1.5) * 200;  // Wider, gentler curve
		
		// Add some height variation for a more natural rest position
		let curveY = centerY + cos(t * PI * 2) * 100 
							+ sin(t * PI * 0.5) * 50;  // Combined waves for organic shape
		
		// Add some random variation
		let offsetX = noise(i * 0.5) * 40 - 20;
		let offsetY = noise(i * 0.5 + 100) * 40 - 20;
		
		let x = curveX + offsetX;
		let y = curveY + offsetY;
		
		segments.push(createVector(x, y));
	}
	
	// Initialize target position at the head of the snake
	targetX = segments[0].x;
	targetY = segments[0].y;
	
	// Initialize drone oscillators
	droneOsc1 = new p5.Oscillator('sine');
	droneOsc2 = new p5.Oscillator('sine');
	droneLfo = new p5.Oscillator('sine');
	droneFilter = new p5.LowPass();
	droneReverb = new p5.Reverb();
	
	// Set up drone audio chain
	droneOsc1.disconnect();
	droneOsc2.disconnect();
	droneLfo.disconnect();
	droneFilter.disconnect();
	droneReverb.disconnect();
	
	droneOsc1.connect(droneFilter);
	droneOsc2.connect(droneFilter);
	droneFilter.connect(droneReverb);
	droneReverb.connect();
	
	// Initialize drone parameters
	droneOsc1.freq(40);   // Lower base frequency for more presence
	droneOsc2.freq(43);   // Slightly detuned for richness
	droneLfo.freq(0.1);
	droneFilter.freq(800); // Higher filter frequency
	droneFilter.res(12);   // More resonance
	droneReverb.set(6, 6); // More reverb
	
	// Start oscillators with zero amplitude
	droneOsc1.start();
	droneOsc2.start();
	droneLfo.start();
	droneOsc1.amp(0);
	droneOsc2.amp(0);
	droneLfo.amp(0);
	
	setupRecording();
	
	// Increase main sound volume
	reverb.amp(1.2);      // Higher master volume
	
	// Initialize click oscillator and envelope
	clickOsc = new p5.Oscillator('sine');
	clickEnv = new p5.Envelope();
	clickEnv.setADSR(0.001, 0.02, 0, 0.02);
	clickEnv.setRange(0.3, 0);
	
	clickOsc.amp(0);
	clickOsc.start();
	clickOsc.disconnect();
	clickOsc.connect(filter);
	
	// Initialize squeak oscillator and envelope
	squeakOsc = new p5.Oscillator('sine');
	squeakEnv = new p5.Envelope();
	squeakEnv.setADSR(0.05, 0.1, 0.2, 0.1);
	squeakEnv.setRange(0.3, 0);
	
	squeakOsc.amp(0);
	squeakOsc.start();
	squeakOsc.disconnect();
	squeakOsc.connect(filter);
	
	// Initialize body glow array
	for (let i = 0; i < points; i++) {
		bodyGlow.push(0);
	}
	
	// Initialize trail arrays
	for (let i = 0; i < trailLength; i++) {
		trail.push(createVector(0, 0));
		trailOpacity.push(0);
	}
	
	// Initialize eating sound components
	eatSound = new p5.Oscillator('sine');
	eatSound.disconnect();
	eatSound.connect(filter);
	
	digestSound = new p5.Oscillator('triangle');
	digestSound.disconnect();
	digestSound.connect(filter);
	
	growthSound = new p5.Oscillator('sine');
	growthSound.disconnect();
	growthSound.connect(reverb);
	
	// Initialize spawn sound
	spawnSound = new p5.Oscillator('sine');
	spawnReverb = new p5.Reverb();
	spawnSound.disconnect();
	spawnSound.connect(spawnReverb);
	spawnReverb.set(3, 2); // Long, spacious reverb
	
	// Initialize techno sound components
	technoSynth = new p5.Oscillator('sawtooth');
	technoLFO = new p5.Oscillator('sine');
	technoDelay = new p5.Delay();
	technoFilter = new p5.Filter();
	
	// Configure effects
	technoSynth.disconnect();
	technoSynth.connect(technoFilter);
	technoFilter.connect(technoDelay);
	technoDelay.process(technoSynth, 0.3, 0.7, 2300);
	technoDelay.setType('pingPong');
	technoFilter.freq(1000);
	technoFilter.res(5);
	
	// Initialize in dormant state
	noiseSpeed = 0;
	noiseAmount = 0;
	evolutionState.startTime = millis();
	speedMultiplier = 0;
	
	// Start with all sound parameters at minimum
	if (soundEnabled) {
		technoSynth.amp(0);
		technoFilter.freq(500);
		technoDelay.feedback(0);
	}
	
	// Set initial background color
	background(bgColor.r, bgColor.g, bgColor.b);
}

// Update draw function to ensure background is updated first
function draw() {
    try {
        // Clear and update background at the start of each frame
        clear();  // Clear previous frame
        updateBackground();  // Apply new background color
        
        // Performance check
        let currentTime = millis();
        let frameTime = currentTime - lastFrameTime;
        if (frameTime > frameTimeThreshold) {
            // Performance issues detected, reduce complexity
            cleanupResources();
        }
        lastFrameTime = currentTime;
        
        // Regular cleanup
        if (currentTime - lastCleanupTime > cleanupInterval) {
            cleanupResources();
            lastCleanupTime = currentTime;
        }
        
        // Store last valid position
        if (!lastValidTarget) {
            lastValidTarget = createVector(segments[0].x, segments[0].y);
        }
        
        // Evolve complexity over time
        evolveComplexity();
        
        // Update movement behavior with evolution
        if (!mouseIsPressed) {
            timeSinceLastRest++;
            
            // Check if snake should rest
            if (!isResting && timeSinceLastRest > minTimeBetweenRests && random(1) < 0.005) {
                isResting = true;
                restDuration = random(200, 400);  // Rest for 3-6 seconds
                
                // Find a rest position near the bottom
                restPosition = createVector(
                    random(100, width-100),
                    height - random(50, 150)  // Near bottom
                );
                
                // Slow down
                speedMultiplier = 0.3;
                edgeExploring = false;
            }
            
            if (isResting) {
                // Gentle swaying while resting
                targetX = restPosition.x + sin(frameCount * 0.02) * 15;
                targetY = restPosition.y + cos(frameCount * 0.02) * 5;
                
                restDuration--;
                if (restDuration <= 0) {
                    isResting = false;
                    timeSinceLastRest = 0;
                    speedMultiplier = 1;
                }
            } else if (!edgeExploring) {
                // Random chance to start edge exploration
                if (random(1) < 0.02) {
                    edgeExploring = true;
                    edgeTimer = random(200, 400);  // Duration of edge exploration
                    // Choose random point on edge to start
                    let side = floor(random(4));
                    switch(side) {
                        case 0: // top
                            edgePoint = createVector(random(width), 50);
                            break;
                        case 1: // right
                            edgePoint = createVector(width - 50, random(height));
                            break;
                        case 2: // bottom
                            edgePoint = createVector(random(width), height - 50);
                            break;
                        case 3: // left
                            edgePoint = createVector(50, random(height));
                            break;
                    }
                    edgeDirection = random(1) < 0.5 ? 1 : -1;
                }
                
                if (edgeExploring) {
                    // Enhanced sniffing behavior near edges
                    sniffingIntensity = lerp(sniffingIntensity, 1.5, 0.1);  // More intense sniffing
                    sniffingFrequency = map(speedMultiplier, 0.5, 1.2, 0.2, 0.4);  // Faster sniffing
                    
                    // More dramatic edge movement
                    let edgeOffset = sin(frameCount * 0.1) * 30;  // Larger oscillation
                    let investigationDepth = sin(frameCount * 0.05) * 40;  // Deeper investigation
                    
                    // Create investigation particles
                    if (frameCount % 5 === 0) {  // More frequent particles
                        edgeParticles.push({
                            x: segments[0].x + random(-20, 20),
                            y: segments[0].y + random(-20, 20),
                            age: 0,
                            size: random(4, 8),
                            color: color(255, 200, 200, 200)
                        });
                    }
                    
                    // Update edge behavior based on position
                    if (edgePoint.x < 100) {  // Left edge
                        edgePoint.y += edgeDirection * 3;  // Faster movement
                        targetX = 50 + edgeOffset;
                        targetY = edgePoint.y + investigationDepth;
                        edgeIntensity = map(segments[0].x, 100, 0, 0, 1);
                    } else if (edgePoint.x > width - 100) {  // Right edge
                        edgePoint.y += edgeDirection * 3;
                        targetX = width - 50 + edgeOffset;
                        targetY = edgePoint.y + investigationDepth;
                        edgeIntensity = map(segments[0].x, width-100, width, 0, 1);
                    } else if (edgePoint.y < 100) {  // Top edge
                        edgePoint.x += edgeDirection * 3;
                        targetX = edgePoint.x + investigationDepth;
                        targetY = 50 + edgeOffset;
                        edgeIntensity = map(segments[0].y, 100, 0, 0, 1);
                    } else {  // Bottom edge
                        edgePoint.x += edgeDirection * 3;
                        targetX = edgePoint.x + investigationDepth;
                        targetY = height - 50 + edgeOffset;
                        edgeIntensity = map(segments[0].y, height-100, height, 0, 1);
                    }
                    
                    // Update and draw edge particles
                    for (let i = edgeParticles.length - 1; i >= 0; i--) {
                        let p = edgeParticles[i];
                        p.age += 0.05;
                        
                        // Particle movement
                        let angle = noise(p.x * 0.01, p.y * 0.01, frameCount * 0.02) * TWO_PI;
                        p.x += cos(angle) * 2;
                        p.y += sin(angle) * 2;
                        
                        // Draw particle with glow
                        noStroke();
                        for (let j = 3; j > 0; j--) {
                            let alpha = map(j, 3, 0, 50, 150) * (1 - p.age);
                            p.color.setAlpha(alpha);
                            fill(p.color);
                            circle(p.x, p.y, p.size * j);
                        }
                        
                        // Remove old particles
                        if (p.age > 1) {
                            edgeParticles.splice(i, 1);
                        }
                    }
                    
                    // Add extra glow when near edges
                    headGlow = max(headGlow, edgeIntensity * 2);
                }
            }
            
            // Add safety checks for evolution-based movement
            if (!mouseIsPressed && !isResting && !edgeExploring) {
                let safeComplexity = constrain(complexityLevel, 0, maxComplexity);
                
                // Safe movement calculations
                let evolutionNoise = noise(
                    frameCount * constrain(0.01 + safeComplexity * 0.005, 0, 0.1),
                    safeComplexity * 100
                ) * safeComplexity;
                
                // Constrain movement additions
                let xAdd = sin(frameCount * (0.02 + safeComplexity * 0.01)) * (10 + safeComplexity * 5);
                let yAdd = cos(frameCount * (0.015 + safeComplexity * 0.01)) * (10 + safeComplexity * 5);
                
                targetX += constrain(xAdd, -50, 50);
                targetY += constrain(yAdd, -50, 50);
                
                // Safe circular patterns
                let radius = constrain(50 + safeComplexity * 20, 0, 200);
                let angle = frameCount * constrain(0.02 + safeComplexity * 0.01, 0, 0.1);
                
                targetX += constrain(sin(angle) * radius * evolutionNoise, -100, 100);
                targetY += constrain(cos(angle * 1.5) * radius * evolutionNoise, -100, 100);
                
                // Ensure targets stay within bounds
                targetX = constrain(targetX, 50, width - 50);
                targetY = constrain(targetY, 50, height - 50);
            }
            
            // Adjust speed multiplier based on complexity
            speedMultiplier = constrain(1 + complexityLevel * 0.2, 0.5, 2.5);
        } else {
            // Reset rest state when mouse is pressed
            isResting = false;
            timeSinceLastRest = 0;
            // Go towards mouse position
            targetX = mouseX;
            targetY = mouseY;
            
            // Increase speed when chasing mouse
            speedMultiplier = 2;
            
            // Disable edge exploring when following mouse
            edgeExploring = false;
        }
        
        // Add edge containment before updating position
        let head = segments[0];
        let containmentForce = createVector(0, 0);
        
        // Left edge
        if (head.x < edgeBuffer) {
            containmentForce.x += edgeForce * (edgeBuffer - head.x) / edgeBuffer;
        }
        // Right edge
        if (head.x > width - edgeBuffer) {
            containmentForce.x -= edgeForce * (head.x - (width - edgeBuffer)) / edgeBuffer;
        }
        // Top edge
        if (head.y < edgeBuffer) {
            containmentForce.y += edgeForce * (edgeBuffer - head.y) / edgeBuffer;
        }
        // Bottom edge
        if (head.y > height - edgeBuffer) {
            containmentForce.y -= edgeForce * (head.y - (height - edgeBuffer)) / edgeBuffer;
        }
        
        // Apply containment force to target position
        targetX += containmentForce.x * 10;
        targetY += containmentForce.y * 10;
        
        // Ensure target stays within bounds
        targetX = constrain(targetX, edgeBuffer, width - edgeBuffer);
        targetY = constrain(targetY, edgeBuffer, height - edgeBuffer);
        
        // Update segment positions with edge awareness
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            // Add edge repulsion to each segment
            if (segment.x < edgeBuffer) {
                segment.x += edgeForce * 2;
            }
            if (segment.x > width - edgeBuffer) {
                segment.x -= edgeForce * 2;
            }
            if (segment.y < edgeBuffer) {
                segment.y += edgeForce * 2;
            }
            if (segment.y > height - edgeBuffer) {
                segment.y -= edgeForce * 2;
            }
            
            // Ensure segments stay within bounds
            segment.x = constrain(segment.x, 0, width);
            segment.y = constrain(segment.y, 0, height);
        }
        
        // Add organic movement with minimum intensity
        let noiseIntensity = map(speedMultiplier, 0.1, 3, 0.5, 2);
        noiseIntensity = max(noiseIntensity, 0.2);  // Ensure minimum noise movement
        let organicX = targetX + map(noise(noiseOffsetX), 0, 1, -noiseAmount * noiseIntensity, noiseAmount * noiseIntensity);
        let organicY = targetY + map(noise(noiseOffsetY), 0, 1, -noiseAmount * noiseIntensity, noiseAmount * noiseIntensity);
        
        // Move head towards target with guaranteed minimum movement
        let easing = max(0.08 * speedMultiplier, 0.01);
        segments[0].x += (organicX - segments[0].x) * easing;
        segments[0].y += (organicY - segments[0].y) * easing;
        
        // Ensure continuous noise offset updatesrr
        noiseOffsetX += max(noiseSpeed, 0.01);
        noiseOffsetY += max(noiseSpeed, 0.01);
        
        // Update all other segments
        for (let i = 0; i < points - 1; i++) {
            let segment = segments[i]; 
            let nextSegment = segments[i + 1];
            let vector = p5.Vector.sub(segment, nextSegment);
            vector.setMag(segmentLength);
            nextSegment.x = segment.x - vector.x;
            nextSegment.y = segment.y - vector.y;
        }
        
        // Calculate movement amount
        if (!lastPosition) {
            lastPosition = createVector(segments[0].x, segments[0].y);
        } else {
            let currentMovement = dist(segments[0].x, segments[0].y, lastPosition.x, lastPosition.y);
            movementAmount = lerp(movementAmount, currentMovement, 0.1);
            lastPosition.set(segments[0].x, segments[0].y);
        }
        
        // Calculate edge proximity glow
        let edgeProximity = min(
            head.x,  // Distance from left
            width - head.x,  // Distance from right
            head.y,  // Distance from top
            height - head.y  // Distance from bottom
        );
        
        // Increase glow when near edges
        if (edgeProximity < edgeGlowDistance) {
            let glowIntensity = map(edgeProximity, 0, edgeGlowDistance, maxGlow, 0);
            headGlow = lerp(headGlow, glowIntensity, 0.1);
        }
        
        // Update trail
        trail.push(createVector(segments[0].x, segments[0].y));
        trailOpacity.push(0.4);  // Lower initial opacity for water effect
        
        if (trail.length > trailLength) {
            trail.shift();
            trailOpacity.shift();
        }
        
        // Draw nutrients FIRST (before trail and snake)
        for (let i = nutrients.length - 1; i >= 0; i--) {
            let nutrient = nutrients[i];
            
            // Age the nutrient more slowly
            nutrient.age += 0.0005;
            nutrient.opacity *= 0.9995;  // Slower fade
            
            // Draw nutrient with stronger visibility
            noStroke();
            
            // Draw larger glow effect
            for (let j = 4; j > 0; j--) {
                let glowSize = nutrient.size * j * 1.5;
                let glowAlpha = (nutrient.opacity * 255) / (j * 1.5);
                fill(nutrient.color.levels[0], 
                     nutrient.color.levels[1], 
                     nutrient.color.levels[2], 
                     glowAlpha);
                circle(nutrient.x, nutrient.y, glowSize);
            }
            
            // Draw core of particle
            fill(nutrient.color.levels[0], 
                 nutrient.color.levels[1], 
                 nutrient.color.levels[2], 
                 nutrient.opacity * 255);
            circle(nutrient.x, nutrient.y, nutrient.size);
            
            // More noticeable movement
            nutrient.x += sin(frameCount * 0.03 + i) * 0.5;
            nutrient.y += cos(frameCount * 0.03 + i) * 0.5;
            
            // More dramatic absorption effect
            let d = dist(head.x, head.y, nutrient.x, nutrient.y);
            
            if (d < reabsorptionRadius) {
                let reabsorptionRate = map(d, 0, reabsorptionRadius, 0.3, 0.01);
                nutrient.opacity -= reabsorptionRate;
                
                // Stronger glow effect on absorption
                headGlow = min(headGlow + reabsorptionRate * 1.5, maxGlow);
                
                // More dramatic absorption movement
                let angle = atan2(head.y - nutrient.y, head.x - nutrient.x);
                nutrient.x += cos(angle) * reabsorptionRate * 6;
                nutrient.y += sin(angle) * reabsorptionRate * 6;
            }
            
            // Remove old or fully absorbed nutrients
            if (nutrient.opacity < 0.01 || nutrient.age > 8) {
                nutrients.splice(i, 1);
            }
        }
        
        // Draw trail first (underneath the snake)
        noFill();
        for (let i = 0; i < trail.length - 1; i++) {
            let alpha = trailOpacity[i] * 255;
            if (alpha > 1) {  // Lower threshold for visibility
                // Add gentle ripple effect
                let ripple = sin(frameCount * 0.05 + i * 0.1) * 1.5;
                
                // Trail gets slightly wider as it ages
                let ageSpread = map(i, 0, trail.length, 0, trailSpread);
                let currentWidth = trailWidth + ageSpread + ripple;
                
                strokeWeight(currentWidth);
                
                // Water-like blue tint with transparency
                let blueShade = map(i, 0, trail.length, 200, 180);
                stroke(180, blueShade, 255, alpha * 0.25);  // More translucent blue
                
                // Draw with slight curve for fluid look
                beginShape();
                curveVertex(trail[i].x, trail[i].y);
                curveVertex(trail[i].x, trail[i].y);
                curveVertex(trail[i+1].x, trail[i+1].y);
                curveVertex(trail[i+1].x, trail[i+1].y);
                endShape();
            }
            
            // Slower fade for water persistence
            trailOpacity[i] *= trailDecay;
            
            // Very subtle movement to simulate water settling
            let ageFactor = map(i, 0, trail.length, 0.1, 0.01);
            trail[i].x += sin(frameCount * 0.01 + i * 0.1) * ageFactor;
            trail[i].y += cos(frameCount * 0.01 + i * 0.1) * ageFactor;
        }
        
        // Update trail with current position
        if (frameCount % 2 === 0) {  // Add points less frequently for smoother trail
            trail.push(createVector(segments[0].x, segments[0].y));
            trailOpacity.push(0.5);  // Higher initial opacity
            
            if (trail.length > trailLength) {
                trail.shift();
                trailOpacity.shift();
            }
        }
        
        // Draw the snake
        noFill();
        
        // Draw glow layers for head
        if (headGlow > 0.1) {
            let glowLayers = 3;
            for (let i = glowLayers; i > 0; i--) {
                strokeWeight(100 + i * 20 * headGlow);
                let alpha = map(i, 0, glowLayers, 20, 80) * headGlow;
                stroke(255, 100, 100, alpha);
                beginShape();
                curveVertex(head.x, head.y);
                curveVertex(head.x, head.y);
                curveVertex(segments[1].x, segments[1].y);
                curveVertex(segments[2].x, segments[2].y);
                curveVertex(segments[2].x, segments[2].y);
                endShape();
            }
        }
        
        // Draw black outline
        strokeWeight(100);
        strokeCap(ROUND);
        stroke(0, 180);
        
        beginShape();
        curveVertex(segments[0].x, segments[0].y);
        for (let segment of segments) {
            curveVertex(segment.x, segment.y);
        }
        curveVertex(segments[segments.length-1].x, segments[segments.length-1].y);
        endShape();
        
        // Draw colored body with glow influence
        strokeWeight(28);
        strokeCap(ROUND);
        
        if (mouseIsPressed) {
            stroke(224, 130, 133);
        } else {
            let r, g, b;
            if (isResting) {
                r = map(sin(frameCount * 0.02), -1, 1, 160, 200);
                g = map(sin(frameCount * 0.02), -1, 1, 15, 30);
                b = map(sin(frameCount * 0.02), -1, 1, 20, 40);
            } else {
                r = map(speedMultiplier, 0.1, 3, 180, 255) + headGlow * 50;
                g = map(speedMultiplier, 0.1, 3, 20, 50);
                b = map(speedMultiplier, 0.1, 3, 27, 60);
            }
            stroke(r, g, b);
        }
        
        beginShape();
        curveVertex(segments[0].x, segments[0].y);
        for (let segment of segments) {
            curveVertex(segment.x, segment.y);
        }
        curveVertex(segments[segments.length-1].x, segments[segments.length-1].y);
        endShape();
        
        // Decay glow
        headGlow *= glowDecay;
        
        // Simpler sound generation based on movement
        if (soundEnabled && frameCount % 3 === 0) {  // Check every 3 frames
            let speed = dist(segments[0].x, segments[0].y, lastPosition.x, lastPosition.y);
            
            if (speed > soundThreshold) {
                makeUnderwaterSound(speed / 10);
            } else if (random(1) < 0.05) {  // Occasional ambient sounds
                makeUnderwaterSound(0.2);
            }
        }
        
        // Update drone sounds
        updateDrone();
        
        // Only draw UI elements if showUI is true
        if (showUI) {
            // Draw recording indicator
            if (recording) {
                noStroke();
                fill(255, 0, 0);
                ellipse(width - 20, 20, 10, 10);
                
                textAlign(RIGHT);
                textSize(16);
                fill(255, 0, 0);
                text('Recording...', width - 40, 25);
            }
        }
        
        // Add echolocation clicks when exploring
        if (edgeExploring && soundEnabled) {
            makeClickSound();
        }
        
        if (!isResting && !edgeExploring && random(1) < 0.01) {
            selfExploring = true;
            selfExploreTimer = random(100, 200);
            // Choose random segment to explore (not too close to head)
            selfExploreTarget = floor(random(5, segments.length - 1));
        }
        
        if (selfExploring) {
            let target = segments[selfExploreTarget];
            targetX = target.x + sin(frameCount * 0.1) * 20;
            targetY = target.y + cos(frameCount * 0.1) * 20;
            
            // Calculate distance to target segment
            let distToTarget = dist(segments[0].x, segments[0].y, target.x, target.y);
            
            // Make squeak sound based on proximity
            if (distToTarget < 50) {
                let intensity = map(distToTarget, 50, 10, 0, 1, true);
                makeSqueakSound(intensity);
            }
            
            selfExploreTimer--;
            if (selfExploreTimer <= 0) {
                selfExploring = false;
            }
        }
        
        // Draw body glow
        noFill();
        strokeCap(ROUND);
        
        // Draw glow for each segment
        for (let i = 0; i < segments.length - 1; i++) {
            if (bodyGlow[i] > 0.1) {
                let glowLayers = 3;
                for (let j = glowLayers; j > 0; j--) {
                    let glowSize = 28 + j * 20 * bodyGlow[i];
                    let alpha = map(j, 0, glowLayers, 20, 60) * bodyGlow[i];
                    
                    // Adjust color based on interaction type
                    let r = 255;
                    let g = selfExploring ? map(bodyGlow[i], 0, maxBodyGlow, 100, 180) : 100;
                    let b = selfExploring ? map(bodyGlow[i], 0, maxBodyGlow, 100, 150) : 100;
                    
                    strokeWeight(glowSize);
                    stroke(r, g, b, alpha);
                    line(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y);
                }
            }
            
            // Decay glow
            bodyGlow[i] *= bodyGlowDecay;
        }
        
        // Random chance to fragment
        if (!fragmenting && !reassembling && random(1) < 0.001) {
            startFragmentation();
        }
        
        if (fragmenting) {
            updateFragments();
            fragmentTimer++;
            
            if (fragmentTimer > fragmentDuration) {
                startReassembly();
            }
        }
        
        if (reassembling) {
            updateReassembly();
        }
        
        // Update metabolic cycle
        metabolicTimer += metabolicRate;
        
        // Create new particles
        if (random(1) < metabolicRate && nutrients.length < maxNutrients) {
            let segmentIndex = floor(random(segments.length));
            let segment = segments[segmentIndex];
            
            nutrients.push({
                x: segment.x + random(-10, 10),
                y: segment.y + random(-10, 10),
                age: 0,
                size: random(8, 15),  // Larger size
                opacity: random(0.8, 1.0),  // Higher opacity
                color: color(220 + random(-20, 20), 
                           240 + random(-20, 20), 
                           255, 
                           255),  // Brighter color
                glowSize: random(2, 3)  // Variable glow size
            });
        }
        
        // Check for nutrient clusters to fold
        if (!foldingNutrients && nutrients.length > 10 && !isProcessingCluster) {
            let clusters = findNutrientClusters();
            if (clusters && clusters.length > 0) {
                let validCluster = clusters.find(c => 
                    c && c.nutrients && c.nutrients.length > 5);
                if (validCluster) {
                    startFolding(validCluster);
                }
            }
        }
        
        if (foldingNutrients) {
            updateFolding();
        }
        
        // Safe nutrient updates
        if (nutrients && Array.isArray(nutrients)) {
            nutrients = nutrients.filter(n => n && typeof n.age === 'number');
            
            if (nutrients.length > maxNutrients) {
                nutrients.length = maxNutrients;
            }
        } else {
            nutrients = [];
        }
        
        // Add this to draw function to update absorption particles
        if (absorptionParticles.length > 0) {
            for (let i = absorptionParticles.length - 1; i >= 0; i--) {
                let p = absorptionParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life *= 0.9;
                
                // Draw particle
                noStroke();
                fill(220, 240, 255, p.life * 255);
                circle(p.x, p.y, p.life * 8);
                
                if (p.life < 0.01) {
                    absorptionParticles.splice(i, 1);
                }
            }
        }
        
        // Update and draw food particles
        updateFoodParticles();
        
        // Update digestion effects
        updateDigestionEffects();
        
        // Add food attraction behavior
        if (foodParticles.length > 0) {
            attractToFood();
        }
        
        updateSpawnEffects();
        
        // Update ambient sound
        updateAmbientSound();
        
        updateEvolution();
        
        // Only process movement if awakening has started
        if (evolutionState.awakening > 0) {
            let movementScale = evolutionState.movement;
            targetX += random(-noiseAmount, noiseAmount) * movementScale;
            targetY += random(-noiseAmount, noiseAmount) * movementScale;
        }
        
        // Update and draw organism
        drawOrganism();
        
        updateTimeBasedBehavior();
        updateTimeDisplay();  // Keep this to update control panel time
        updateGrowth();
        
        updateEnvironmentDisplay();
        
        checkSelfIntersection();
        updateIntersectionEffects();
        updateOuroborosEffects(); // Add this line
        
    } catch (e) {
        console.error('Draw error:', e);
        // Reset critical states
        foldingNutrients = false;
        isProcessingCluster = false;
        nutrients = [];
    }
}

function calculateMovementMetrics() {
	// Calculate current velocity
	let currentVelocity = createVector(
		segments[0].x - lastPosition.x,
		segments[0].y - lastPosition.y
	);
	
	// Track direction changes (turning)
	if (lastDirection) {
		let angleChange = abs(lastDirection.angleBetween(currentVelocity));
		turnAmount = lerp(turnAmount, angleChange, 0.2);
	}
	lastDirection = currentVelocity.copy();
	
	// Update velocity history
	velocityHistory.push(currentVelocity.mag());
	if (velocityHistory.length > historyLength) {
		velocityHistory.shift();
	}
	
	// Calculate average velocity
	let avgVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;
	
	// Update movement amount with more factors
	movementAmount = lerp(movementAmount, avgVelocity + (turnAmount * 2), 0.1);
	lastPosition.set(segments[0].x, segments[0].y);
	
	return {
		velocity: avgVelocity,
		turning: turnAmount,
		total: movementAmount
	};
}

function calculateSnakeMetrics() {
	// Calculate curvature (how much the snake is bending)
	curvature = 0;
	for (let i = 1; i < segments.length - 1; i++) {
		let prev = segments[i-1];
		let curr = segments[i];
		let next = segments[i+1];
		let angle = abs(p5.Vector.sub(prev, curr).angleBetween(p5.Vector.sub(next, curr)));
		curvature += angle;
	}
	curvature = curvature / (segments.length - 2); // Average curvature
	
	// Calculate stretch (distance between segments compared to ideal)
	stretchAmount = 0;
	for (let i = 0; i < segments.length - 1; i++) {
		let curr = segments[i];
		let next = segments[i+1];
		let dist = p5.Vector.dist(curr, next);
		stretchAmount += abs(dist - segmentLength);
	}
	stretchAmount = stretchAmount / (segments.length - 1);
	
	// Calculate overall bend (how far from straight line)
	let start = segments[0];
	let end = segments[segments.length - 1];
	let actualLength = 0;
	for (let i = 0; i < segments.length - 1; i++) {
		actualLength += p5.Vector.dist(segments[i], segments[i+1]);
	}
	let directLength = p5.Vector.dist(start, end);
	bendAmount = (actualLength - directLength) / actualLength;
}

function makeUnderwaterSound(intensity = 0.5) {
	if (!soundEnabled || !audioStarted) return;
	
	// Add glow when making sounds
	headGlow = lerp(headGlow, maxGlow * intensity, 0.3);
	
	calculateSnakeMetrics();
	
	let currentTime = millis();
	if (currentTime - lastSoundTime < minSoundInterval) return;
	lastSoundTime = currentTime;
	
	let speed = dist(segments[0].x, segments[0].y, lastPosition.x, lastPosition.y);
	
	// Create harmonic series based on movement
	let baseFreq = map(speed, 0, 20, 80, 250);
	baseFreq *= map(curvature, 0, PI, 1, 1.5);
	
	// Generate harmonics
	harmonics = [
		{ freq: baseFreq, amp: 1.0 },
		{ freq: baseFreq * 1.5, amp: 0.7 },  // Increased harmonic volumes
		{ freq: baseFreq * 2.0, amp: 0.5 },
		{ freq: baseFreq * 2.5, amp: 0.4 }
	];
	
	// Modulate harmonics based on movement
	let duration = map(bendAmount, 0, 1, 0.4, 1.2);
	let maxAmp = map(speed, 0, 20, 0.3, 0.8) * map(stretchAmount, 0, 10, 1, 1.5);
	
	// Play primary tone with harmonics
	osc.freq(harmonics[0].freq);
	osc.amp(maxAmp * harmonics[0].amp, 0.02);
	
	// Schedule harmonic changes
	harmonics.forEach((harmonic, i) => {
		setTimeout(() => {
			if (soundEnabled) {
				osc.freq(harmonic.freq, duration * 0.2);
				osc.amp(maxAmp * harmonic.amp, 0.1);
			}
		}, i * duration * 200);
	});
	
	// Dynamic filter and effects
	filter.freq(map(bendAmount, 0, 1, 800, 3000));
	delay.delayTime(map(bendAmount, 0, 1, 0.2, 0.4));
	delay.feedback(map(curvature, 0, PI, 0.3, 0.5));
	reverb.drywet(map(speed, 0, 20, 0.4, 0.8));
	
	// End sound
	setTimeout(() => {
		if (soundEnabled) {
			osc.amp(0, 0.15);
		}
	}, duration * 1000);
}

// Update the keyPressed function
function keyPressed() {
	if (key === ' ') {
		soundEnabled = !soundEnabled;
		
		if (soundEnabled) {
			// Start audio context and oscillator
			if (getAudioContext().state !== 'running') {
				getAudioContext().resume().then(() => {
					console.log('Audio context started');
					startSound();
				});
			} else {
				startSound();
			}
		} else {
			// Stop all sounds
			stopSound();
		}
		
		// Prevent default spacebar behavior
		return false;
	} else if (key === 'r' || key === 'R') {
		if (!recording) {
			console.log('Starting recording...');
			recording = true;
			chunks = [];
			recorder.start(100);
			showUI = false;  // Hide UI when recording starts
		}
	} else if (key === 's' || key === 'S') {
		if (recording) {
			console.log('Stopping recording...');
			recording = false;
			recorder.stop();
			showUI = true;   // Show UI when recording stops
		}
	}
}

// Add these helper functions
function startSound() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    
    if (!osc.started) {
        osc.start();
    }
    
    // Start and set volumes for all oscillators
    droneOsc1.start();
    droneOsc2.start();
    droneOsc1.amp(0.3, 1);
    droneOsc2.amp(0.2, 1);
    
    osc.freq(200);
    osc.amp(0.6, 0.1);
    
    audioStarted = true;
    
    // Update control panel indicators
    let soundDot = document.getElementById('sound-dot');
    let soundText = document.getElementById('sound-text');
    soundDot.className = 'status-indicator status-on';
    soundText.textContent = 'ON';
    
    console.log('Sound started');
}

function stopSound() {
    // Fade out all oscillators
    osc.amp(0, 0.1);
    droneOsc1.amp(0, 0.5);
    droneOsc2.amp(0, 0.5);
    
    audioStarted = false;
    
    // Update control panel indicators
    let soundDot = document.getElementById('sound-dot');
    let soundText = document.getElementById('sound-text');
    soundDot.className = 'status-indicator status-off';
    soundText.textContent = 'OFF';
    
    console.log('Sound stopped');
}

// Add this function to set up recording
function setupRecording() {
	// Set up canvas stream
	const canvasStream = document.querySelector('canvas').captureStream(60);
	
	// Get the p5.js audio context and create destination
	const audioCtx = getAudioContext();
	const dest = audioCtx.createMediaStreamDestination();
	
	// Connect all audio nodes to both destinations
	osc.disconnect();
	filter.disconnect();
	delay.disconnect();
	reverb.disconnect();
	
	// Reconnect audio chain for both recording and live playback
	osc.connect(filter);
	filter.connect(delay);
	delay.connect(reverb);
	reverb.connect(dest);  // Connect to recording destination
	reverb.connect(audioCtx.destination);  // Connect to speakers
	
	// Combine video and audio streams
	const tracks = [
		...canvasStream.getVideoTracks(),
		...dest.stream.getAudioTracks()
	];
	
	// Create a new MediaStream with both audio and video
	const combinedStream = new MediaStream(tracks);
	
	// Create recorder
	recorder = new MediaRecorder(combinedStream, {
		mimeType: 'video/webm',
		videoBitsPerSecond: 8000000,
		audioBitsPerSecond: 256000
	});
	
	// Handle recorded data
	recorder.ondataavailable = e => {
		if (e.data.size > 0) chunks.push(e.data);
	};
	
	// Handle recording stop
	recorder.onstop = async () => {
		const blob = new Blob(chunks, { type: 'video/webm' });
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		
		// Create download link
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `snake-recording-${timestamp}.webm`;
		a.click();
		
		// Show conversion instructions
		alert('Recording saved as WebM!\n\nTo play in QuickTime:\n1. Download HandBrake (handbrake.fr)\n2. Open HandBrake and load the .webm file\n3. Select "Apple 1080p60 Surround" preset\n4. Click "Start Encode"');
		
		// Cleanup
		chunks = [];
		URL.revokeObjectURL(a.href);
	};
}

// Add this function for sniffing sounds
function makeSniffingSound(intensity) {
	if (!soundEnabled || !audioStarted) return;
	
	let currentTime = millis();
	if (currentTime - lastSoundTime < 50) return;  // Minimum time between sniffs
	lastSoundTime = currentTime;
	
	// Base sniffing sound
	let sniffFreq = map(intensity, 0, 80, 200, 400);
	let sniffDuration = map(intensity, 0, 80, 0.1, 0.05);
	
	// Create quick envelope for sniff sound
	osc.freq(sniffFreq);
	osc.amp(0.2, 0.01);
	
	// Add filter sweep
	filter.freq(map(intensity, 0, 80, 2000, 4000));
	filter.res(8);  // Higher resonance for sniffs
	
	// Quick release
	setTimeout(() => {
		if (soundEnabled) {
			osc.amp(0, 0.05);
		}
	}, sniffDuration * 1000);
}

// Add this function to update drone sounds
function updateDrone() {
	if (!soundEnabled || !audioStarted) return;
	
	let speed = dist(segments[0].x, segments[0].y, lastPosition.x, lastPosition.y);
	
	// More complex frequency modulation based on evolution
	let baseFreq = map(segments[0].y, height, 0, 40, 80);
	let detune = map(segments[0].x, 0, width, -4 - complexityLevel, 4 + complexityLevel);
	
	// Add evolution-based modulation
	let evolutionMod = sin(frameCount * (0.01 + complexityLevel * 0.005)) * complexityLevel;
	
	droneOsc1.freq(baseFreq + evolutionMod + sin(frameCount * 0.01) * (0.5 + complexityLevel));
	droneOsc2.freq(baseFreq * (1.5 + complexityLevel * 0.1) + detune + evolutionMod);
	 
	// More complex amplitude modulation
	let droneAmp = map(speed, 0, 10, 0.4, 0.1) * (1 + sin(frameCount * 0.1) * complexityLevel * 0.1);
	droneOsc1.amp(droneAmp, 0.1);
	droneOsc2.amp(droneAmp * (0.8 + complexityLevel * 0.05), 0.1);
	
	// Enhanced filter modulation with evolution
	let filterFreq = map(bendAmount, 0, 1, 400, 2000 + complexityLevel * 500);
	filterFreq *= map(curvature, 0, PI, 1, 2 + complexityLevel * 0.2);
	droneFilter.freq(filterFreq);
	
	droneFilter.res(map(stretchAmount, 0, 10, 10 + complexityLevel * 2, 20 + complexityLevel * 3));
	droneReverb.drywet(map(speed, 0, 20, 0.9, 0.5 + complexityLevel * 0.1));
}

// Add this function to handle evolution
function evolveComplexity() {
	let currentTime = millis();
	if (currentTime - lastEvolutionCheck > evolutionInterval) {
		lastEvolutionCheck = currentTime;
		evolutionTime++;
		
		// Constrain complexity level
		complexityLevel = constrain(evolutionTime / 8, 0, maxComplexity);
		
		// Safety check for harmonics
		if (harmonics && harmonics.length < 8) { // Limit max harmonics
			try {
				harmonics.push({
					freq: baseFreq * (2 + complexityLevel * 0.5),
					amp: 0.3 / (1 + complexityLevel * 0.2)
				});
			} catch (e) {
				console.log('Harmonic creation failed:', e);
			}
		}
		
		// Safely update sound parameters
		try {
			if (droneFilter) droneFilter.res(constrain(12 + complexityLevel * 2, 0, 30));
			if (delay) delay.feedback(constrain(0.4 + complexityLevel * 0.1, 0, 0.9));
		} catch (e) {
			console.log('Sound parameter update failed:', e);
		}
	}
}

// Add this new function for echolocation clicks
function makeClickSound() {
	if (!soundEnabled || !audioStarted) return;
	
	let currentTime = millis();
	if (currentTime - lastClickTime < minClickInterval) return;
	
	// Calculate distance to edges
	let head = segments[0];
	let edgeProximity = min(
		head.x,
		width - head.x,
		head.y,
		height - head.y
	);
	
	// Adjust click parameters based on proximity
	let clickFreq = map(edgeProximity, 0, 200, 2000, 800);
	let clickRate = map(edgeProximity, 0, 200, 50, 200);
	minClickInterval = clickRate;
	
	// Make the click sound
	clickOsc.freq(clickFreq);
	clickEnv.play(clickOsc);
	
	lastClickTime = currentTime;
}

// Update the makeSqueakSound function for more human-like sounds
function makeSqueakSound(intensity) {
	if (!soundEnabled || !audioStarted) return;
	
	let currentTime = millis();
	if (currentTime - lastSqueakTime < 150) return;  // Longer interval between sounds
	
	// Create more human-like vowel formants
	let baseFreq = map(intensity, 0, 1, 200, 400);  // Lower frequency range
	let formant1 = baseFreq * 2.5;  // First formant
	let formant2 = baseFreq * 3.5;  // Second formant
	
	// Add vibrato for more organic sound
	let vibrato = sin(frameCount * 0.2) * 10;
	squeakOsc.freq(baseFreq + vibrato);
	
	// Modulate envelope for more speech-like qualities
	squeakEnv.setRange(map(intensity, 0, 1, 0.1, 0.4), 0);
	squeakEnv.setADSR(
		0.1,                                // Attack
		0.2,                                // Decay
		map(intensity, 0, 1, 0.3, 0.6),     // Sustain
		0.3                                 // Release
	);
	
	// Add filter modulation for formants
	filter.freq(formant1);
	filter.res(8);
	
	// Add reverb for space
	reverb.drywet(0.3);
	
	squeakEnv.play(squeakOsc);
	lastSqueakTime = currentTime;
	
	// Propagate glow along the body
	let glowIntensity = map(intensity, 0, 1, 0.5, maxBodyGlow);
	bodyGlow[selfExploreTarget] = glowIntensity;
	
	// Spread glow to nearby segments
	let spread = 3;  // How many segments each way to spread
	for (let i = 1; i <= spread; i++) {
		let fadeAmount = map(i, 1, spread, 0.8, 0.2);
		if (selfExploreTarget - i >= 0) {
			bodyGlow[selfExploreTarget - i] = max(bodyGlow[selfExploreTarget - i], glowIntensity * fadeAmount);
		}
		if (selfExploreTarget + i < bodyGlow.length) {
			bodyGlow[selfExploreTarget + i] = max(bodyGlow[selfExploreTarget + i], glowIntensity * fadeAmount);
		}
	}
}

function startFragmentation() {
	fragmenting = true;
	fragments = [];
	
	// Split into 3-5 fragments
	let numFragments = floor(random(3, 6));
	let segmentsPerFragment = floor(segments.length / numFragments);
	
	for (let i = 0; i < numFragments; i++) {
		let start = i * segmentsPerFragment;
		let end = i === numFragments - 1 ? segments.length : start + segmentsPerFragment;
		
		fragments.push({
			segments: segments.slice(start, end),
			velocity: p5.Vector.random2D().mult(random(2, 5)),
			rotation: random(-0.1, 0.1)
		});
	}
}

function updateFragments() {
	for (let fragment of fragments) {
		// Move fragment
		for (let segment of fragment.segments) {
			segment.x += fragment.velocity.x;
			segment.y += fragment.velocity.y;
			
			// Rotate around fragment center
			let center = createVector(0, 0);
			for (let s of fragment.segments) {
				center.add(createVector(s.x, s.y));
			}
			center.div(fragment.segments.length);
			
			let rotated = rotatePoint(
				segment.x, segment.y,
				center.x, center.y,
				fragment.rotation
			);
			segment.x = rotated.x;
			segment.y = rotated.y;
		}
		
		// Slow down
		fragment.velocity.mult(0.98);
		fragment.rotation *= 0.98;
	}
}

function startReassembly() {
	fragmenting = false;
	reassembling = true;
	fragmentTimer = 0;
}

function updateReassembly() {
	let allReassembled = true;
	
	for (let i = 0; i < fragments.length; i++) {
		let fragment = fragments[i];
		let targetStart = i * (segments.length / fragments.length);
		
		for (let j = 0; j < fragment.segments.length; j++) {
			let segment = fragment.segments[j];
			let targetIndex = floor(targetStart + j);
			let target = segments[targetIndex];
			
			let dx = target.x - segment.x;
			let dy = target.y - segment.y;
			
			segment.x += dx * 0.1;
			segment.y += dy * 0.1;
			
			if (abs(dx) > 1 || abs(dy) > 1) {
				allReassembled = false;
			}
		}
	}
	
	if (allReassembled) {
		reassembling = false;
		fragments = [];
	}
}

function rotatePoint(x, y, cx, cy, angle) {
	let s = sin(angle);
	let c = cos(angle);
	
	// Translate point back to origin
	x -= cx;
	y -= cy;
	
	// Rotate point
	let xnew = x * c - y * s;
	let ynew = x * s + y * c;
	
	// Translate point back
	return {
		x: xnew + cx,
		y: ynew + cy
	};
}

function findNutrientClusters() {
	// Prevent concurrent processing
	if (isProcessingCluster) return [];
	isProcessingCluster = true;
	
	try {
		// Basic validation
		if (!nutrients || !Array.isArray(nutrients) || nutrients.length === 0) {
			isProcessingCluster = false;
			return [];
		}
		
		// Limit processing time
		const startTime = performance.now();
		let clusters = [];
		let checked = new Set();
		
		for (let i = 0; i < nutrients.length; i++) {
			if (performance.now() - startTime > maxProcessingTime) {
				console.log('Cluster processing timeout');
				break;
			}
			
			if (!nutrients[i] || checked.has(i)) continue;
			if (clusters.length >= MAX_CLUSTER_SIZE) break;
			
			let cluster = {
				nutrients: [i],
				center: createVector(nutrients[i].x, nutrients[i].y)
			};
			checked.add(i);
			
			// Limit nearby search
			let nearbyCount = 0;
			for (let j = 0; j < nutrients.length && nearbyCount < 10; j++) {
				if (!nutrients[j] || checked.has(j)) continue;
				
				let d = dist(nutrients[i].x, nutrients[i].y,
							nutrients[j].x, nutrients[j].y);
				if (d < 50) {
					cluster.nutrients.push(j);
					checked.add(j);
					nearbyCount++;
				}
			}
			
			if (cluster.nutrients.length > 3) {
				clusters.push(cluster);
			}
		}
		
		isProcessingCluster = false;
		return clusters;
	} catch (e) {
		console.error('Cluster calculation error:', e);
		isProcessingCluster = false;
		return [];
	}
}

function startFolding(cluster) {
	foldingNutrients = true;
	foldTarget = cluster;
	foldProgress = 0;
	
	// Store original positions for smooth animation
	nutrientCluster = cluster.nutrients.map(i => ({
		nutrient: nutrients[i],
		startPos: createVector(nutrients[i].x, nutrients[i].y),
		endPos: cluster.center.copy()
	}));
}

function updateFolding() {
	if (!nutrientCluster || nutrientCluster.length === 0) {
		foldingNutrients = false;
		return;
	}
	
	try {
		foldProgress += 1/foldDuration;
		
		if (foldProgress >= 1) {
			completeFolding();
		} else {
			updateFoldingAnimation();
		}
	} catch (e) {
		console.log('Folding update error:', e);
		foldingNutrients = false;
		nutrientCluster = [];
		foldTarget = null;
	}
}

function completeFolding() {
	let totalEnergy = 0;
	
	// Create absorption flash effect
	let flashSize = 100;
	let flashColor = color(220, 240, 255, 150);
	noStroke();
	for (let i = 4; i > 0; i--) {
		flashColor.setAlpha(150 / i);
		fill(flashColor);
		circle(foldTarget.center.x, foldTarget.center.y, flashSize * i);
	}
	
	for (let item of nutrientCluster) {
		if (item && item.nutrient) {
			totalEnergy += item.nutrient.opacity;
			
			// Create particle burst effect
			for (let i = 0; i < 5; i++) {
				let angle = random(TWO_PI);
				let speed = random(2, 5);
				let particle = {
					x: item.nutrient.x,
					y: item.nutrient.y,
					vx: cos(angle) * speed,
					vy: sin(angle) * speed,
					life: 1
				};
				absorptionParticles.push(particle);
			}
			
			// Remove the nutrient
			let index = nutrients.indexOf(item.nutrient);
			if (index > -1) {
				nutrients.splice(index, 1);
			}
		}
	}
	
	// Stronger energy boost
	digestingTimer = 150;
	headGlow = min(headGlow + totalEnergy * 1.5, maxGlow * 3);
	
	// Reset states
	foldingNutrients = false;
	nutrientCluster = [];
	foldTarget = null;
}

function updateFoldingAnimation() {
	for (let item of nutrientCluster) {
		let easeAmount = easeInOutCubic(foldProgress);
		
		// More dramatic spiral movement
		let spiralRadius = (1 - foldProgress) * 50; // Larger spiral
		let spiralSpeed = foldProgress * TWO_PI * 3; // Faster rotation
		let spiral = createVector(
			cos(spiralSpeed) * spiralRadius,
			sin(spiralSpeed) * spiralRadius
		);
		
		// Update position with more dramatic movement
		item.nutrient.x = lerp(item.startPos.x, item.endPos.x, easeAmount) + spiral.x;
		item.nutrient.y = lerp(item.startPos.y, item.endPos.y, easeAmount) + spiral.y;
		
		// Enhanced visual effects during folding
		item.nutrient.opacity = lerp(0.8, 1.5, easeAmount); // Brighter during fold
		item.nutrient.size = lerp(item.nutrient.size, 
								item.nutrient.size * 2.5, 
								easeAmount); // Larger growth
		
		// Add pulsing effect
		let pulse = sin(foldProgress * PI * 4) * 0.3;
		item.nutrient.size *= (1 + pulse);
		
		// Draw connection lines between folding nutrients
		stroke(220, 240, 255, 100 * (1 - foldProgress));
		strokeWeight(2);
		line(item.nutrient.x, item.nutrient.y, item.endPos.x, item.endPos.y);
	}
}

function easeInOutCubic(x) {
	return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}

// Add this cleanup function
function cleanupResources() {
	try {
		// Validate arrays
		if (!Array.isArray(trail)) trail = [];
		if (!Array.isArray(trailOpacity)) trailOpacity = [];
		if (!Array.isArray(nutrients)) nutrients = [];
		
		// Clean up trails
		while (trail.length > MAX_TRAIL_LENGTH) {
			trail.shift();
			trailOpacity.shift();
		}
		
		// Clean up nutrients
		nutrients = nutrients.filter(n => 
			n && typeof n.age === 'number' && n.age < MAX_NUTRIENT_AGE);
		
		// Reset stuck states
		if (foldingNutrients && foldProgress > 1.5) {
			foldingNutrients = false;
			nutrientCluster = [];
			foldTarget = null;
		}
		
		isProcessingCluster = false;
		
	} catch (e) {
		console.error('Cleanup error:', e);
		// Reset to safe state
		trail = [];
		trailOpacity = [];
		nutrients = [];
		foldingNutrients = false;
		isProcessingCluster = false;
	}
}

// Add this function to handle evolution
function evolveOrganism(touchPoint) {
	let currentTime = millis();
	if (currentTime - lastTouchTime < touchCooldown) return;
	lastTouchTime = currentTime;
	
	// Increment evolution
	evolutionLevel = min(evolutionLevel + 0.2, maxEvolution);
	growthFactor = 1.0 + (evolutionLevel * 0.15); // Grow up to 75% larger
	colorEvolution = min(colorEvolution + 0.15, 1.0);
	soundEvolution = min(soundEvolution + 0.1, 1.0);
	
	// Update sound parameters
	baseFrequency = lerp(220, 440, soundEvolution);
	harmonicGains = harmonicGains.map(g => g * (1 + soundEvolution * 0.2));
	
	// Create evolution particles
	for (let i = 0; i < 15; i++) {
		let angle = random(TWO_PI);
		let speed = random(2, 5);
		absorptionParticles.push({
			x: touchPoint.x,
			y: touchPoint.y,
			vx: cos(angle) * speed,
			vy: sin(angle) * speed,
			life: 1,
			color: color(
				200 + random(-20, 20) * colorEvolution,
				220 + random(-20, 20) * colorEvolution,
				255 + random(-20, 20) * colorEvolution,
				200
			)
		});
	}
}

// Update the segment drawing code in draw()
function drawSegments() {
	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i];
		let progress = i / segments.length;
		
		// Calculate size with growth factor
		let size = segmentLength * organismSize * growthFactor;
		
		// Enhanced color based on size and energy
		let energyPulse = sin(frameCount * 0.05) * 0.5 + 0.5;
		let r = 200 + (organismSize - 1) * 30 + digestionEnergy * 20 * energyPulse;
		let g = 220 + (organismSize - 1) * 25 + digestionEnergy * 15 * energyPulse;
		let b = 255 + (organismSize - 1) * 20 + digestionEnergy * 10 * energyPulse;
		
		// Draw enhanced glow
		noStroke();
		for (let j = 3; j > 0; j--) {
			let glowSize = size * (1 + j * 0.4 * (1 + digestionEnergy * 0.2));
			let alpha = map(j, 3, 0, 30, 150) * (1 + digestionEnergy * 0.5);
			fill(r, g, b, alpha);
			circle(segment.x, segment.y, glowSize);
		}
		
		// Draw segment core
		fill(r, g, b, 200);
		circle(segment.x, segment.y, size);
	}
	
	// Decay energy over time
	digestionEnergy = max(0, digestionEnergy - energyDecayRate);
}

// Update checkSelfIntersection function to detect Ouroboros more easily
function checkSelfIntersection() {
    let head = segments[0];
    
    // Check more tail segments for Ouroboros (last 8 segments instead of 3)
    for (let i = segments.length - 8; i < segments.length; i++) {
        let d = dist(head.x, head.y, segments[i].x, segments[i].y);
        // Increased detection radius
        if (d < segmentLength * 0.8) {  // Increased from 0.5 to 0.8
            createOuroborosEffect(head.x, head.y);
            return true;
        }
    }
    
    // Check other intersections
    for (let i = 4; i < segments.length - 8; i++) {
        let d = dist(head.x, head.y, segments[i].x, segments[i].y);
        if (d < segmentLength * 0.5) {
            createIntersectionEffect(head.x, head.y);
            playIntersectionSound();
            return true;
        }
    }
    
    return false;
}

// Update updateSound function to include safety limits
function updateSound() {
    if (!audioStarted || segments.length === 0) return;
    
    // Calculate spatial position based on organism movement
    let headX = segments[0].x;
    let headY = segments[0].y;
    
    // Calculate pan position (-1 to 1) with safety limits
    let panTarget = constrain(map(headX, 0, width, -0.8, 0.8), -1, 1);
    lastPanPosition = lerp(lastPanPosition, panTarget, panSmoothness);
    
    // Update panner
    mainPanner.pan.rampTo(lastPanPosition, 0.1);
    
    // Calculate distance from center for spatial effects
    let centerX = width / 2;
    let centerY = height / 2;
    let distanceFromCenter = dist(headX, headY, centerX, centerY);
    let maxDistance = dist(0, 0, width/2, height/2);
    let distanceRatio = constrain(distanceFromCenter / maxDistance, 0, 1);
    
    // Update reverb with safety limits
    mainReverb.wet.rampTo(
        Math.min(map(distanceRatio, 0, 1, 0.2, 0.4), MAX_FEEDBACK),
        0.1
    );
    
    // Update delay based on movement with safety limits
    if (movementAmount > soundThreshold && 
        millis() - lastSoundTime > minSoundInterval) {
        
        // Frequency modulation with safety limits
        let freq = constrain(
            map(headY, height, 0, 110, 880),
            MIN_FILTER_FREQ,
            MAX_FILTER_FREQ
        );
        osc.frequency.rampTo(freq, 0.1);
        
        // Filter modulation with safety limits
        let filterFreq = constrain(
            map(Math.abs(headX - centerX), 0, width/2, 2000, 500),
            MIN_FILTER_FREQ,
            MAX_FILTER_FREQ
        );
        spatialFilter.frequency.rampTo(filterFreq, 0.1);
        
        // Delay feedback with safety limits
        spatialDelay.feedback.rampTo(
            Math.min(map(distanceRatio, 0, 1, 0.1, 0.3), MAX_FEEDBACK),
            0.1
        );
        
        // Update drone sounds with safety limits
        if (droneOsc1 && droneOsc2) {
            let baseFreq = constrain(
                map(distanceRatio, 0, 1, 100, 150),
                MIN_FILTER_FREQ,
                MAX_FILTER_FREQ
            );
            droneOsc1.frequency.rampTo(baseFreq * 0.5, 0.2);
            droneOsc2.frequency.rampTo(baseFreq * 0.75, 0.2);
            
            // Adjust volumes with safety limits
            let volumeMod = constrain(map(distanceRatio, 0, 1, 1, 0.6), 0, MAX_VOLUME);
            droneOsc1.volume.rampTo(-24 * volumeMod, 0.1);
            droneOsc2.volume.rampTo(-24 * volumeMod, 0.1);
        }
        
        lastSoundTime = millis();
    }
}

// Add these new functions
function mousePressed() {
	if (!mouseIsPressed) return;
	
	// Create dramatic spawn effect
	let spawnColor = color(200 + random(-20, 20), 
						  220 + random(-20, 20), 
						  255 + random(-20, 20));
	
	// Create expanding rings
	for (let i = 0; i < 3; i++) {
		spawnParticles.push({
			x: mouseX,
			y: mouseY,
			radius: 10,
			maxRadius: spawnRadius * (1 + i * 0.5),
			alpha: 255,
			color: spawnColor,
			delay: i * 100
		});
	}
	
	// Create food particles with more variation
	for (let i = 0; i < 5; i++) {
		let angle = random(TWO_PI);
		let dist = random(20, 50);
		let spawnDelay = i * 100; // Stagger spawn times
		
		setTimeout(() => {
			foodParticles.push({
				x: mouseX + cos(angle) * dist,
				y: mouseY + sin(angle) * dist,
				size: random(8, 15),
				color: color(
					random(180, 220),
					random(200, 240),
					random(220, 255),
					200
				),
				age: 0,
				maxAge: random(300, 600),
				wiggleOffset: random(1000),
				spawnTime: millis(),
				initialSize: 0 // Start small and grow
			});
		}, spawnDelay);
	}
	
	// Play spawn sound
	if (soundEnabled) {
		// Create interesting spawn sound
		lastSpawnPitch = constrain(lastSpawnPitch + random(-50, 50), 330, 550);
		spawnSound.freq(lastSpawnPitch);
		spawnSound.amp(0);
		spawnSound.start();
		spawnSound.amp(0.2, 0.05); // Quick attack
		
		// Create descending chime effect
		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				spawnSound.freq(lastSpawnPitch * (1 - i * 0.2));
				spawnSound.amp(0.15 / (i + 1), 0.05);
			}, i * 100);
		}
		
		// Fade out
		setTimeout(() => {
			spawnSound.amp(0, 0.2);
		}, 500);
	}
	
	// Limit total particles
	if (foodParticles.length > maxFoodParticles) {
		foodParticles.splice(0, foodParticles.length - maxFoodParticles);
	}
}

function updateFoodParticles() {
	for (let i = foodParticles.length - 1; i >= 0; i--) {
		let food = foodParticles[i];
		
		// Grow particles from spawn
		if (millis() - food.spawnTime < 500) {
			food.size = map(millis() - food.spawnTime, 0, 500, 0, random(8, 15));
		}
		
		// Add gentle floating movement
		food.x += sin(frameCount * 0.05 + food.wiggleOffset) * 0.5;
		food.y += cos(frameCount * 0.05 + food.wiggleOffset) * 0.5;
		
		// Draw food particle with enhanced glow
		noStroke();
		for (let j = 3; j > 0; j--) {
			let glowSize = food.size * (1 + j * 0.5);
			let alpha = map(j, 3, 0, 30, 200);
			food.color.setAlpha(alpha);
			fill(food.color);
			circle(food.x, food.y, glowSize);
		}
		
		// Check if eaten
		let d = dist(food.x, food.y, segments[0].x, segments[0].y);
		let eatRadius = segmentLength * organismSize;
		
		if (d < eatRadius) {
			// Grow from eating
			organismSize = min(organismSize + particleNutrition, maxOrganismSize);
			digestionEnergy += particleNutrition * 2;
			
			// Create more dramatic absorption effect
			for (let j = 0; j < 12; j++) {
				let angle = random(TWO_PI);
				let speed = random(2, 6);
				absorptionParticles.push({
					x: food.x,
					y: food.y,
					vx: cos(angle) * speed,
					 vy: sin(angle) * speed,
					life: 1,
					size: random(4, 8) * organismSize,
					color: lerpColor(
						food.color,
						color(255, 255, 255),
						random(0.2, 0.4)
					)
				});
			}
			
			// Remove eaten food
			foodParticles.splice(i, 1);
			
			// Enhanced visual feedback
			headGlow = maxGlow * 2;
			createDigestionEffect(food.x, food.y);
			
			// Trigger evolution with accumulated energy
			if (digestionEnergy > 1) {
				evolveOrganism({x: food.x, y: food.y});
				digestionEnergy *= 0.5; // Consume some energy for evolution
			}
			
			// Play eating sound
			if (soundEnabled && millis() - lastEatSound > minEatSoundInterval) {
				// Quick eating sound
				eatSound.freq(440 + random(-50, 50));
				eatSound.amp(0.2, 0.01);
				eatSound.start();
				setTimeout(() => eatSound.amp(0, 0.1), 100);
				
				// Digestion sound
				digestSound.freq(220 * digestPitch);
				digestSound.amp(0.1, 0.1);
				digestSound.start();
				digestPitch = constrain(digestPitch + 0.05, 1.0, 2.0);
				setTimeout(() => digestSound.amp(0, 0.2), 300);
				
				// Growth sound when size increases
				if (organismSize > 1.0) {
					growthSound.freq(growthPitch * (1 + (organismSize - 1) * 0.5));
					growthSound.amp(0.15, 0.1);
					growthSound.start();
					setTimeout(() => growthSound.amp(0, 0.3), 500);
					growthPitch = constrain(growthPitch + 10, 220, 440);
				}
				
				lastEatSound = millis();
			}
		}
	}
}

function attractToFood() {
	let head = segments[0];
	let closestFood = null;
	let closestDist = foodAttractionRadius;
	
	// Find closest food particle
	for (let food of foodParticles) {
		let d = dist(head.x, head.y, food.x, food.y);
		if (d < closestDist) {
			closestDist = d;
			closestFood = food;
		}
	}
	
	// Attract to closest food
	if (closestFood) {
		let attraction = createVector(
			closestFood.x - head.x,
			closestFood.y - head.y
		);
		
		// Scale attraction based on distance
		let strength = map(closestDist, 0, foodAttractionRadius, attractionForce, 0);
		attraction.setMag(strength);
		
		// Apply attraction to target
		targetX += attraction.x * 10;
		targetY += attraction.y * 10;
		
		// Draw attraction effect
		stroke(200, 220, 255, 50);
		strokeWeight(1);
		line(head.x, head.y, closestFood.x, closestFood.y);
		
		// Increase movement speed when near food
		speedMultiplier = map(closestDist, 0, foodAttractionRadius, 1.5, 1);
	}
}

// Add this function for digestion effects
function createDigestionEffect(x, y) {
	// Create expanding ring effect
	let ringCount = 8;
	for (let i = 0; i < ringCount; i++) {
		setTimeout(() => {
			let ring = {
				x: x,
				y: y,
				radius: segmentLength * 0.5,
				maxRadius: segmentLength * 2,
				alpha: 255,
				color: color(220, 240, 255)
			};
			
			// Add to existing particles array or create new one
			if (!window.digestionRings) window.digestionRings = [];
			window.digestionRings.push(ring);
		}, i * 50);
	}
}

// Add this to draw function to update digestion effects
function updateDigestionEffects() {
	if (!window.digestionRings) return;
	
	for (let i = window.digestionRings.length - 1; i >= 0; i--) {
		let ring = window.digestionRings[i];
		
		// Draw expanding ring
		noFill();
		stroke(ring.color.levels[0], ring.color.levels[1], 
			   ring.color.levels[2], ring.alpha);
		strokeWeight(2);
		circle(ring.x, ring.y, ring.radius * 2);
		
		// Update ring
		ring.radius += (ring.maxRadius - ring.radius) * 0.1;
		ring.alpha *= 0.9;
		
		// Remove faded rings
		if (ring.alpha < 5) {
			window.digestionRings.splice(i, 1);
		}
	}
}

// Add cleanup to stop sounds
function cleanup() {
	if (eatSound) eatSound.stop();
	if (digestSound) digestSound.stop();
	if (growthSound) growthSound.stop();
}

// Add this function to update spawn effects
function updateSpawnEffects() {
	// Update and draw spawn particles
	for (let i = spawnParticles.length - 1; i >= 0; i--) {
		let p = spawnParticles[i];
		
		if (frameCount % 2 === 0 && millis() > p.delay) {
			// Expand rings
			p.radius += (p.maxRadius - p.radius) * 0.1;
			p.alpha *= 0.95;
			
			// Draw expanding ring
			noFill();
			p.color.setAlpha(p.alpha);
			stroke(p.color);
			strokeWeight(2);
			circle(p.x, p.y, p.radius * 2);
			
			// Draw connecting lines between rings
			if (i > 0) {
				let prev = spawnParticles[i - 1];
				let lerpAmount = 0.5 + sin(frameCount * 0.1) * 0.2;
				let midX = lerp(p.x, prev.x, lerpAmount);
				let midY = lerp(p.y, prev.y, lerpAmount);
				
				strokeWeight(1);
				p.color.setAlpha(p.alpha * 0.5);
				stroke(p.color);
				line(p.x, p.y, midX, midY);
			}
			
			// Remove faded particles
			if (p.alpha < 5) {
				spawnParticles.splice(i, 1);
			}
		}
	}
}

// Update the sound generation for eating
function playEatingSound(food) {
    if (!soundEnabled || evolutionState.sound < 0.1) return;
    
    let currentTime = millis();
    if (currentTime - lastEatSound < minEatSoundInterval) return;
    
    // Scale sound intensity with evolution and add fluctuation
    let soundIntensity = evolutionState.sound;
    volumeNoiseOffset += volumeNoiseSpeed;
    volumeFluctuation = noise(volumeNoiseOffset) * volumeNoiseAmount;
    let baseAmp = map(soundIntensity, 0, 1, 0.05, 0.2) * 
                 (1 + volumeFluctuation);
    
    // Generate techno beat with dynamic amplitude
    if (currentTime - lastBeatTime > beatInterval) {
        beatIndex = (beatIndex + 1) % beatPattern.length;
        lastBeatTime = currentTime;
        
        if (beatPattern[beatIndex] > 0) {
            let beatIntensity = beatPattern[beatIndex] * 
                               (1 + sin(currentTime * 0.003) * 0.3);
            
            // Techno synth hit with fluctuating volume
            let baseFreq = map(organismSize, 1, maxOrganismSize, 220, 440);
            technoSynth.freq(baseFreq * (1 + sin(filterSweep) * 0.1));
            technoSynth.amp(baseAmp * beatIntensity, 0.01);
            technoSynth.start();
            
            // More dynamic filter sweep
            filterSweep += 0.2 * (1 + volumeFluctuation);
            let filterFreq = map(sin(filterSweep), -1, 1, 500, 5000) * 
                           (1 + volumeFluctuation * 0.5);
            technoFilter.freq(filterFreq);
            
            // Schedule note off with variable decay
            setTimeout(() => {
                technoSynth.amp(0, 0.1 * (1 + volumeFluctuation));
            }, beatInterval * 0.8);
        }
    }
    
    // Layer frequencies with dynamic amplitudes
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            let harmonicFreq = evolvedFreq * (1 + i * 0.5);
            technoSynth.freq(harmonicFreq);
            
            // Add more variation to layered sounds
            let layerFluctuation = noise(volumeNoiseOffset + i) * volumeNoiseAmount;
            let layerAmp = baseAmp * 0.15 / (i + 1) * 
                          (1 + layerFluctuation) * 
                          (1 + sin(currentTime * 0.002 + i) * 0.2);
            
            technoSynth.amp(layerAmp, 0.05);
            
            // Modulate filter with organic variations
            technoFilter.freq(
                map(sin(currentTime * 0.002 + i), -1, 1, 
                    500 * (1 + layerFluctuation), 
                    5000 * (1 + layerFluctuation)
                )
            );
        }, i * beatInterval / 3);
    }
}

// Update spawn sound to be more techno
function playSpawnSound() {
    if (!soundEnabled) return;
    
    // Create rhythmic pattern
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            let freq = map(i, 0, 3, 880, 220);
            technoSynth.freq(freq);
            technoSynth.amp(0.2 * (1 - i/4), 0.05);
            
            // Filter modulation
            technoFilter.freq(map(i, 0, 3, 5000, 500));
            technoFilter.res(map(i, 0, 3, 10, 2));
            
            // Delay feedback
            technoDelay.feedback(map(i, 0, 3, 0.7, 0.2));
        }, i * beatInterval);
    }
}

// Update the ambient sound
function updateAmbientSound() {
    if (!soundEnabled || evolutionState.sound < 0.05) return;
    
    let currentTime = millis();
    
    // Scale ambient sound with evolution
    let ambientIntensity = evolutionState.sound;
    let baseAmp = map(ambientIntensity, 0, 1, 0.02, 0.15);
    
    // Add organic volume fluctuations
    volumeNoiseOffset += volumeNoiseSpeed;
    volumeFluctuation = noise(volumeNoiseOffset) * volumeNoiseAmount;
    let fluctuatingAmp = baseAmp * (1 + volumeFluctuation);
    
    // Add subtle rhythmic pulsing
    let pulsing = sin(currentTime * 0.002) * 0.2 + 0.8;
    
    let ambientFreq = map(sin(currentTime * 0.001), -1, 1, 220, 440);
    technoSynth.freq(ambientFreq);
    technoSynth.amp(fluctuatingAmp * pulsing, 0.1);
    
    // Modulate filter with more variation
    let filterMod = map(sin(currentTime * 0.0015), -1, 1, 500, 5000) * 
                   (1 + volumeFluctuation * 0.5);
    technoFilter.freq(filterMod);
}

// Add this function to handle evolution
function updateEvolution() {
    let currentTime = millis();
    let progress = (currentTime - evolutionState.startTime) / evolutionState.evolutionDuration;
    evolutionState.awakening = constrain(progress, 0, 1);
    
    // Increase activity at night
    let timeBonus = dayNightCycle.activityLevel * 0.3;  // Up to 30% more active at night
    
    // Update movement parameters with time influence
    evolutionState.movement = (smoothstep(0, 0.3, evolutionState.awakening) + timeBonus) * 
                             map(dayNightCycle.activityLevel, 0, 1, 0.7, 1.3);
    noiseSpeed = baseNoiseSpeed * evolutionState.movement;
    noiseAmount = baseNoiseAmount * evolutionState.movement;
    speedMultiplier = map(evolutionState.movement, 0, 1, 0.1, 1);
    
    // Update sound parameters with time influence
    evolutionState.sound = (smoothstep(0.1, 0.4, evolutionState.awakening) + timeBonus) * 
                          map(dayNightCycle.activityLevel, 0, 1, 0.7, 1.3);
}

// Helper function for smooth transitions
function smoothstep(edge0, edge1, x) {
	x = constrain((x - edge0) / (edge1 - edge0), 0, 1);
	return x * x * (3 - 2 * x);
}

// Add this function to update background color
function updateBackground() {
    // Update time of day
    if (millis() - dayNightCycle.lastUpdate > dayNightCycle.updateInterval) {
        updateTimeOfDay();
        dayNightCycle.lastUpdate = millis();
    }
    
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let timeOfDay = hours + minutes/60; // Time as decimal
    
    // Calculate color based on time of day with more transitions
    let targetColors = { r: 0, g: 0, b: 0 };
    
    if (timeOfDay >= 0 && timeOfDay < 4) {
        // Deep night (midnight to 4am)
        let t = map(timeOfDay, 0, 4, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.deepNight, dayNightCycle.colors.night, t);
    } else if (timeOfDay >= 4 && timeOfDay < 7) {
        // Night to dawn transition (4am to 7am)
        let t = map(timeOfDay, 4, 7, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.night, dayNightCycle.colors.dawn, t);
    } else if (timeOfDay >= 7 && timeOfDay < 12) {
        // Dawn to day transition (7am to noon)
        let t = map(timeOfDay, 7, 12, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.dawn, dayNightCycle.colors.day, t);
    } else if (timeOfDay >= 12 && timeOfDay < 17) {
        // Day to dusk transition (noon to 5pm)
        let t = map(timeOfDay, 12, 17, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.day, dayNightCycle.colors.dusk, t);
    } else if (timeOfDay >= 17 && timeOfDay < 20) {
        // Dusk to deep night (5pm to 8pm)
        let t = map(timeOfDay, 17, 20, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.dusk, dayNightCycle.colors.deepNight, t);
    } else {
        // Deep night (8pm to midnight)
        let t = map(timeOfDay, 20, 24, 0, 1);
        targetColors = lerpColors(dayNightCycle.colors.deepNight, dayNightCycle.colors.night, t);
    }
    
    // Add subtle variation with noise
    let noiseInfluence = 3;  // Reduced for more consistent colors
    let evolutionInfluence = evolutionState.awakening * 5;  // Reduced evolution influence
    
    // Set target colors with influences
    bgColor.targetR = targetColors.r + 
                      (noise(bgColor.noiseOffsetR) - 0.5) * noiseInfluence + 
                      evolutionInfluence;
    bgColor.targetG = targetColors.g + 
                      (noise(bgColor.noiseOffsetG) - 0.5) * noiseInfluence + 
                      evolutionInfluence * 0.5;
    bgColor.targetB = targetColors.b + 
                      (noise(bgColor.noiseOffsetB) - 0.5) * noiseInfluence + 
                      evolutionInfluence * 0.3;
    
    // Smoother color transitions
    bgColor.lerpSpeed = 0.02;
    
    // Smoothly transition current colors
    bgColor.r = lerp(bgColor.r, bgColor.targetR, bgColor.lerpSpeed);
    bgColor.g = lerp(bgColor.g, bgColor.targetG, bgColor.lerpSpeed);
    bgColor.b = lerp(bgColor.b, bgColor.targetB, bgColor.lerpSpeed);
    
    // Apply the background color with opacity for atmosphere
    background(
        constrain(bgColor.r, 0, 255),
        constrain(bgColor.g, 0, 255),
        constrain(bgColor.b, 0, 255),
        240  // Slight transparency for atmospheric effect
    );
}

// Add helper function for color interpolation
function lerpColors(color1, color2, t) {
    return {
        r: lerp(color1.r, color2.r, t),
        g: lerp(color1.g, color2.g, t),
        b: lerp(color1.b, color2.b, t)
    };
}

// Add this function to update time of day
function updateTimeOfDay() {
    let currentTime = new Date();
    dayNightCycle.hour = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    
    // Calculate time progress through the day (0-1)
    let timeProgress = (dayNightCycle.hour * 60 + minutes) / 1440;
    let hourAngle = ((timeProgress * 24 - 2) / 24) * TWO_PI;
    
    // More extreme brightness variation
    dayNightCycle.brightness = map(
        sin(hourAngle), 
        -1, 1, 
        dayNightCycle.minBrightness, 
        dayNightCycle.maxBrightness
    );
    
    // More pronounced night activity
    let nightBonus = (dayNightCycle.hour >= 22 || dayNightCycle.hour <= 4) ? 0.3 : 0;
    dayNightCycle.activityLevel = map(
        -sin(hourAngle), 
        -1, 1, 
        dayNightCycle.minActivity, 
        dayNightCycle.maxActivity
    ) + nightBonus;
}

// Add this function to draw the time
function drawTimeDisplay() {
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    // Format minutes with leading zero
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    // Format time string
    let timeString = `${hours}:${minutes} ${ampm}`;
    
    // Position in bottom right corner
    timeDisplay.x = width - timeDisplay.padding;
    timeDisplay.y = height - timeDisplay.padding;
    
    // Draw time
    push();
    textAlign(RIGHT, BOTTOM);
    textSize(timeDisplay.fontSize);
    fill(200, 220, 255, timeDisplay.opacity);
    noStroke();
    text(timeString, timeDisplay.x, timeDisplay.y);
    pop();
}

// Update and draw organism
function drawOrganism() {
    let colors = getOrganismColor();
    blendMode(SCREEN);
    
    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        let segmentGlow = bodyGlow[i] * map(dayNightCycle.activityLevel, 0, 1, 0.5, 1.5);
        let glowSize = segmentLength * (1 + segmentGlow * 0.3);
        
        push();
        noStroke();
        
        // Simple base glow
        drawingContext.shadowBlur = 20 * segmentGlow;
        drawingContext.shadowColor = `rgba(${colors.glow.r}, ${colors.glow.g}, ${colors.glow.b}, 0.5)`;
        
        // Make the dark body much more transparent (80% transparent)
        fill(0, 0, 0, 51);  // Changed from 128 to 51 (only 20% opacity)
        circle(segment.x, segment.y, glowSize);
        
        // Draw internal rings/squares with increased visibility
        let ringCount = 3;
        for (let r = ringCount; r > 0; r--) {
            let ringSize = glowSize * (1 - r * 0.2);
            // Increase ring opacity to be more prominent through very transparent body
            let ringOpacity = map(r, 1, ringCount, 0.8, 0.4) * colors.body.a/255;
            
            let ringColor;
            switch(r % 5) {
                case 0: ringColor = PALETTE.deepTeal; break;
                case 1: ringColor = PALETTE.jade; break;
                case 2: ringColor = PALETTE.sand; break;
                case 3: ringColor = PALETTE.rust; break;
                case 4: ringColor = PALETTE.pearl; break;
            }
            
            fill(ringColor.r, ringColor.g, ringColor.b, ringOpacity * 255);
            
            // Alternate between squares and circles
            if (r % 2 === 0) {
                push();
                translate(segment.x, segment.y);
                rotate(frameCount * 0.01 + i * 0.1);
                rectMode(CENTER);
                rect(0, 0, ringSize * 0.8, ringSize * 0.8);
                pop();
            } else {
                circle(segment.x, segment.y, ringSize);
            }
        }
        
        pop();
    }
    
    blendMode(BLEND);
    drawingContext.shadowBlur = 0;
}

// Update getOrganismColor function to adjust glow opacity
function getOrganismColor() {
    realTimeOfDay.update();
    let hour = realTimeOfDay.hour;
    
    let bodyColor, glowColor;
    
    if (hour >= 0 && hour < 6) {
        // Deep night (midnight to 6am)
        bodyColor = { r: 25, g: 83, b: 95, a: 255 };  // Deep teal
        glowColor = { r: 11, g: 122, b: 117, a: 255 };  // Jade
    } else if (hour >= 6 && hour < 9) {
        // Dawn (6am to 9am)
        bodyColor = { r: 215, g: 201, b: 170, a: 255 };  // Sand
        glowColor = { r: 123, g: 45, b: 38, a: 255 };  // Rust
    } else if (hour >= 9 && hour < 17) {
        // Day (9am to 5pm)
        bodyColor = { r: 240, g: 243, b: 245, a: 255 };  // Pearl
        glowColor = { r: 11, g: 122, b: 117, a: 255 };  // Jade
    } else if (hour >= 17 && hour < 20) {
        // Dusk (5pm to 8pm)
        bodyColor = { r: 123, g: 45, b: 38, a: 255 };  // Rust
        glowColor = { r: 215, g: 201, b: 170, a: 255 };  // Sand
    } else {
        // Night (8pm to midnight)
        bodyColor = { r: 25, g: 83, b: 95, a: 255 };  // Deep teal
        glowColor = { r: 240, g: 243, b: 245, a: 255 };  // Pearl
    }
    
    return {
        body: bodyColor,
        glow: {
            ...glowColor,
            a: realTimeOfDay.isNight ? 140 : 190  // Dimmer at night
        }
    };
}

// Update getTrailColor function to ensure different colors
function getTrailColor() {
    // Get the current organism color
    let colors = getOrganismColor();
    
    // Create a fixed color mapping that ensures contrast
    let timeOfDay = new Date().getHours();
    
    // Choose trail color based on time of day, ensuring it's different from body
    let trailColor;
    if (timeOfDay >= 0 && timeOfDay < 6) {
        // Night (0-6): Use warm sand for trail when organism is teal/deep rose
        trailColor = PALETTE.warmSand;
    } else if (timeOfDay >= 6 && timeOfDay < 12) {
        // Morning (6-12): Use rose for trail when organism is warm/coral
        trailColor = PALETTE.rose;
    } else if (timeOfDay >= 12 && timeOfDay < 18) {
        // Afternoon (12-18): Use deep rose for trail when organism is teal/coral
        trailColor = PALETTE.deepRose;
    } else {
        // Evening (18-24): Use coral for trail when organism is rose/deep rose
        trailColor = PALETTE.coral;
    }
    
    // If trail color is too similar to body, use teal as fallback
    if (Math.abs(colors.body.r - trailColor.r) < 30 &&
        Math.abs(colors.body.g - trailColor.g) < 30 &&
        Math.abs(colors.body.b - trailColor.b) < 30) {
        trailColor = PALETTE.teal;
    }
    
    return trailColor;
}

// Update drawTrail function to make trails more visible
function drawTrail() {
    if (trail.length < 2) return;
    
    blendMode(SCREEN);
    noFill();
    
    for (let i = 0; i < trail.length - 1; i++) {
        let trailColor = getTrailColor();
        let opacity = trailOpacity[i] * 255;
        
        // Draw main trail with stronger opacity
        stroke(
            trailColor.r,
            trailColor.g,
            trailColor.b,
            opacity * 0.6  // Increased from 0.4
        );
        
        let sw = trailWidth * (1 - i/trail.length) * trailOpacity[i];
        strokeWeight(sw);
        
        // Draw trail segment
        line(
            trail[i].x,
            trail[i].y,
            trail[i + 1].x,
            trail[i + 1].y
        );
        
        // Add stronger glow effect
        stroke(
            trailColor.r,
            trailColor.g,
            trailColor.b,
            opacity * 0.3  // Increased from 0.2
        );
        strokeWeight(sw * 1.8);  // Increased from 1.5
        line(
            trail[i].x,
            trail[i].y,
            trail[i + 1].x,
            trail[i + 1].y
        );
    }
    
    blendMode(BLEND);
}

// Update updateTrail function to include color transitions
function updateTrail() {
    // Add current position to trail
    if (segments.length > 0) {
        trail.push(createVector(segments[0].x, segments[0].y));
        trailOpacity.push(1.0);
    }
    
    // Remove old trail points
    while (trail.length > trailLength) {
        trail.shift();
        trailOpacity.shift();
    }
    
    // Update trail opacity
    for (let i = 0; i < trailOpacity.length; i++) {
        trailOpacity[i] *= trailDecay;
    }
}

// Add these variables for hints
let hints = {
    x: 20,
    y: 20,
    padding: 15,
    opacity: 180,
    fadeTime: 3000, // Time in ms before hints start to fade
    showDuration: 5000 // Total time to show hints
};

// Add this to draw function
function drawHints() {
    let timeSinceStart = millis();
    let opacity = hints.opacity;
    
    // Fade out after fadeTime
    if (timeSinceStart > hints.fadeTime) {
        opacity = map(timeSinceStart, 
                     hints.fadeTime, 
                     hints.showDuration, 
                     hints.opacity, 
                     0);
    }
    
    // Stop drawing after showDuration
    if (timeSinceStart > hints.showDuration) return;
    
    push();
    fill(255, 255, 255, opacity);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    
    let y = hints.y;
    text('Controls:', hints.x, y);
    y += hints.padding;
    text('SPACE: Toggle sound', hints.x, y);
    y += hints.padding;
    text('R: Start recording', hints.x, y);
    y += hints.padding;
    text('S: Stop recording', hints.x, y);
    y += hints.padding;
    text('Mouse: Influence field', hints.x, y);
    
    // Draw sound status
    y += hints.padding * 1.5;
    text('Sound: ' + (soundEnabled ? 'ON' : 'OFF'), hints.x, y);
    
    // Draw recording indicator if active
    if (videoRecorder && videoRecorder.isRecording) {
        fill(255, 0, 0, opacity);
        circle(hints.x + 100, y + 5, 8);
    }
    pop();
}

// Add these variables at the top
let realTimeOfDay = {
    hour: 0,
    isNight: false,
    isDawn: false,
    isDay: false,
    isDusk: false,
    update: function() {
        this.hour = new Date().getHours();
        this.isNight = (this.hour >= 0 && this.hour < 6) || (this.hour >= 20);
        this.isDawn = this.hour >= 6 && this.hour < 9;
        this.isDay = this.hour >= 9 && this.hour < 17;
        this.isDusk = this.hour >= 17 && this.hour < 20;
    }
};

// Add this function to update behavior based on time
function updateTimeBasedBehavior() {
    realTimeOfDay.update();
    
    // Adjust noise and movement parameters based on time
    if (realTimeOfDay.isNight) {
        // Night: slower, more meandering movement
        noiseSpeed = baseNoiseSpeed * 0.7;
        noiseAmount = baseNoiseAmount * 1.3;
        segmentLength = baseSegmentLength * 1.1;
    } else if (realTimeOfDay.isDawn) {
        // Dawn: gradual awakening
        noiseSpeed = baseNoiseSpeed * 0.9;
        noiseAmount = baseNoiseAmount * 1.1;
        segmentLength = baseSegmentLength;
    } else if (realTimeOfDay.isDay) {
        // Day: most active
        noiseSpeed = baseNoiseSpeed * 1.2;
        noiseAmount = baseNoiseAmount * 0.8;
        segmentLength = baseSegmentLength * 0.9;
    } else if (realTimeOfDay.isDusk) {
        // Dusk: starting to slow down
        noiseSpeed = baseNoiseSpeed;
        noiseAmount = baseNoiseAmount;
        segmentLength = baseSegmentLength * 1.05;
    }
}

// Add these variables for time and state display
let timeStates = {
    NIGHT: 'Night 🌙',
    DAWN: 'Dawn 🌅',
    DAY: 'Day ☀️',
    DUSK: 'Dusk 🌆'
};

// Update the time display function to include state
function updateTimeDisplay() {
    let timeDisplay = document.getElementById('time-display');
    let stateDisplay = document.getElementById('time-state');
    
    if (timeDisplay && stateDisplay) {
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Update state based on time
        let state = '';
        if (hours >= 0 && hours < 6) {
            state = timeStates.NIGHT;
        } else if (hours >= 6 && hours < 9) {
            state = timeStates.DAWN;
        } else if (hours >= 9 && hours < 17) {
            state = timeStates.DAY;
        } else if (hours >= 17 && hours < 20) {
            state = timeStates.DUSK;
        } else {
            state = timeStates.NIGHT;
        }
        
        stateDisplay.textContent = state;
    }
}

// Add this variable at the top
let newSegmentWiggle = 0;
let wiggleDuration = 60;  // Number of frames to wiggle
let wiggleAmount = 15;    // How much to wiggle

// Add this variable to track intersection state
let isIntersecting = false;
let maxSegments = 100;  // Maximum number of segments allowed
let lastIntersectionTime = 0;  // Add this to track timing
let intersectionCooldown = 500;  // Add 500ms cooldown between intersections

// Add these variables at the top
let newSegmentColor = { r: 0, g: 0, b: 0 };
let isInspectingNew = false;
let inspectionTimer = 0;
let inspectionDuration = 180; // How long to inspect
let inspectionTarget = null;
let lastNewSegmentIndex = -1;

// Remove or modify the updateGrowth function to do nothing
function updateGrowth() {
    // Empty function - no more growth
    return;
}

// Modify checkSelfIntersection to just return false since we don't need it anymore
function checkSelfIntersection() {
    return false;
}

// Add this function to update the environment display
function updateEnvironmentDisplay() {
    let dayPhaseElement = document.getElementById('day-phase');
    let activityElement = document.getElementById('activity-level');
    
    if (dayPhaseElement && activityElement) {
        // Update day phase
        let phase = '';
        if (realTimeOfDay.isNight) phase = '🌙 Night';
        else if (realTimeOfDay.isDawn) phase = '🌅 Dawn';
        else if (realTimeOfDay.isDay) phase = '☀️ Day';
        else if (realTimeOfDay.isDusk) phase = '🌆 Dusk';
        dayPhaseElement.textContent = phase;
        
        // Update activity level based on dayNightCycle.activityLevel
        let activity = '';
        if (dayNightCycle.activityLevel < 0.5) activity = 'Low';
        else if (dayNightCycle.activityLevel < 1.0) activity = 'Medium';
        else activity = 'High';
        activityElement.textContent = activity;
    }
}

// Add function to create spectacular intersection effects
function createIntersectionEffect(x, y) {
    // Create expanding ring
    intersectionEffects.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: segmentLength * 4,
        life: 1.0,
        type: 'ring'
    });
    
    // Create particles
    for (let i = 0; i < 15; i++) {
        let angle = random(TWO_PI);
        let speed = random(3, 10);
        intersectionEffects.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            life: 1.0,
            type: 'particle',
            color: random([PALETTE.jade, PALETTE.sand, PALETTE.pearl]),
            size: random(5, 15)
        });
    }
}

// Add function to play intersection sound
function playIntersectionSound() {
    if (!soundEnabled || !audioStarted) return;
    
    let now = millis();
    if (now - lastIntersectionSound > minIntersectionSoundInterval) {
        // Random harmonic frequency
        let baseFreq = random([220, 330, 440, 550]);
        intersectionSound.triggerAttackRelease(baseFreq, "16n");
        lastIntersectionSound = now;
    }
}

// Add function to update and draw intersection effects
function updateIntersectionEffects() {
    for (let i = intersectionEffects.length - 1; i >= 0; i--) {
        let effect = intersectionEffects[i];
        
        if (effect.type === 'ring') {
            // Update and draw expanding ring
            effect.radius += (effect.maxRadius - effect.radius) * 0.1;
            effect.life *= 0.95;
            
            push();
            noFill();
            strokeWeight(2);
            stroke(255, 255, 255, effect.life * 255);
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = `rgba(255, 255, 255, ${effect.life})`;
            circle(effect.x, effect.y, effect.radius * 2);
            pop();
            
        } else if (effect.type === 'particle') {
            // Update particle position with gravity and drift
            effect.x += effect.vx;
            effect.vy += 0.2; // gravity
            effect.y += effect.vy;
            effect.life *= 0.96;
            
            // Draw particle with glow
            push();
            noStroke();
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.life})`;
            fill(effect.color.r, effect.color.g, effect.color.b, effect.life * 255);
            circle(effect.x, effect.y, effect.size * effect.life);
            pop();
        }
        
        // Remove dead effects
        if (effect.life < 0.01) {
            intersectionEffects.splice(i, 1);
        }
    }
}

// Add Ouroboros effect creation
function createOuroborosEffect(x, y) {
    isOuroboros = true;
    ouroborosTimer = ouroborosDuration;
    
    // Create circular mandala effect
    for (let i = 0; i < 36; i++) {
        let angle = (i / 36) * TWO_PI;
        let radius = segmentLength * 4;
        ouroborosEffects.push({
            x: x + cos(angle) * radius,
            y: y + sin(angle) * radius,
            angle: angle,
            radius: radius,
            life: 1.0,
            color: random([PALETTE.jade, PALETTE.sand, PALETTE.pearl, PALETTE.deepTeal])
        });
    }
    
    // Play mystical chord
    if (soundEnabled && audioStarted && millis() - lastOuroborosSound > 1000) {
        ouroborosSound.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '2n');
        lastOuroborosSound = millis();
    }
}

// Add Ouroboros effect update and draw
function updateOuroborosEffects() {
    if (!isOuroboros) return;
    
    // Update timer
    if (ouroborosTimer > 0) {
        ouroborosTimer--;
    } else {
        isOuroboros = false;
        ouroborosEffects = [];
        return;
    }
    
    // Draw mandala effect
    push();
    blendMode(SCREEN);
    
    for (let effect of ouroborosEffects) {
        // Update position with spiral motion
        effect.angle += 0.01;
        effect.radius *= 0.995;
        
        let x = effect.x + cos(effect.angle) * 2;
        let y = effect.y + sin(effect.angle) * 2;
        
        // Draw glowing symbol
        noStroke();
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.life})`;
        
        fill(effect.color.r, effect.color.g, effect.color.b, effect.life * 255);
        circle(x, y, 10 * effect.life);
        
        // Draw connecting lines
        stroke(effect.color.r, effect.color.g, effect.color.b, effect.life * 100);
        strokeWeight(1);
        line(x, y, segments[0].x, segments[0].y);
        
        effect.life *= 0.995;
    }
    
    pop();
}
