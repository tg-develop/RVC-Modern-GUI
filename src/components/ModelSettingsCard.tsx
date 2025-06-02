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

// This type is for the server-side client settings structure
interface ClientSettingStructure {
    tran?: number;
    f0Factor?: number;
    indexRatio?: number;
    speakerId?: number;
    // Add other client setting properties here if they exist
}

// Define a type for our local editable model state
// It includes all RVCModelSlot properties plus UI-specific editable values
type modelState = RVCModelSlot & {
    uiTune: number;
    uiF0Factor: number;
    uiIndexRatio: number;
    uiSpeakerId: number;
};

function ModelSettingsCard({ openModal, dndAttributes, dndListeners }: ModelSettingsCardProps): JSX.Element {
  const appState = useAppState() as AppStateForCard; 
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Renamed from selectedModel to avoid confusion with the local state
  useEffect(() => {
    const serverSettings = appState.serverSetting?.serverSetting as any; 
    if (serverSettings && typeof serverSettings.modelSlotIndex === 'number' && serverSettings.modelSlots) {
      const model = serverSettings.modelSlots.find(
        (slot: ModelSlotUnion): slot is RVCModelSlot => 
            slot.slotIndex === serverSettings.modelSlotIndex && 
            slot.voiceChangerType === VoiceChangerType.RVC
      );
      setModel(model || null);
    }
  }, [appState.serverSetting?.serverSetting]);

  const [model, setModel] = useState<RVCModelSlot | null>(null);

  const handleClientSettingUpdate = (newSetting: Partial<ClientSettingStructure>) => {
    if (appState.updateClientSetting) {
      const currentClientSettings = appState.clientSetting?.setting || {};
      appState.updateClientSetting({ 
        ...currentClientSettings, 
        ...newSetting 
      });
    }
  };

  const handlePitchChange = (val: number) => {
    //setmodel(prev => prev ? { ...prev, uiTune: val } : null);
    handleClientSettingUpdate({ tran: val });
  };

  const handleFormatShiftChange = (val: number) => {
    //setmodel(prev => prev ? { ...prev, uiF0Factor: val } : null);
    handleClientSettingUpdate({ f0Factor: val });
  };

  const handleIndexRatioChange = (val: number) => {
    //setmodel(prev => prev ? { ...prev, uiIndexRatio: val } : null);
    handleClientSettingUpdate({ indexRatio: val });
  };

  const handleSpeakerChange = (val: number) => {
    //setmodel(prev => prev ? { ...prev, uiSpeakerId: val } : null);
    handleClientSettingUpdate({ speakerId: val });
  };

  const commonLabelClass = "w-28 text-sm font-medium text-slate-600 dark:text-gray-400 flex-shrink-0";
  const commonRangeClass = "flex-grow h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400";
  const commonValueDisplayClass = "w-12 text-sm text-slate-700 dark:text-gray-300 text-center flex-shrink-0";
  const commonSelectClass = "flex-grow p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm";
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  // Use model for these properties, reflecting user's preference for direct access
  const isONNX = model?.isONNX ?? false;
  const modelTypeDisplay = isONNX 
    ? model?.modelTypeOnnx || model?.modelType 
    : model?.modelType;
  
  const modelIcon = 'https://placehold.co/128x128.png?text=Model'; // User's preference

  // Prepare speaker options outside of JSX return for clarity
  let speakerOptions: JSX.Element[] = [];
  if (model && model.speakers && Object.keys(model.speakers).length > 0) {
    speakerOptions = Object.entries(model.speakers).map(([id, name]) => (
      <option key={id} value={id}>{name as string}</option>
    ));
  } else {
    speakerOptions = [<option key="no-speakers" value={0} disabled>No speakers</option>];
  }

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : ''}`}>
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
          {model ? (
            <div className="flex flex-col items-center text-center mb-6 p-4 bg-slate-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex w-full items-start">
                <img 
                  src={modelIcon}
                  alt={model.name} 
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg mb-3 mr-4 flex-shrink-0"
                />
                <div className="flex-grow text-left">
                  <div className="flex items-center mb-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-gray-100 break-words mr-2">{model.name}</h3>
                    <button 
                      onClick={() => openModal('editModel', { model: model })}
                      className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                      title="Edit Model"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <ModelInfoItem label="Embedder" value={model.embedder || 'N/A'} />
                    <ModelInfoItem 
                        label="Model Type" 
                        value={modelTypeDisplay || 'N/A'} 
                    />
                    <ModelInfoItem label="Sample Rate" value={model.samplingRate ? `${model.samplingRate / 1000} kHz` : 'N/A'} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-6 p-8 bg-slate-100 dark:bg-gray-700/50 rounded-lg min-h-[160px]">
              <p className="text-slate-500 dark:text-gray-400 italic text-center">Select a model from the list <br/> to see its settings.</p>
            </div>
          )}
          <div className={`space-y-4 ${!model ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center space-x-2">
              <label htmlFor="pitch" className={commonLabelClass}>Pitch:</label>
              <input type="range" id="pitch" name="pitch" min="-50" max="50" step="1" value={model?.defaultTune ?? 0} onChange={(e) => handlePitchChange(parseInt(e.target.value))} className={commonRangeClass} disabled={!model} />
              <span className={commonValueDisplayClass}>{model?.defaultTune ?? 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="formatShift" className={commonLabelClass}>Formant Shift:</label>
              <input type="range" id="formatShift" name="formatShift" min="-5" max="5" step="0.1" value={model?.defaultFormantShift ?? 0} onChange={(e) => handleFormatShiftChange(parseFloat(e.target.value))} className={commonRangeClass} disabled={!model}/>
              <span className={commonValueDisplayClass}>{(model?.defaultFormantShift ?? 0).toFixed(1)}</span>
            </div>
            {model && model.indexFile !== "" && (
                <div className="flex items-center space-x-2">
                    <label htmlFor="indexRatio" className={commonLabelClass}>Index Ratio:</label>
                    <input type="range" id="indexRatio" name="indexRatio" min="0" max="1" step="0.01" value={model?.defaultIndexRatio ?? 0.5} onChange={(e) => handleIndexRatioChange(parseFloat(e.target.value))} className={commonRangeClass} disabled={!model}/>
                    <span className={commonValueDisplayClass}>{(model?.defaultIndexRatio ?? 0.5).toFixed(2)}</span>
                </div>
            )}
            <div className="flex items-center space-x-2">
              <label htmlFor="speaker" className={commonLabelClass}>Speaker:</label>
              <select 
                id="speaker" 
                name="speaker" 
                className={commonSelectClass} 
                disabled={!model || !model.speakers || Object.keys(model.speakers).length === 0} 
                value={model?.slotIndex ?? 0}
                onChange={(e) => handleSpeakerChange(parseInt(e.target.value))}
              >
                {speakerOptions}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ModelSettingsCard; 