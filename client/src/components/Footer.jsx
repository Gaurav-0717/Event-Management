import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/40 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>EventWise — AI-Powered Event Planning & Budget Optimization</span>
        </div>
        <div>
          <span>Architecture Milestone: Clean Scaffolding & Health Registry</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
