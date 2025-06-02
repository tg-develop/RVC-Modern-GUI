import React, { JSX, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './DragHandle';
import { useAppState } from '../context/AppContext';

// Props for icons
interface AiSettingsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

// Interface for GPU options from server settings
interface GpuInfo {
  id: number;
  name: string;
  backend?: string;
  memory?: number;
}

// Interface for client-side AI settings
interface ClientAiSettings {
  echoCancel?: boolean;
  noiseSuppression?: boolean;
  noiseSuppression2?: boolean;
  // Add other client AI settings here
}

// Interface for server-side AI settings
interface ServerAiSettings {
  extraConvertSize?: number;
  silenceThreshold?: number; // Corrected typo: Threshhold -> Threshold
  gpus?: GpuInfo[];
  gpu?: number; // Selected GPU ID
  serverReadChunkSize?: number;
  // Add other server AI settings here
}

// Temporary interface to help with appState typing
interface AppStateForAiCard {
  serverSetting?: { serverSetting: ServerAiSettings };
  clientSetting?: { setting: ClientAiSettings };
  updateClientSetting?: (setting: Partial<ClientAiSettings>) => void;
  // Assuming a similar update function for server settings might exist or be needed
  // For now, we'll focus on reading server settings and updating client settings.
  // If server settings need to be updated from this card, an updateServerSetting function would be needed in AppContext.
  updateServerSetting?: (setting: Partial<ServerAiSettings>) => void; // Added for completeness
}

function AiSettingsCard({ dndAttributes, dndListeners }: AiSettingsCardProps): JSX.Element {
  const appState = useAppState() as AppStateForAiCard;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClientSettingUpdate = (newSetting: Partial<ClientAiSettings>) => {
    if (appState.updateClientSetting) {
      appState.updateClientSetting({
        ...(appState.clientSetting?.setting || {}),
        ...newSetting,
      });
    }
  };

  // Placeholder for server setting updates, assuming similar pattern to client settings
  const handleServerSettingUpdate = (newSetting: Partial<ServerAiSettings>) => {
    if (appState.updateServerSetting) { // Check if the function exists
      appState.updateServerSetting({
        ...(appState.serverSetting?.serverSetting || {}),
        ...newSetting,
      });
    } else {
      console.warn("updateServerSetting function not provided in AppState");
    }
  };

  const commonSelectClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonRangeClass = "w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400 transition-colors duration-150";
  const commonLabelClass = "block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1";
  const commonSliderValueClass = "text-xs text-slate-600 dark:text-gray-400 text-right";
  const checkboxLabelClass = "flex items-center text-sm text-slate-700 dark:text-gray-300";
  const checkboxClass = "mr-2 accent-blue-500 dark:accent-blue-400";
  const headingClass = "text-lg font-semibold text-slate-700 dark:text-gray-200";
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h4 className={headingClass}>AI Settings</h4>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={iconButtonClass} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-3">
            <div>
              <label className={commonLabelClass}>Noise Reduction:</label>
              <div className="space-y-1">
                <label className={checkboxLabelClass}>
                  <input 
                    type="checkbox" 
                    name="echoCancel" 
                    className={checkboxClass} 
                    checked={appState.clientSetting?.setting?.echoCancel ?? false}
                    onChange={(e) => handleClientSettingUpdate({ echoCancel: e.target.checked })}
                  /> Echo Cancellation
                </label>
                <label className={checkboxLabelClass}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression" 
                    className={checkboxClass} 
                    checked={appState.clientSetting?.setting?.noiseSuppression ?? false}
                    onChange={(e) => handleClientSettingUpdate({ noiseSuppression: e.target.checked })}
                  /> Noise Suppression
                </label>
                <label className={checkboxLabelClass}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression2" 
                    className={checkboxClass} 
                    checked={appState.clientSetting?.setting?.noiseSuppression2 ?? false}
                    onChange={(e) => handleClientSettingUpdate({ noiseSuppression2: e.target.checked })}
                  /> Noise Suppression 2
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="inSens" className={commonLabelClass}>Input Sensitivity (In. Sens):</label>
              <input 
                type="range" 
                id="inSens" 
                name="inSens" 
                min="-90"
                max="-60"
                step="1"
                value={appState.serverSetting?.serverSetting?.silenceThreshold ?? -75} 
                className={commonRangeClass} 
                onChange={(e) => handleServerSettingUpdate({ silenceThreshold: parseInt(e.target.value) })}
              />
              <p className={commonSliderValueClass}>{appState.serverSetting?.serverSetting?.silenceThreshold ?? -75} dB</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="chunk" className={commonLabelClass}>Chunk Size:</label>
              <input 
                type="range" 
                id="chunk" 
                name="chunk" 
                min="2.7" 
                max="2730.7" 
                step="2.7" 
                value={appState.serverSetting?.serverSetting?.serverReadChunkSize ? (appState.serverSetting.serverSetting.serverReadChunkSize * 2.66667).toFixed(1) : "5"} 
                className={commonRangeClass}
                onChange={(e) => handleServerSettingUpdate({ serverReadChunkSize: Math.round(parseFloat(e.target.value) / 2.66667) })}
              />
              <p className={commonSliderValueClass}>{appState.serverSetting?.serverSetting?.serverReadChunkSize ? (appState.serverSetting.serverSetting.serverReadChunkSize * 2.66667).toFixed(1): "5"} ms</p>
            </div>
            <div>
              <label htmlFor="extra" className={commonLabelClass}>Extra Processing Time (Extra):</label>
              <input 
                type="range" 
                id="extra" 
                name="extra" 
                min="0"
                max="5" 
                step="0.1" 
                value={appState.serverSetting?.serverSetting?.extraConvertSize ? (appState.serverSetting.serverSetting.extraConvertSize) : "1"}
                className={commonRangeClass} 
                onChange={(e) => handleServerSettingUpdate({ extraConvertSize: Math.round(parseFloat(e.target.value)) })}
              />
              <p className={commonSliderValueClass}>{appState.serverSetting?.serverSetting?.extraConvertSize ? (appState.serverSetting.serverSetting.extraConvertSize) : "1"} s</p>
            </div>
            <div>
              <label htmlFor="gpu" className={commonLabelClass}>Processing Unit (GPU):</label>
              <select 
                id="gpu" 
                name="gpu" 
                className={commonSelectClass} 
                value={appState.serverSetting?.serverSetting?.gpu ?? -1}
                onChange={(e) => handleServerSettingUpdate({ gpu: parseInt(e.target.value) })}
              >
                {appState.serverSetting?.serverSetting?.gpus?.length && appState.serverSetting?.serverSetting?.gpus?.length > 0 ? (
                  appState.serverSetting?.serverSetting?.gpus?.map((gpu: GpuInfo) => <option key={gpu.id} value={gpu.id}>{gpu.name}</option>)
                ) : (
                  <option value="-1" disabled>No GPUs available</option>
                )}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSettingsCard; 