// Adapted from the following Processing example:
// http://processing.org/learning/topics/follow3.html

// The amount of points in the path
let points = 25;

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
let edgeGlowDistance = 150;  // Distance from edge to start glowing

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
let metabolicRate = 0.01;  // Increased rate
let maxNutrients = 300;    // More particles
let reabsorptionRadius = 100; // Larger radius

// Add these variables at the top
let foldingNutrients = false;
let foldTarget = null;
let foldProgress = 0;
let foldDuration = 100;
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
}

function draw() {
	try {
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
		
		background(240);
		
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
					// Enhanced sniffing behavior
					sniffingIntensity = lerp(sniffingIntensity, 1, 0.1);
					sniffingFrequency = map(speedMultiplier, 0.5, 1.2, 0.15, 0.3);
					sniffingPhase += sniffingFrequency;
					
					// Create more organic sniffing pattern
					let baseSniff = sin(sniffingPhase) * cos(sniffingPhase * 0.7);
					let secondarySniff = sin(sniffingPhase * 1.3) * 0.5;
					let sniffX = (baseSniff + secondarySniff) * 40 * sniffingIntensity;
					let sniffY = (cos(sniffingPhase * 0.8) * sin(sniffingPhase * 1.2)) * 30 * sniffingIntensity;
					
					// Add random "interest points" that attract the sniffing
					if (!lastSniffPoint || random(1) < 0.02) {
						lastSniffPoint = createVector(
							random(-50, 50),
							random(-50, 50)
						);
					}
					
					// Blend regular sniffing with interest point investigation
					sniffX = lerp(sniffX, lastSniffPoint.x, 0.2);
					sniffY = lerp(sniffY, lastSniffPoint.y, 0.2);
					
					// Apply enhanced sniffing to edge movement
					if (edgePoint.x < 100) {  // Left edge
						edgePoint.y += edgeDirection * 2;
						targetX = 50 + sniffX;
						targetY = edgePoint.y + sniffY;
					} else if (edgePoint.x > width - 100) {  // Right edge
						edgePoint.y += edgeDirection * 2;
						targetX = width - 50 + sniffX;
						targetY = edgePoint.y + sniffY;
					} else if (edgePoint.y < 100) {  // Top edge
						edgePoint.x += edgeDirection * 2;
						targetX = edgePoint.x + sniffX;
						targetY = 50 + sniffY;
					} else {  // Bottom edge
						edgePoint.x += edgeDirection * 2;
						targetX = edgePoint.x + sniffX;
						targetY = height - 50 + sniffY;
					}
					
					// Make sniffing sounds
					if (frameCount > sniffingSoundTimer && soundEnabled) {
						let sniffSpeed = abs(sniffX) + abs(sniffY);
						if (sniffSpeed > 5) {
							makeSniffingSound(sniffSpeed);
							sniffingSoundTimer = frameCount + 10;  // Adjust timing between sniffs
						}
					}
					
					// Keep within bounds
					edgePoint.x = constrain(edgePoint.x, 50, width - 50);
					edgePoint.y = constrain(edgePoint.y, 50, height - 50);
					
					// Occasionally change direction
					if (random(1) < 0.005) {
						edgeDirection *= -1;
					}
					
					// Adjust speed for edge exploration
					speedMultiplier = map(sin(frameCount * 0.05), -1, 1, 0.5, 1.2);
					
					edgeTimer--;
					if (edgeTimer <= 0) {
						edgeExploring = false;
						changeDirectionTime = frameCount;  // Trigger new direction
					}
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
		let head = segments[0];
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
			let head = segments[0];
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
				size: random(6, 12),  // Larger size
				opacity: random(0.7, 1.0),  // Higher opacity
				color: color(200 + random(-20, 20), 
						220 + random(-20, 20), 
						255, 
						255)  // Brighter color
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
	
	// Louder initial sounds
	droneOsc1.amp(0.3, 1);    // Higher drone volumes
	droneOsc2.amp(0.2, 1);
	
	osc.freq(200);
	osc.amp(0.6, 0.1);        // Louder test sound
	
	audioStarted = true;
	// Update sound indicator
	document.getElementById('sound-dot').style.color = 'green';
	document.getElementById('sound-text').innerText = 'ON';
	console.log('Sound started');
	
	// Start drone sounds
	droneOsc1.amp(0.15, 1);
	droneOsc2.amp(0.1, 1);
	
	clickOsc.start();
	clickOsc.amp(0);
	
	squeakOsc.start();
	squeakOsc.amp(0);
}

function stopSound() {
	osc.amp(0, 0.1);
	audioStarted = false;
	// Update sound indicator
	document.getElementById('sound-dot').style.color = 'red';
	document.getElementById('sound-text').innerText = 'OFF';
	console.log('Sound stopped');
	
	// Stop drone sounds
	droneOsc1.amp(0, 0.5);
	droneOsc2.amp(0, 0.5);
	
	clickOsc.amp(0);
	
	squeakOsc.amp(0);
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
	for (let item of nutrientCluster) {
		if (item && item.nutrient) {
			totalEnergy += item.nutrient.opacity;
			let index = nutrients.indexOf(item.nutrient);
			if (index > -1) {
				nutrients.splice(index, 1);
			}
		}
	}
	
	digestingTimer = 100;
	headGlow = min(headGlow + totalEnergy, maxGlow * 2);
	
	foldingNutrients = false;
	nutrientCluster = [];
	foldTarget = null;
}

function updateFoldingAnimation() {
	for (let item of nutrientCluster) {
		let easeAmount = easeInOutCubic(foldProgress);
		item.nutrient.x = lerp(item.startPos.x, item.endPos.x, easeAmount);
		item.nutrient.y = lerp(item.startPos.y, item.endPos.y, easeAmount);
		
		// Add folding effects
		let spiral = createVector(
			cos(foldProgress * TWO_PI * 2) * (1 - foldProgress) * 20,
			sin(foldProgress * TWO_PI * 2) * (1 - foldProgress) * 20
		);
		item.nutrient.x += spiral.x;
		item.nutrient.y += spiral.y;
		
		// Increase glow during folding
		item.nutrient.opacity = lerp(item.nutrient.opacity, 1, 0.1);
		item.nutrient.size = lerp(item.nutrient.size, 
								item.nutrient.size * 1.5, 
								easeAmount);
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