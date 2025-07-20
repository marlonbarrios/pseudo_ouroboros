body, html {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #000;
}

/* Style for the control card panel */
#control-panel {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 20; /* Ensure it's above the canvas */
    background-color: rgba(0, 0, 0, 0.6);
    color: #f0f3f5;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-family: monospace;
    font-size: 14px;
    display: flex; /* Use flexbox for layout */
    gap: 25px;
}

.control-group h3 {
    margin-top: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 5px;
}

.status-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-left: 5px;
}

.status-off {
    background-color: #7b2d26; /* Rust color from your palette */
}

.status-on {
    background-color: #0b7a75; /* Jade color */
}

/* p5.js canvas styles from your code */
canvas {
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none; /* Allows clicking through canvas */
}
