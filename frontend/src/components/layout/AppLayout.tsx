import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ServiceStatus } from './ServiceStatus';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col relative selection:bg-primary selection:text-black">
      {/* Futuristic Background Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-gradient pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

      {/* Sticky Navigation Bar */}
      <Navbar />
      <ServiceStatus />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Platform Footer */}
      <Footer />
    </div>
  );
};
