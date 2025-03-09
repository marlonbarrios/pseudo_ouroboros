Created by **Marlon Barrios Solano**

# Pseudo Ouroboros: The Genesis of Self Interest in Gradient Descent

<img width="1479" alt="Screenshot 2025-03-09 at 4 31 52 PM" src="https://github.com/user-attachments/assets/72cc6de8-a554-4349-b71e-1b7c63be07a5" />

**Pseudo Ouroboros** is an experimental interactive generative art project that fuses intricate visual patterns with dynamic audio synthesis. Inspired by self-organizing systems and the iterative nature of gradient descent, this project simulates a snake-like organism that continuously evolves—mimicking the ancient symbol of eternal cyclic renewal, the Ouroboros.

---

## Overview

Pseudo Ouroboros explores the intersection of art, sound, and algorithmic evolution. The project features an autonomous, snake-like entity whose movement and aesthetics are influenced by:

- **Organic Movement:**  
  The creature’s path is generated using Perlin noise and autonomous algorithms, resulting in smooth, natural curves with behaviors like resting, edge exploration, and self-driven direction changes.

- **Dynamic Audio Synthesis:**  
  Leveraging p5.js and Tone.js (or the p5.js sound library), layered underwater and techno soundscapes are generated and modulated in real time based on the organism’s motion and internal state.

- **Evolution and Regeneration:**  
  Over time, the system “evolves” by increasing complexity, altering color palettes, and modulating sound, reflecting a continuous process of self-renewal without physical fragmentation.

- **Time-of-Day Influence:**  
  The creature adapts its behavior according to the time of day. Real-world day/night cycles affect its movement, color transitions, and audio effects, creating unique experiences during dawn, day, dusk, and night.

- **Interactive and Environmental Influences:**  
  User inputs (mouse movement, clicks, key presses) further shape the creature’s behavior, creating an immersive and ever-changing digital ecosystem.

<img width="1479" alt="Screenshot 2025-03-09 at 4 31 44 PM" src="https://github.com/user-attachments/assets/be29c878-9554-445a-8f7d-6a2c1dba5137" />

---

## Watch the Video

Check out the project video on YouTube:  
[https://youtu.be/58GtF1Lki5Y](https://youtu.be/58GtF1Lki5Y)

---

## Live Demo

Experience the project live at:  
[https://marlonbarrios.github.io/pseudo_ouroboros/](https://marlonbarrios.github.io/pseudo_ouroboros/)

<img width="1479" alt="Screenshot 2025-03-09 at 4 31 14 PM" src="https://github.com/user-attachments/assets/c6026d24-7806-4226-94c3-d335336845ce" />

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/pseudo-ouroboros.git

	2.	Navigate to the Project Folder:

cd pseudo-ouroboros


	3.	Dependencies:
	•	Include the p5.js library for graphics and interactivity.
	•	For advanced sound features, include Tone.js (or use the configured p5.js sound library).
	4.	Running the Project:
Open the index.html file in a modern web browser (e.g., Chrome or Firefox) that supports the Web Audio API.

<img width="1479" alt="Screenshot 2025-03-09 at 4 31 10 PM" src="https://github.com/user-attachments/assets/10a02524-2235-474d-9155-4237a17820f6" />


Usage
	•	Toggle Sound:
Press the SPACE key to enable or disable the sound synthesis.
	•	Recording:
Press R to start and S to stop recording a video of the canvas (with audio).
	•	Interact:
Move your mouse over the canvas to influence the organism’s movement or click to spawn particles and trigger evolution events.
	•	Observe:
Watch the evolving snake as it gracefully moves across the canvas, creating mesmerizing Ouroboros effects. Notice how its behavior—including movement dynamics, visual appearance, and audio effects—is influenced by the time of day, mirroring changes in real-world light and activity.

Code Structure
	•	Main Animation Loop:
The draw() function updates movement, renders visuals, manages the trail, and triggers audio effects.
	•	Audio Engine:
Functions such as setupAudio(), makeUnderwaterSound(), and updateDrone() dynamically generate and modulate audio based on the organism’s state.
	•	Evolution & Interaction:
Modules like evolveComplexity(), updateEvolution(), and various event handlers drive the evolving and interactive behavior.
	•	Visual Effects:
Custom functions manage the rendering of trails, glow effects, and the signature Ouroboros animation.
	•	Environmental Adaptation:
Real-time updates based on system time adjust background colors and behavior parameters, ensuring that the creature’s appearance and activity levels change with the time of day.

Attribution

Developed by Marlon Barrios Solano
For more projects and updates, visit: https://marlonbarrios.github.io/pseudo_ouroboros/

Contributing

Contributions to enhance and extend Pseudo Ouroboros are welcome!
	1.	Fork the repository.
	2.	Create your feature branch: git checkout -b feature/YourFeature.
	3.	Commit your changes: git commit -m 'Add some feature'.
	4.	Push to the branch: git push origin feature/YourFeature.
	5.	Open a Pull Request.

Please follow the existing coding style and document your changes.

License

This project is open-source and available under the MIT License.

Disclaimer

Pseudo Ouroboros is an experimental work of generative art. Its behavior arises from a blend of deterministic algorithms, noise functions, and user interactions. Enjoy the unpredictable evolution and the journey through self-interest in gradient descent!

