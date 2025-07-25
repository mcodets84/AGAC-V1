
import React from 'react';
import { APP_TITLE, APP_SUBTITLE } from '../constants';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Theme } from '../App'; // Import Theme type

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="gradient-bg py-6 text-white shadow-lg relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-center flex-grow">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{APP_TITLE}</h1>
          <p className="text-md sm:text-lg opacity-90 mt-1">{APP_SUBTITLE}</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
          aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-6 w-6 text-yellow-300" />
          ) : (
            <MoonIcon className="h-6 w-6 text-slate-800" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
