import React, { useContext, JSX, useState, useEffect } from 'react';
import { ThemeContext, useThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlay, faStop, faRightLeft, faTriangleExclamation, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import { ClientState } from '@dannadori/voice-changer-client-js';

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
  openModal: (type: string, props?: any) => void; // Added openModal prop
}

const INPUT_SENSITIVITY_THRESHOLD = 0.5; // Example threshold for sound wave

function BottomBar({ openModal }: BottomBarProps): JSX.Element {
  const { theme, toggleTheme } = useThemeContext();
  const { performance } = usePerformanceContext(); // Consume performance context
  const appState = useAppState() as ClientState; // Cast via unknown for broader compatibility if types are complex

  const handleToggleClientActivity = () => {
    if (appState.serverSetting.serverSetting?.enableServerAudio) {
      console.log("Requesting to stop server audio");
      appState.stop();
    } else {
      console.log("Requesting to start server audio");
      appState.start();
    }

  };

  const handleTogglePassthrough = () => {
    const isCurrentlyPassthrough = appState.serverSetting?.serverSetting?.passThrough === true;

    // Ensure setting and voiceChangerClientSetting are available before accessing passThroughConfirmationSkip
    const skipConfirmation = appState.setting?.voiceChangerClientSetting?.passThroughConfirmationSkip === true;

    if (!appState.serverSetting?.serverSetting?.passThrough) { // Attempting to activate passthrough
      if (skipConfirmation) {
        appState.serverSetting.updateServerSettings({
          ...appState.serverSetting.serverSetting,
          passThrough: true,
        });
      } else {
        openModal('passThrough', {
          title: "Activate Passthrough?",
          message: "Activating passthrough will output your input voice directly without any changes.",
          icon: faTriangleExclamation,
          iconClassName: "text-yellow-500 w-12 h-12 mx-auto mb-4",
          confirmText: "Activate Passthrough",
          cancelText: "Cancel",
          onConfirm: () => {
            appState.serverSetting.updateServerSettings({
              ...appState.serverSetting.serverSetting,
              passThrough: true,
            });
          }
        });
      }
    } else { // Attempting to deactivate passthrough
      appState.serverSetting.updateServerSettings({
        ...appState.serverSetting.serverSetting,
        passThrough: false,
      });
    }
  };

  // Standard buttons: px-3 py-2, h-auto (derived from padding)
  // Taller action buttons: px-4 py-3, h-12 (explicit height for consistency)
  const buttonBaseClass = "text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm";
  const lightButtonClass = "px-3 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-blue-500";
  
  // Enhanced Start/Stop Button Styling
  const activityButtonBase = `${buttonBaseClass} px-4 h-12 w-32 rounded-lg shadow-lg`; // Taller, wider, more rounded, more shadow
  const activityButtonClass = appState.serverSetting?.serverSetting?.enableServerAudio 
    ? `${activityButtonBase} bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 active:bg-red-700`
    : `${activityButtonBase} bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 active:bg-green-700`;

  // Passthrough Button Styling
  const passthroughButtonHeightClass = "h-10"; // Shorter than activityButton (h-12)
  const passthroughButtonBase = `${buttonBaseClass} ${passthroughButtonHeightClass} px-3 w-32 rounded-md`; // Adjusted padding and width
  const passthroughButtonClass = appState.serverSetting?.serverSetting?.passThrough
    ? `${passthroughButtonBase} text-white passthrough-active-animate focus:ring-red-500` // Animation class
    : `${passthroughButtonBase} text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-blue-500`;

  return (
    <div className="h-20 min-h-[60px] bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 py-2 flex-shrink-0 transition-colors duration-300">
      <div className="flex space-x-2">
        <button onClick={() => openModal('mergeLab')} className={`${buttonBaseClass} ${lightButtonClass}`}>Merge Lab</button>
        <button onClick={() => openModal('advancedSettings')} className={`${buttonBaseClass} ${lightButtonClass}`}>Advanced Settings</button>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={handleToggleClientActivity}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-2 
            ${appState.serverSetting?.serverSetting?.enableServerAudio 
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 
            ${appState.serverSetting?.serverSetting?.enableServerAudio ? 'focus:ring-red-400' : 'focus:ring-green-400'}`}
        >
          <FontAwesomeIcon icon={appState.serverSetting?.serverSetting?.enableServerAudio ? faStop : faPlay} />
          <span>{appState.serverSetting?.serverSetting?.enableServerAudio ? 'Stop Server' : 'Start Server'}</span>
        </button>
        <button 
          onClick={handleTogglePassthrough}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-2 
            ${appState.serverSetting?.serverSetting?.passThrough 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-gray-600 hover:bg-gray-500 text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 
            ${appState.serverSetting?.serverSetting?.passThrough ? 'focus:ring-yellow-400' : 'focus:ring-gray-400'}`}
        >
          <FontAwesomeIcon icon={appState.serverSetting?.serverSetting?.passThrough ? faVolumeUp : faVolumeMute} />
          <span>{appState.serverSetting?.serverSetting?.passThrough ? 'Passthrough ON' : 'Passthrough OFF'}</span>
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