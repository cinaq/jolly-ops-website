# Jolly-Ops Earth Visualization

A React application that visualizes a rotating Earth with data flowing around it like fiber optics.

## Overview

This project creates an interactive 3D visualization of Earth using React, Three.js, React Three Fiber, and Drei. It features a realistic Earth model with cloud layers and animated data flows that resemble fiber optic connections spanning across the globe.

## Features

- Realistic 3D Earth with texture maps for color, normal mapping, and specular highlights
- Cloud layer that rotates independently from the Earth
- Dynamic data flow visualization with glowing fiber optic-like connections
- Interactive camera controls for zooming and rotating around the Earth
- Starfield background for a space-like atmosphere
- Subtle atmospheric glow effect

## Technologies Used

- React.js
- Three.js - 3D rendering library
- React Three Fiber - React renderer for Three.js
- Drei - Useful helpers for React Three Fiber
- Modern JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/jolly-ops-website.git
cd jolly-ops-website
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment

To build the project for production:

```
npm run build
```

The build files will be created in the `build` directory and can be deployed to any static hosting service like GitHub Pages, Netlify, or Vercel.

## Customization

You can customize various aspects of the visualization:

- Adjust the number of data flows by changing the `count` prop in the `DataFlow` component
- Modify the Earth's rotation speed in the `useFrame` hook
- Change the colors of the data flows by adjusting the color parameters
- Add additional 3D elements to enhance the visualization

## License

This project is open source and available under the MIT License. 