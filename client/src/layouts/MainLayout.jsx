import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full" />
      </div>

      <Navbar />

      <main className="flex-grow z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
