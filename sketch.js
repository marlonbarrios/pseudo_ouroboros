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
	} else if (key.toLowerCase() === 'v') {
        // --- THIS IS THE NEW CODE TO TOGGLE THE CONTROLS ---

        // Find the control panel element in your HTML document.
        // This assumes your HTML has an element with id="control-panel"
        const controlPanel = document.getElementById('control-panel');
        
        if (controlPanel) {
            // Check its current visibility and flip it.
            if (controlPanel.style.display === 'none') {
                // If it's hidden, show it. 'flex' is a good default for a panel.
                controlPanel.style.display = 'flex'; 
            } else {
                // If it's visible, hide it.
                controlPanel.style.display = 'none';
            }
        }
    }
}
