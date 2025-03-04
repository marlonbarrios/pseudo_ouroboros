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
let soundIconText = "Press SPACE to enable sound";
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
	createCanvas(windowWidth, windowHeight);
	
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
}

function draw() {
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
	
	// Draw the snake
	noFill();
	
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
	
	// Draw colored body
	strokeWeight(28);
	strokeCap(ROUND); 
	
	if (mouseIsPressed) {
		stroke(224, 130, 133);
	} else {
		let r, g, b;
		if (isResting) {
			// More relaxed colors when resting
			r = map(sin(frameCount * 0.02), -1, 1, 160, 200);
			g = map(sin(frameCount * 0.02), -1, 1, 15, 30);
			b = map(sin(frameCount * 0.02), -1, 1, 20, 40);
		} else {
			// Original color code
			r = map(speedMultiplier, 0.1, 3, 180, 255);
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
		// Draw sound status text with better visibility
		textSize(20);
		textAlign(LEFT);
		
		// Draw text shadow/outline for better contrast
		noStroke();
		fill(255);
		text(soundIconText, 21, height - 19);
		text(soundIconText, 19, height - 21);
		text(soundIconText, 21, height - 21);
		text(soundIconText, 19, height - 19);
		
		// Draw main text
		fill(0);
		text(soundIconText, 20, height - 20);
		
		// Add small indicator dot
		noStroke();
		fill(soundEnabled ? color(0, 255, 0) : color(255, 0, 0));
		ellipse(10, height - 24, 8, 8);
		
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
	soundIconText = "SOUND ON - Press SPACE to toggle";
	console.log('Sound started');
	
	// Start drone sounds
	droneOsc1.amp(0.15, 1);
	droneOsc2.amp(0.1, 1);
}

function stopSound() {
	osc.amp(0, 0.1);
	audioStarted = false;
	soundIconText = "SOUND OFF - Press SPACE to toggle";
	console.log('Sound stopped');
	
	// Stop drone sounds
	droneOsc1.amp(0, 0.5);
	droneOsc2.amp(0, 0.5);
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