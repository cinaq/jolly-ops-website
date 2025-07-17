'use client';

import dynamic from 'next/dynamic';

// Dynamically import the EarthCanvas component with no SSR
const EarthCanvas = dynamic(() => import('@/components/EarthCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-xl font-bold text-white">Loading Earth...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="canvas-container absolute inset-0">
        <EarthCanvas />
      </div>
      <div className="flex-grow"></div>
      <div className="content relative z-10 text-center p-8 w-full mb-8">
        <h1 className="text-5xl font-bold mb-4 text-white shadow-text">Jolly-Ops</h1>
        <h2 className="text-2xl font-bold mb-4 text-white shadow-text">Where operations meet joy and fun</h2>
        <p className="text-xl max-w-lg mx-auto text-white shadow-text">
        Proudly hosted on <a href="https://low-ops.com" className="hover:underline" target="_blank" rel="noopener noreferrer">Low-Ops.com</a>
        </p>
      </div>
    </main>
  );
}
