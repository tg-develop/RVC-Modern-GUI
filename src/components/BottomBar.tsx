import { JSX, useState, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlay, faStop, faTriangleExclamation, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { AppContextValue, useAppState } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';


interface BottomBarProps {
  openModal: (type: string, props?: any) => void; // Added openModal prop
}

function BottomBar({ openModal }: BottomBarProps): JSX.Element {
  const { theme, toggleTheme } = useThemeContext();
  const appState = useAppState() as AppContextValue; // Cast via unknown for broader compatibility if types are complex
  const uiContext = useUIContext();

  const [startWithAudioContextCreate, setStartWithAudioContextCreate] = useState<boolean>(false);
  useEffect(() => {
      if (!startWithAudioContextCreate) {
          return;
      }
      uiContext.setIsConverting(true);
      appState.start();
  }, [startWithAudioContextCreate]);


  const handleToggleClientActivity = async () => {
    if(uiContext.isConverting){
      handleStop();
    }else{
      handleStart();
    }
  }

  const handleStart = async () => {
    if (appState.serverSetting.serverSetting.modelSlotIndex === -1) {
      uiContext.showError('Select a voice model first.', "Warning")
      return
  }
  if (appState.serverSetting.serverSetting.enableServerAudio == 0) {
      if (!appState.setting.voiceChangerClientSetting.audioInput || appState.setting.voiceChangerClientSetting.audioInput == 'none') {
          uiContext.showError('Select an audio input device.', "Warning")
          return
      }
      // TODO: Refactor
      //if (guiState.audioOutputForGUI == 'none') {
      //    uiContext.showError('Select an audio output device.', "Warning")
      //    return
      //}

      if (!appState.initializedRef.current) {
          while (true) {
              await new Promise<void>((resolve) => {
                  setTimeout(resolve, 500);
              });
              if (appState.initializedRef.current) {
                  break;
              }
          }
          setStartWithAudioContextCreate(true);
      } else {
          uiContext.setIsConverting(true);
          await appState.start();
      }
  } else {
      if (appState.serverSetting.serverSetting.serverInputDeviceId == -1) {
          uiContext.showError('Select an audio input device.', "Warning")
          return
      }
      if (appState.serverSetting.serverSetting.serverOutputDeviceId == -1) {
          uiContext.showError('Select an audio output device.', "Warning")
          return
      }
      appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, serverAudioStated: 1 });
      uiContext.setIsConverting(true);
    }
  };

  const handleStop = async () => {
    if (appState.serverSetting.serverSetting.enableServerAudio == 0) {
        uiContext.setIsConverting(false);
        await appState.stop();
    } else {
        uiContext.setIsConverting(false);
        appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, serverAudioStated: 0 });
    }
};

  const handleTogglePassthrough = () => {
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
            ${uiContext.isConverting 
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 
            ${uiContext.isConverting ? 'focus:ring-red-400' : 'focus:ring-green-400'}`}
        >
          <FontAwesomeIcon icon={uiContext.isConverting ? faStop : faPlay} />
          <span>{uiContext.isConverting ? 'Stop Server' : 'Start Server'}</span>
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