import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                       border border-cyan-500/30 bg-black/40 text-cyan-400 hover:bg-cyan-500/10
                       light-mode:border-[#D6C5B4] light-mode:bg-white light-mode:text-[#4A3F35] light-mode:hover:bg-[#F3E8DA]"
            style={{
                // Using inline styles to ensure it renders correctly even outside strict light-mode specificity
                backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(0,0,0,0.4)',
                borderColor: theme === 'light' ? '#D6C5B4' : 'rgba(6, 182, 212, 0.3)',
                color: theme === 'light' ? '#4A3F35' : 'rgb(34, 211, 238)',
                boxShadow: theme === 'light' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Light</span>
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Dark</span>
                </>
            )}
        </button>
    );
};

export default ThemeToggle;
