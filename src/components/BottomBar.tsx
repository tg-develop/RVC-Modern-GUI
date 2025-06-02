import React, { useContext, JSX } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

// Assuming ModalContentProps might not be needed here, but openModal type is generic
interface ModalContentProps { 
    modelId?: string;
    modelName?: string;
}

interface BottomBarProps {
  openModal: (type: string, props?: ModalContentProps) => void; // Added openModal prop
}

function BottomBar({ openModal }: BottomBarProps): JSX.Element {
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    throw new Error("BottomBar must be used within a ThemeProvider");
  }
  const { theme, toggleTheme } = themeContext;

  const buttonBaseClass = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";
  const lightButtonClass = "text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-blue-500";
  
  const startButtonClass = "text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 focus:ring-green-500 flex items-center space-x-2";
  const stopButtonClass = "text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500 flex items-center space-x-2";
  
  return (
    <div className="h-20 min-h-[60px] bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 py-2 flex-shrink-0 transition-colors duration-300">
      <div className="flex space-x-2">
        <button onClick={() => openModal('mergeLab')} className={`${buttonBaseClass} ${lightButtonClass}`}>Merge Lab</button>
        <button onClick={() => openModal('advancedSettings')} className={`${buttonBaseClass} ${lightButtonClass}`}>Advanced Settings</button>
      </div>
      <div className="flex space-x-3">
        <button className={`${buttonBaseClass} ${startButtonClass}`}>
          <FontAwesomeIcon icon={faPlay} className="h-4 w-4" /> 
          <span>Start</span>
        </button>
        <button className={`${buttonBaseClass} ${stopButtonClass}`}>
          <FontAwesomeIcon icon={faStop} className="h-4 w-4" />
          <span>Stop</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => openModal('serverInfo')} className={`${buttonBaseClass} ${lightButtonClass}`}>Server Info</button>
        <button onClick={() => openModal('clientInfo')} className={`${buttonBaseClass} ${lightButtonClass}`}>Client Info</button>
        <button 
          onClick={toggleTheme}
          className={`${buttonBaseClass} ${lightButtonClass} w-10 h-10 flex items-center justify-center`}
          aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default BottomBar; 