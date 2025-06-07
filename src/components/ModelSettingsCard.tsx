import React, { JSX, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faPen } from '@fortawesome/free-solid-svg-icons';
import { RVCModelSlot,  ClientState } from '@dannadori/voice-changer-client-js';
import { useAppState } from '../context/AppContext';
import DragHandle from './Helpers/DragHandle';
import { CSS_CLASSES } from '../styles/constants';
import DebouncedSlider from './Helpers/DebouncedSlider';
import { useInitialPlaceholder } from '../scripts/usePlaceholder';

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

function ModelSettingsCard({ openModal, dndAttributes, dndListeners }: ModelSettingsCardProps): JSX.Element {
  const appState = useAppState() as ClientState; 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [model, setModel] = useState<RVCModelSlot>();
  
  useEffect(() => {
    setModel(appState.serverSetting.serverSetting.modelSlots[appState.serverSetting.serverSetting.modelSlotIndex]);
  }, [appState.serverSetting?.serverSetting.modelSlotIndex, appState.serverSetting?.serverSetting.voiceChangerParams.model_dir]);

  const handlePitchChange = (val: number) => {
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting.serverSetting,
      tran: val  
    });
  };

  const handleFormatShiftChange = (val: number) => {
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting.serverSetting,
      formantShift: val  
    });
  };

  const handleIndexRatioChange = (val: number) => {
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting.serverSetting,
      indexRatio: val  
    });
  };

  const handleSaveSettings = () => {
    appState.serverSetting.updateModelDefault();
  };


  // Use model for these properties, reflecting user's preference for direct access
  const isONNX = model?.isONNX ?? false;
  const modelTypeDisplay = isONNX 
    ? model?.modelTypeOnnx || model?.modelType 
    : model?.modelType;
  
  const modelDir = appState.serverSetting.serverSetting.voiceChangerParams.model_dir;
  const icon = (model?.iconFile && model?.iconFile.length > 0) ? "http://127.0.0.1:18888/" + modelDir  + "/" + model.slotIndex + "/" + model.iconFile.split(/[\/\\]/).pop() : "";
  const placeholder = useInitialPlaceholder(model?.name || "");
  

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
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`${CSS_CLASSES.iconButton} focus:ring-blue-500`} title={isCollapsed ? "Expand" : "Collapse"}>
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
                  src={icon || placeholder}
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
          {
            model && (
              <div className={`space-y-4 ${!model ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label htmlFor="pitch" className={CSS_CLASSES.label}>Pitch:</label>
                  <DebouncedSlider 
                    id="pitch" 
                    name="pitch" 
                    min={-50}
                    max={50} 
                    step={1} 
                    value={model?.defaultTune || 0} 
                    onChange={handlePitchChange} 
                    onImmediateChange={(val) => setModel({ ...model, defaultTune: val })}
                    className={CSS_CLASSES.range} 
                    disabled={!model}
                  />
                  <p className={CSS_CLASSES.sliderValue}>{model?.defaultTune || 0}</p>
                </div>
                <div>
                  <label htmlFor="formatShift" className={CSS_CLASSES.label}>Formant Shift:</label>
                  <DebouncedSlider 
                    id="formatShift" 
                    name="formatShift" 
                    min={-5} 
                    max={5} 
                    step={0.1} 
                    value={model?.defaultFormantShift ?? 0} 
                    onChange={handleFormatShiftChange} 
                    onImmediateChange={(val) => setModel({ ...model, defaultFormantShift: val })}
                    className={CSS_CLASSES.range} 
                    disabled={!model}
                  />
                  <p className={CSS_CLASSES.sliderValue}>{(model?.defaultFormantShift ?? 0).toFixed(1)}</p>
                </div>
                {model.indexFile !== "" && (
                  <div>
                    <label htmlFor="indexRatio" className={CSS_CLASSES.label}>Index Ratio:</label>
                    <DebouncedSlider 
                      id="indexRatio" 
                      name="indexRatio" 
                      min={0} 
                      max={1} 
                      step={0.01} 
                      value={model?.defaultIndexRatio ?? 0.5} 
                      onChange={handleIndexRatioChange} 
                      onImmediateChange={(val) => setModel({ ...model, defaultIndexRatio: val })}
                      className={CSS_CLASSES.range} 
                      disabled={!model}
                    />
                    <p className={CSS_CLASSES.sliderValue}>{(model?.defaultIndexRatio ?? 0.5).toFixed(2)}</p>
                  </div>
                )}
                {
                  // Only show speaker selection if there is more than one speaker
                  model.speakers && Object.keys(model.speakers).length > 1 && (
                    <div className="flex items-center space-x-2">
                      <label htmlFor="speaker" className={CSS_CLASSES.label}>Speaker:</label>
                      <select 
                        id="speaker" 
                        name="speaker" 
                        className={CSS_CLASSES.select} 
                        disabled={!model || !model.speakers || Object.keys(model.speakers).length === 0} 
                        value={model?.slotIndex ?? 0}
                        onChange={() => {}}
                      >
                        {speakerOptions}
                      </select>
                    </div>
                  )
                }
              </div>

            )
          }
        </>
      )}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveSettings}
          className={CSS_CLASSES.modalSecondaryButton}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default ModelSettingsCard; 