import React, { JSX, useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faPen, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { RVCModelSlot, ModelSlotUnion, VoiceChangerType } from '@dannadori/voice-changer-client-js';
import { useAppState } from '../context/AppContext';
import DragHandle from './DragHandle';

interface ModelSettingsCardProps {
  openModal: (type: string, props?: { model?: RVCModelSlot }) => void;
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

// Helper to create a consistent look for model info items
const ModelInfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="text-xs text-slate-600 dark:text-gray-400">
    <span className="font-semibold">{label}:</span> {value}
  </div>
);

// Temporary interface to help with appState typing issues until AppContext is fully aligned
interface AppStateForCard {
    serverSetting?: { serverSetting: any }; // From App.tsx temporary interface
    initialized?: boolean; // From App.tsx temporary interface
    clientSetting?: { setting: any }; 
    updateClientSetting?: (setting: any) => void; 
    // Add other properties from AppStateValue if needed by other parts of this component
}

function ModelSettingsCard({ openModal, dndAttributes, dndListeners }: ModelSettingsCardProps): JSX.Element {
  const appState = useAppState() as AppStateForCard; 
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedModel: RVCModelSlot | null = useMemo(() => {
    const serverSettings = appState.serverSetting?.serverSetting as any; 
    if (serverSettings && typeof serverSettings.modelSlotIndex === 'number' && serverSettings.modelSlots) {
      const model = serverSettings.modelSlots.find(
        (slot: ModelSlotUnion): slot is RVCModelSlot => 
            slot.slotIndex === serverSettings.modelSlotIndex && 
            slot.voiceChangerType === VoiceChangerType.RVC
      );
      return model || null;
    }
    return null;
  }, [appState.serverSetting?.serverSetting]);

  // Local states for UI controls
  const [currentPitch, setCurrentPitch] = useState(0);
  const [currentFormatShift, setCurrentFormatShift] = useState(0);
  const [currentIndexRatio, setCurrentIndexRatio] = useState(0.5);
  const [currentSpeakerId, setCurrentSpeakerId] = useState(0);

  // Effect to synchronize local UI states with context/selectedModel
  useEffect(() => {
    if (selectedModel && appState.clientSetting?.setting) {
      const { setting } = appState.clientSetting;
      setCurrentPitch(setting.tran ?? selectedModel.defaultTune ?? 0);
      setCurrentFormatShift(setting.f0Factor ?? (selectedModel as any).defaultF0Factor ?? 0); 
      setCurrentIndexRatio(setting.indexRatio ?? selectedModel.defaultIndexRatio ?? 0.5);
      setCurrentSpeakerId(setting.speakerId ?? (selectedModel as any).defaultSpeakerId ?? 0); 
    } else if (selectedModel) {
      setCurrentPitch(selectedModel.defaultTune ?? 0);
      setCurrentFormatShift((selectedModel as any).defaultF0Factor ?? 0);
      setCurrentIndexRatio(selectedModel.defaultIndexRatio ?? 0.5);
      setCurrentSpeakerId((selectedModel as any).defaultSpeakerId ?? 0);
    }
  }, [selectedModel, appState.clientSetting?.setting]);

  const handlePitchChange = (val: number) => {
    setCurrentPitch(val);
    if (appState.updateClientSetting && appState.clientSetting?.setting) {
      appState.updateClientSetting({ ...appState.clientSetting.setting, tran: val });
    }
  };

  const handleFormatShiftChange = (val: number) => {
    setCurrentFormatShift(val);
    if (appState.updateClientSetting && appState.clientSetting?.setting) {
      appState.updateClientSetting({ ...appState.clientSetting.setting, f0Factor: val });
    }
  };

  const handleIndexRatioChange = (val: number) => {
    setCurrentIndexRatio(val);
    if (appState.updateClientSetting && appState.clientSetting?.setting) {
      appState.updateClientSetting({ ...appState.clientSetting.setting, indexRatio: val });
    }
  };

  const handleSpeakerChange = (val: number) => {
    setCurrentSpeakerId(val);
    if (appState.updateClientSetting && appState.clientSetting?.setting) {
      appState.updateClientSetting({ ...appState.clientSetting.setting, speakerId: val });
    }
  };

  const commonLabelClass = "w-28 text-sm font-medium text-slate-600 dark:text-gray-400 flex-shrink-0";
  const commonRangeClass = "flex-grow h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400";
  const commonValueDisplayClass = "w-12 text-sm text-slate-700 dark:text-gray-300 text-center flex-shrink-0";
  const commonSelectClass = "flex-grow p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm";
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  // Attempt to determine model type string more robustly
  const isONNX = (selectedModel as any)?.isONNX ?? (selectedModel as any)?.isOnnx ?? false;
  const modelTypeDisplay = isONNX 
    ? (selectedModel as any)?.modelTypeOnnx || (selectedModel as any)?.modelType 
    : (selectedModel as any)?.modelType;
  
  const modelIcon = (selectedModel as any)?.icon || (selectedModel as any)?.thumbnail || 'https://placehold.co/128x128.png?text=Model';

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-200">Model Settings</h4>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`${iconButtonClass} focus:ring-blue-500`} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <>
          {selectedModel ? (
            <div className="flex flex-col items-center text-center mb-6 p-4 bg-slate-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex w-full items-start">
                <img 
                  src={modelIcon}
                  alt={selectedModel.name} 
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg mb-3 mr-4 flex-shrink-0"
                />
                <div className="flex-grow text-left">
                  <div className="flex items-center mb-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-gray-100 break-words mr-2">{selectedModel.name}</h3>
                    <button 
                      onClick={() => openModal('editModel', { model: selectedModel })}
                      className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                      title="Edit Model"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <ModelInfoItem label="Embedder" value={selectedModel.embedder || 'N/A'} />
                    <ModelInfoItem 
                        label="Model Type" 
                        value={modelTypeDisplay || 'N/A'} 
                    />
                    <ModelInfoItem label="Sample Rate" value={selectedModel.samplingRate ? `${selectedModel.samplingRate / 1000} kHz` : 'N/A'} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-6 p-8 bg-slate-100 dark:bg-gray-700/50 rounded-lg min-h-[160px]">
              <p className="text-slate-500 dark:text-gray-400 italic text-center">Select a model from the list <br/> to see its settings.</p>
            </div>
          )}
          <div className={`space-y-4 ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center space-x-2">
              <label htmlFor="pitch" className={commonLabelClass}>Pitch:</label>
              <input type="range" id="pitch" name="pitch" min="-50" max="50" step="1" value={currentPitch} onChange={(e) => handlePitchChange(parseInt(e.target.value))} className={commonRangeClass} disabled={!selectedModel} />
              <span className={commonValueDisplayClass}>{currentPitch}</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="formatShift" className={commonLabelClass}>Formant Shift:</label>
              <input type="range" id="formatShift" name="formatShift" min="-5" max="5" step="0.1" value={currentFormatShift} onChange={(e) => handleFormatShiftChange(parseFloat(e.target.value))} className={commonRangeClass} disabled={!selectedModel}/>
              <span className={commonValueDisplayClass}>{currentFormatShift.toFixed(1)}</span>
            </div>
            {selectedModel && (selectedModel as any).indexFile !== "" && (
                <div className="flex items-center space-x-2">
                    <label htmlFor="indexRatio" className={commonLabelClass}>Index Ratio:</label>
                    <input type="range" id="indexRatio" name="indexRatio" min="0" max="1" step="0.01" value={currentIndexRatio} onChange={(e) => handleIndexRatioChange(parseFloat(e.target.value))} className={commonRangeClass} disabled={!selectedModel}/>
                    <span className={commonValueDisplayClass}>{currentIndexRatio.toFixed(2)}</span>
                </div>
            )}
            <div className="flex items-center space-x-2">
              <label htmlFor="speaker" className={commonLabelClass}>Speaker:</label>
              <select 
                id="speaker" 
                name="speaker" 
                className={commonSelectClass} 
                disabled={!selectedModel || !(selectedModel as any).speakers || (selectedModel as any).speakers.length === 0} 
                value={currentSpeakerId}
                onChange={(e) => handleSpeakerChange(parseInt(e.target.value))}
              >
                {selectedModel && selectedModel.speakers && Object.keys(selectedModel.speakers).length > 0 
                  ? Object.entries(selectedModel.speakers).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))
                  : <option value={0} disabled>No speakers</option>
                }
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ModelSettingsCard; 