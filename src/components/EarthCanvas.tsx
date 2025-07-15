'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const EarthCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation variables
    let rotation = 0;
    const rotationSpeed = 0.0015; // Slow rotation for realistic feel
    let earthRadius = Math.min(canvas.width, canvas.height) * 0.28;
    
    // Simplified approach - use a single Earth texture
    const earthImage = new Image();
    earthImage.crossOrigin = "Anonymous";
    earthImage.src = '/earth-texture.jpg'; // Use a local image instead
    
    // Clouds texture
    const cloudsImage = new Image();
    cloudsImage.crossOrigin = "Anonymous";
    cloudsImage.src = '/clouds-texture.jpg'; // Use a local image instead
    
    // Track loading progress
    let loadedImages = 0;
    const totalImages = 2;
    
    const updateLoadingProgress = () => {
      loadedImages++;
      setLoadingProgress(Math.round((loadedImages / totalImages) * 100));
      if (loadedImages === totalImages) {
        setTimeout(() => setLoading(false), 500); // Short delay for smooth transition
      }
    };
    
    // Set up load handlers
    earthImage.onload = updateLoadingProgress;
    cloudsImage.onload = updateLoadingProgress;
    
    // Set a timeout to ensure loading doesn't get stuck
    const loadTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, continuing with animation');
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout
    
    // Fiber lines data
    const fiberLines: FiberLine[] = [];
    
    // Create fiber lines
    const createFiberLines = () => {
      // More fiber lines for a denser network effect
      for (let i = 0; i < 80; i++) {
        fiberLines.push({
          startAngle: Math.random() * Math.PI * 2,
          startLat: (Math.random() - 0.5) * Math.PI,
          endAngle: Math.random() * Math.PI * 2,
          endLat: (Math.random() - 0.5) * Math.PI,
          progress: Math.random(), // Start at random positions
          speed: 0.003 + Math.random() * 0.008,
          width: 0.8 + Math.random() * 1.5,
          color: `hsla(${180 + Math.random() * 60}, 100%, ${65 + Math.random() * 15}%, ${0.6 + Math.random() * 0.3})`,
          length: 0.2 + Math.random() * 0.5,
          pulse: Math.random() * Math.PI * 2 // Phase for pulsing effect
        });
      }
    };
    
    createFiberLines();
    
    // Shooting star data
    let shootingStar = createShootingStar();
    
    // Create a new shooting star with random properties
    function createShootingStar() {
      const width = canvas?.width || window.innerWidth;
      const height = canvas?.height || window.innerHeight;
      
      return {
        x: Math.random() * width,
        y: Math.random() * height * 0.5, // Upper half of the screen
        length: 50 + Math.random() * 80,
        angle: Math.PI / 4 + Math.random() * Math.PI / 2, // Angle between PI/4 and 3PI/4
        speed: 5 + Math.random() * 10,
        size: 2 + Math.random() * 2,
        active: false,
        progress: 0,
        lifetime: 1 + Math.random() * 1.5, // 1-2.5 seconds
        delay: Math.random() * 15 + 5 // 5-20 seconds delay before next shooting star
      };
    }
    
    // Convert 3D spherical coordinates to 2D canvas coordinates
    const projectToCanvas = (lat: number, lng: number, radius: number) => {
      const x = Math.cos(lat) * Math.sin(lng + rotation);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lng + rotation);
      
      // Only show points on the front half of the sphere
      if (z < 0) return null;
      
      // Project 3D coordinates to 2D
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const projectedX = centerX + x * radius;
      const projectedY = centerY - y * radius;
      
      // Return z for depth information (used for opacity)
      return { x: projectedX, y: projectedY, z };
    };
    
    // Draw a great circle arc between two points on the sphere
    const drawArc = (
      startLat: number, 
      startLng: number, 
      endLat: number, 
      endLng: number, 
      progress: number, 
      color: string, 
      width: number,
      length: number,
      pulse: number
    ) => {
      const steps = 30;
      const points = [];
      
      // Calculate points along the great circle
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        
        // Spherical linear interpolation
        const lat = startLat + t * (endLat - startLat);
        const lng = startLng + t * (endLng - startLng);
        
        const point = projectToCanvas(lat, lng, earthRadius);
        if (point) points.push(point);
      }
      
      if (points.length < 2) return;
      
      // Calculate which portion of the arc to draw based on progress
      const startIndex = Math.max(0, Math.floor((progress - length) * points.length));
      const endIndex = Math.min(points.length - 1, Math.floor(progress * points.length));
      
      if (startIndex >= endIndex) return;
      
      // Draw the visible portion of the arc with gradient
      const gradient = ctx.createLinearGradient(
        points[startIndex].x, points[startIndex].y, 
        points[endIndex].x, points[endIndex].y
      );
      
      // Create pulsing effect
      const pulseIntensity = Math.sin(Date.now() * 0.002 + pulse) * 0.2 + 0.8;
      
      // Extract base color and modify it for gradient
      const baseColor = color.substring(0, color.lastIndexOf(','));
      gradient.addColorStop(0, `${baseColor}, ${0.1 * pulseIntensity})`);
      gradient.addColorStop(0.5, `${baseColor}, ${0.9 * pulseIntensity})`);
      gradient.addColorStop(1, `${baseColor}, ${0.1 * pulseIntensity})`);
      
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      
      for (let i = startIndex + 1; i <= endIndex; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Add glow effect
      ctx.beginPath();
      ctx.moveTo(points[startIndex].x, points[startIndex].y);
      
      for (let i = startIndex + 1; i <= endIndex; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.strokeStyle = `${baseColor}, ${0.2 * pulseIntensity})`;
      ctx.lineWidth = width * 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Add data point at the leading edge
      const leadPoint = points[endIndex];
      if (leadPoint) {
        ctx.beginPath();
        ctx.arc(leadPoint.x, leadPoint.y, width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}, ${0.8 * pulseIntensity})`;
        ctx.fill();
      }
    };
    
    // Draw the earth
    const drawEarth = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Update earth radius based on canvas size
      earthRadius = Math.min(canvas.width, canvas.height) * 0.28;
      
      // Create a temporary canvas for texture mapping
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = 2048;
      tempCanvas.height = 1024;
      
      // Draw the earth texture to the temporary canvas
      if (earthImage.complete && earthImage.naturalWidth > 0) {
        tempCtx.drawImage(earthImage, 0, 0, tempCanvas.width, tempCanvas.height);
      } else {
        // Draw a placeholder if image isn't loaded
        tempCtx.fillStyle = '#1a2e4a';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw simple continents
        tempCtx.fillStyle = '#2a4e6a';
        tempCtx.beginPath();
        tempCtx.ellipse(500, 400, 300, 200, 0, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.beginPath();
        tempCtx.ellipse(1200, 500, 400, 250, 0, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.beginPath();
        tempCtx.ellipse(1600, 300, 200, 150, 0, 0, Math.PI * 2);
        tempCtx.fill();
      }
      
      // Draw the base sphere
      ctx.save();
      
      // Draw the Earth with texture mapping
      for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += Math.PI/90) {
        for (let lng = -Math.PI; lng <= Math.PI; lng += Math.PI/90) {
          const point = projectToCanvas(lat, lng, earthRadius);
          if (!point) continue;
          
          // Calculate texture coordinates
          const u = (lng + Math.PI) / (2 * Math.PI);
          const v = (Math.PI/2 - lat) / Math.PI;
          
          // Sample the texture
          const x = Math.floor(u * tempCanvas.width);
          const y = Math.floor(v * tempCanvas.height);
          
          if (x >= 0 && x < tempCanvas.width && y >= 0 && y < tempCanvas.height) {
            // Apply lighting based on surface normal
            const normal = {
              x: Math.cos(lat) * Math.sin(lng + rotation),
              y: Math.sin(lat),
              z: Math.cos(lat) * Math.cos(lng + rotation)
            };
            
            // Light direction (from top-right)
            const lightDir = { x: 0.5, y: -0.2, z: 0.8 };
            const lightLength = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
            const normalizedLight = {
              x: lightDir.x / lightLength,
              y: lightDir.y / lightLength,
              z: lightDir.z / lightLength
            };
            
            // Calculate diffuse lighting
            const dot = normal.x * normalizedLight.x + normal.y * normalizedLight.y + normal.z * normalizedLight.z;
            const diffuse = Math.max(0.3, dot); // Ambient + diffuse
            
            // Get pixel color from texture
            const pixelData = tempCtx.getImageData(x, y, 1, 1).data;
            
            // Apply lighting
            const r = Math.min(255, pixelData[0] * diffuse);
            const g = Math.min(255, pixelData[1] * diffuse);
            const b = Math.min(255, pixelData[2] * diffuse);
            
            // Draw pixel
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(point.x, point.y, 1, 1);
          }
        }
      }
      
      ctx.restore();
      
      // Draw clouds layer
      if (cloudsImage.complete && cloudsImage.naturalWidth > 0) {
        const cloudRotation = rotation * 1.2; // Clouds rotate slightly faster
        
        // Create a temporary canvas for cloud texture
        const cloudCanvas = document.createElement('canvas');
        const cloudCtx = cloudCanvas.getContext('2d');
        if (!cloudCtx) return;
        
        cloudCanvas.width = 1024;
        cloudCanvas.height = 512;
        cloudCtx.drawImage(cloudsImage, 0, 0, cloudCanvas.width, cloudCanvas.height);
        
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += Math.PI/45) {
          for (let lng = -Math.PI; lng <= Math.PI; lng += Math.PI/45) {
            const point = projectToCanvas(lat, lng, earthRadius * 1.01);
            if (!point) continue;
            
            // Calculate texture coordinates for clouds
            const u = ((lng + cloudRotation) % (2 * Math.PI) + Math.PI) / (2 * Math.PI);
            const v = (Math.PI/2 - lat) / Math.PI;
            
            const x = Math.floor(u * cloudCanvas.width);
            const y = Math.floor(v * cloudCanvas.height);
            
            if (x >= 0 && x < cloudCanvas.width && y >= 0 && y < cloudCanvas.height) {
              const pixelData = cloudCtx.getImageData(x, y, 1, 1).data;
              if (pixelData[0] > 50) { // Only draw visible clouds
                const brightness = pixelData[0] / 255;
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.7})`;
                ctx.fillRect(point.x, point.y, 1, 1);
              }
            }
          }
        }
        
        ctx.restore();
      }
      
      // Draw atmosphere glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, earthRadius,
        centerX, centerY, earthRadius * 1.2
      );
      gradient.addColorStop(0, 'rgba(70, 120, 200, 0.3)');
      gradient.addColorStop(1, 'rgba(70, 120, 200, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };
    
    // Draw fiber optic lines
    const drawFiberLines = () => {
      fiberLines.forEach(line => {
        drawArc(
          line.startLat,
          line.startAngle,
          line.endLat,
          line.endAngle,
          line.progress,
          line.color,
          line.width,
          line.length,
          line.pulse
        );
        
        // Update progress
        line.progress += line.speed;
        if (line.progress > 1 + line.length) {
          line.progress = 0;
          // Randomize endpoints for variety
          line.startAngle = Math.random() * Math.PI * 2;
          line.endAngle = Math.random() * Math.PI * 2;
          line.startLat = (Math.random() - 0.5) * Math.PI;
          line.endLat = (Math.random() - 0.5) * Math.PI;
        }
      });
    };
    
    // Draw stars in the background
    const drawStars = (timestamp: number) => {
      // Create a starfield
      
      // Generate fixed star positions based on a seed
      const seed = 12345;
      const random = (n: number) => {
        return ((seed * n) % 10000) / 10000;
      };
      
      for (let i = 0; i < 300; i++) {
        const x = random(i * 3) * canvas.width;
        const y = random(i * 3 + 1) * canvas.height;
        const radius = random(i * 3 + 2) * 1.5;
        
        // Very slow twinkling effect
        const twinkleSpeed = 0.0002;
        const opacity = 0.2 + Math.sin(timestamp * twinkleSpeed + i) * 0.15 + 0.65;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }
      
      // Add a few larger, twinkling stars
      for (let i = 0; i < 20; i++) {
        const x = random(i * 7 + 1000) * canvas.width;
        const y = random(i * 7 + 1001) * canvas.height;
        const radius = 1 + random(i * 7 + 1002) * 1.5;
        
        // Slower twinkling
        const twinkleSpeed = 0.0003;
        const opacity = (Math.sin(timestamp * twinkleSpeed + i * 5) * 0.3 + 0.7);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };
    
    // Draw shooting star
    const drawShootingStar = () => {
      // Check if we should activate a shooting star
      if (!shootingStar.active && Math.random() < 0.005) {
        shootingStar.active = true;
        shootingStar.progress = 0;
      }
      
      // Draw and update active shooting star
      if (shootingStar.active) {
        const progress = shootingStar.progress;
        
        if (progress >= 1) {
          // Reset shooting star
          shootingStar.active = false;
          shootingStar = createShootingStar();
          return;
        }
        
        // Calculate current position
        const x = shootingStar.x + Math.cos(shootingStar.angle) * shootingStar.speed * progress * 60;
        const y = shootingStar.y + Math.sin(shootingStar.angle) * shootingStar.speed * progress * 60;
        
        // Calculate tail start
        const tailX = x - Math.cos(shootingStar.angle) * shootingStar.length * (1 - progress * 0.5);
        const tailY = y - Math.sin(shootingStar.angle) * shootingStar.length * (1 - progress * 0.5);
        
        // Draw the shooting star with gradient tail
        const gradient = ctx.createLinearGradient(tailX, tailY, x, y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = shootingStar.size;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw the head
        ctx.beginPath();
        ctx.arc(x, y, shootingStar.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(x, y, shootingStar.size * 4, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, shootingStar.size * 4);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Update progress
        shootingStar.progress += 0.01;
      }
    };
    
    // Animation loop
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000510');
      gradient.addColorStop(1, '#001030');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawStars(timestamp);
      drawShootingStar();
      drawEarth();
      drawFiberLines();
      
      // Rotate the earth
      rotation += rotationSpeed;
      
      requestAnimationFrame(animate);
    };
    
    // Display initial background
    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Start animation immediately, don't wait for textures
    requestAnimationFrame(animate);
    
    // Handle errors for image loading
    const handleImageError = (imageName: string) => {
      console.warn(`Error loading ${imageName} texture`);
      setError(`Could not load ${imageName} texture. Using simplified view.`);
      // Continue with animation anyway
    };
    
    earthImage.onerror = () => handleImageError('Earth');
    cloudsImage.onerror = () => handleImageError('Clouds');
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(loadTimeout);
    };
  }, []);
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-blue-950 z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">Loading Earth</h2>
            <div className="w-64 bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-blue-200">{loadingProgress}%</p>
            {error && (
              <p className="text-yellow-400 mt-4 max-w-md mx-auto">{error}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Attribution with Next.js Link */}
      <div className="absolute bottom-2 right-2 text-xs text-white/70 z-10">
        <p>
          Earth texture: {' '}
          <Link 
            href="https://commons.wikimedia.org/wiki/File:Earth_Western_Hemisphere_transparent_background.png" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/90 underline transition-colors"
          >
            Wikimedia Commons
          </Link>
          {' '} | Clouds: {' '}
          <Link 
            href="https://www.solarsystemscope.com/textures/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/90 underline transition-colors"
          >
            Solar System Scope
          </Link>
        </p>
      </div>
    </div>
  );
};

// Type definitions
interface FiberLine {
  startAngle: number;
  startLat: number;
  endAngle: number;
  endLat: number;
  progress: number;
  speed: number;
  width: number;
  color: string;
  length: number;
  pulse: number;
}

export default EarthCanvas; 