# Sentient Squiggle

An interactive digital organism that evolves and responds to its environment. The organism grows through self-intersection and exhibits complex behaviors based on time of day.

## Features

### Growth & Behavior
- Grows by creating new segments when intersecting with itself
- Maximum of 100 segments
- Inspects new segments with curious behavior
- Changes behavior based on time of day:
  - Night (00:00-06:00): Slower, more meandering movement
  - Dawn (06:00-09:00): Gradual awakening
  - Day (09:00-17:00): Most active
  - Dusk (17:00-20:00): Slowing down

### Visual Elements
- Dynamic segment coloring
- Glowing effects
- Inspection behavior when new segments form
- Real-time segment counter
- Time and state display

### Controls
- SPACE: Toggle sound
- R: Start recording
- S: Stop recording
- Mouse: Influence field movement

### Interface
- Control panel showing:
  - Sound status
  - Current time and state
  - Segment count (current/maximum)
  - Sound profile
  - Recording status

## Technical Details
- Built with p5.js
- Real-time audio synthesis
- Video recording capabilities
- Adaptive movement system
- Time-based state management

## Installation
1. Clone the repository
2. Open index.html in a web browser
3. Allow audio if you want sound features

## Credits
Adapted from the Processing follow3 example
http://processing.org/learning/topics/follow3.html

## License
[Your chosen license] 