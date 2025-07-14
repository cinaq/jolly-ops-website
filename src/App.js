import React from 'react';
import EarthCanvas from './components/EarthCanvas';

function App() {
  return (
    <div className="app">
      <div className="canvas-container">
        <EarthCanvas />
      </div>
      <div className="content">
        <h1>Jolly-Ops</h1>
        <p>Visualizing global operations with real-time data flows</p>
      </div>
    </div>
  );
}

export default App; 