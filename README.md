# Jolly-Ops Website

A Next.js application visualizing global operations with a 3D Earth animation using Three.js.

## Features

- Interactive 3D Earth visualization
- Real-time data flow animations
- Responsive design
- Built with Next.js, React Three Fiber, and TypeScript

## Technologies Used

- Next.js 14
- React 18
- Three.js
- React Three Fiber (@react-three/fiber)
- React Three Drei (@react-three/drei)
- TypeScript
- Tailwind CSS

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

When you push changes to the `main` branch, the GitHub Actions workflow will:
1. Build the Next.js application
2. Export static files
3. Deploy to GitHub Pages

You can also manually trigger a deployment from the Actions tab in your GitHub repository.

### Manual Deployment

To manually build for GitHub Pages:

```bash
npm run deploy
```

This will create a static export in the `out` directory with the proper configuration for GitHub Pages.

## Project Structure

- `/src/components` - React components including the 3D Earth visualization
- `/src/app` - Next.js app router pages and layouts
- `/public` - Static assets

## Credits

This project is a Next.js migration of the original Jolly-Ops React application.
