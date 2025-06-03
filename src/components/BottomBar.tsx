import React, { useContext, JSX, useState, useEffect } from 'react';
import { ThemeContext, useThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlay, faStop, faRightLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

// Mock Performance Context - Replace with actual import from PerformanceStatsCard or a shared context file
// This is for demonstration and to access performance.vol
interface PerformanceMetrics {
  vol: number;
  responseTime: number;
  mainprocessTime: number;
}
interface ServerSettings {
  serverReadChunkSize: number;
  crossFadeOverlapSize: number;
}
interface AppPerformanceContextType {
  performance: PerformanceMetrics;
  serverSetting: { serverSetting: ServerSettings };
}
const usePerformanceContext = (): AppPerformanceContextType => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>({
    vol: 0, // Initial vol to 0
    responseTime: 30,
    mainprocessTime: 12,
  });
  useEffect(() => { // Simulate volume changes for sound wave effect
    const interval = setInterval(() => {
      setPerformanceData(prev => ({ ...prev, vol: Math.random() }));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return { 
    performance: performanceData, 
    serverSetting: { serverSetting: { serverReadChunkSize: 64, crossFadeOverlapSize: 0.020 } }
  };
};
// End Mock Performance Context

// Assuming ModalContentProps might not be needed here, but openModal type is generic
interface ModalContentProps { 
    modelId?: string;
    modelName?: string;
    message?: string;
    type?: 'warning' | 'info' | 'error'; // For modal styling
    // Allow any other props your modal might need
    [key: string]: any; 
}

interface BottomBarProps {
  openModal: (type: string, props?: ModalContentProps) => void; // Added openModal prop
}

const INPUT_SENSITIVITY_THRESHOLD = 0.5; // Example threshold for sound wave

function BottomBar({ openModal }: BottomBarProps): JSX.Element {
  const themeContext = useThemeContext();
  const { performance } = usePerformanceContext(); // Consume performance context

  const { theme, toggleTheme } = themeContext;
  const [isClientActive, setIsClientActive] = useState(false);
  const [isPassthroughActive, setIsPassthroughActive] = useState(false);

  const handleToggleClientActivity = () => {
    setIsClientActive(prev => !prev);
    console.log(isClientActive ? "Requesting to stop client" : "Requesting to start client");
  };

  const handleTogglePassthrough = () => {
    console.log("[BottomBar] handleTogglePassthrough called. isPassthroughActive:", isPassthroughActive);
    if (!isPassthroughActive) {
      // Request to activate passthrough: Show confirmation modal
      openModal('passThrough', {
        title: "Activate Passthrough?",
        message: "Activating passthrough will output your input voice directly without any changes.",
        icon: faTriangleExclamation,
        iconClassName: "text-yellow-500 w-12 h-12 mx-auto mb-4", // Example styling for icon in modal
        confirmText: "Activate Passthrough",
        cancelText: "Cancel",
        onConfirm: () => {
          console.log("[BottomBar] Passthrough confirmed via modal.");
          setIsPassthroughActive(true);
          // Add actual passthrough *activation* logic here (e.g., API call, global state update)
        },
        onCancel: () => {
          console.log("[BottomBar] Passthrough activation cancelled via modal.");
        }
      });
    } else {
      // Request to deactivate passthrough: Deactivate directly
      console.log("[BottomBar] Deactivating passthrough directly.");
      setIsPassthroughActive(false);
      // Add actual passthrough *deactivation* logic here
    }
  };

  const showSoundWave = isClientActive && performance.vol > INPUT_SENSITIVITY_THRESHOLD;

  // Standard buttons: px-3 py-2, h-auto (derived from padding)
  // Taller action buttons: px-4 py-3, h-12 (explicit height for consistency)
  const buttonBaseClass = "text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm";
  const lightButtonClass = "px-3 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-blue-500";
  
  // Enhanced Start/Stop Button Styling
  const activityButtonBase = `${buttonBaseClass} px-4 h-12 w-32 rounded-lg shadow-lg`; // Taller, wider, more rounded, more shadow
  const activityButtonClass = isClientActive 
    ? `${activityButtonBase} bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 active:bg-red-700`
    : `${activityButtonBase} bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 active:bg-green-700`;

  // Passthrough Button Styling
  const passthroughButtonHeightClass = "h-10"; // Shorter than activityButton (h-12)
  const passthroughButtonBase = `${buttonBaseClass} ${passthroughButtonHeightClass} px-3 w-32 rounded-md`; // Adjusted padding and width
  const passthroughButtonClass = isPassthroughActive
    ? `${passthroughButtonBase} text-white passthrough-active-animate focus:ring-red-500` // Animation class
    : `${passthroughButtonBase} text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-blue-500`;

  return (
    <div className="h-20 min-h-[60px] bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 py-2 flex-shrink-0 transition-colors duration-300">
      <div className="flex space-x-2">
        <button onClick={() => openModal('mergeLab')} className={`${buttonBaseClass} ${lightButtonClass}`}>Merge Lab</button>
        <button onClick={() => openModal('advancedSettings')} className={`${buttonBaseClass} ${lightButtonClass}`}>Advanced Settings</button>
      </div>
      
      {/* Sound Wave CSS - can be moved to a CSS file */}
      <style>
        {`
          .sound-wave-bar {
            width: 4px; /* Slightly thicker */
            height: 100%;
            background-color: currentColor;
            margin: 0 1.5px; /* Adjusted spacing */
            animation: sound-wave 0.7s infinite ease-in-out alternate;
            transform-origin: bottom;
            border-radius: 2px 2px 0 0; /* Slightly rounded tops */
          }
          .sound-wave-bar:nth-child(1) { animation-delay: -0.6s; }
          .sound-wave-bar:nth-child(2) { animation-delay: -0.5s; }
          .sound-wave-bar:nth-child(3) { animation-delay: -0.4s; }
          .sound-wave-bar:nth-child(4) { animation-delay: -0.3s; }

          @keyframes sound-wave {
            0% { transform: scaleY(0.1); opacity: 0.7; }
            100% { transform: scaleY(1); opacity: 1; }
          }

          .passthrough-active-animate {
            animation: flickerAnimation 0.7s infinite; /* Slightly adjusted speed */
            /* Base color will be set by Tailwind, animation overrides */
          }
          @keyframes flickerAnimation {
            0%, 100% { background-color: #DC2626; /* Tailwind red-600 */ box-shadow: 0 0 7px 1px rgba(220, 38, 38, 0.4); }
            50% { background-color: #F87171; /* Tailwind red-400 */ box-shadow: 0 0 10px 2px rgba(248, 113, 113, 0.6); }
          }
        `}
      </style>

      <div className="flex items-center space-x-3">
        <button onClick={handleToggleClientActivity} className={activityButtonClass}>
          {showSoundWave ? (
            <div className="flex items-end h-5 w-auto" aria-hidden="true"> {/* Increased height for sound wave */}
              <span className="sound-wave-bar"></span>
              <span className="sound-wave-bar"></span>
              <span className="sound-wave-bar"></span>
              <span className="sound-wave-bar"></span>
            </div>
          ) : (
            <FontAwesomeIcon icon={isClientActive ? faStop : faPlay} className="h-5 w-5" /> /* Slightly larger icon */
          )}
          <span className="ml-2 text-base font-semibold">{isClientActive ? 'Stop' : 'Start'}</span> {/* Larger, bolder text */}
        </button>
        <button onClick={handleTogglePassthrough} className={passthroughButtonClass} title={isPassthroughActive ? "Deactivate Passthrough" : "Activate Passthrough (Confirmation Required)"}>
            <FontAwesomeIcon icon={faRightLeft} className="h-4 w-4" /> {/* Icon size can be smaller for this button */}
            <span className="ml-1.5 font-medium">Passthrough</span> {/* Text can be slightly smaller */}
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button onClick={() => openModal('serverInfo')} className={`${buttonBaseClass} ${lightButtonClass}`}>Server Info</button>
        <button onClick={() => openModal('clientInfo')} className={`${buttonBaseClass} ${lightButtonClass}`}>Client Info</button>
        <button 
          onClick={toggleTheme}
          className={`${buttonBaseClass} ${lightButtonClass} w-10 h-10`}
          aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default BottomBar; 