import React, { JSX, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './DragHandle';
import DebouncedSlider from './DebouncedSlider';
import { useAppState } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';
import { F0Detector } from '@dannadori/voice-changer-client-js';
import { CSS_CLASSES } from '../styles/constants';

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

function AiSettingsCard({ dndAttributes, dndListeners }: AiSettingsCardProps): JSX.Element {
  const appState = useAppState();
  const uiState = useUIContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Local state for immediate slider labels
  const [localSilentThreshold, setLocalSilentThreshold] = useState<number>(
    appState.serverSetting?.serverSetting?.silentThreshold ?? -75
  );
  const [localChunkSize, setLocalChunkSize] = useState<number>(
    appState.serverSetting?.serverSetting?.serverReadChunkSize
      ? appState.serverSetting.serverSetting.serverReadChunkSize * 2.66667
      : 5
  );
  const [localExtraSize, setLocalExtraSize] = useState<number>(
    appState.serverSetting?.serverSetting?.extraConvertSize ?? 1
  );

  useEffect(() => {
    const st = appState.serverSetting?.serverSetting?.silentThreshold;
    if (st != null) setLocalSilentThreshold(st);
  }, [appState.serverSetting?.serverSetting?.silentThreshold]);
  useEffect(() => {
    const cs = appState.serverSetting?.serverSetting?.serverReadChunkSize;
    if (cs != null) setLocalChunkSize(cs * 2.66667);
  }, [appState.serverSetting?.serverSetting?.serverReadChunkSize]);
  useEffect(() => {
    const ex = appState.serverSetting?.serverSetting?.extraConvertSize;
    if (ex != null) setLocalExtraSize(ex);
  }, [appState.serverSetting?.serverSetting?.extraConvertSize]);

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h4 className={CSS_CLASSES.heading}>AI Settings</h4>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={CSS_CLASSES.iconButton} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-3">
            <div>
              <label className={CSS_CLASSES.label}>Noise Reduction:</label>
              <div className="space-y-1">
                <label className={CSS_CLASSES.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="echoCancel" 
                    className={CSS_CLASSES.checkbox} 
                    checked={appState.setting.voiceChangerClientSetting.echoCancel ?? false}
                    onChange={(e) => appState.setVoiceChangerClientSetting({
                        ...appState.setting.voiceChangerClientSetting,
                        echoCancel: e.target.checked
                    })}
                  /> Echo Cancellation
                </label>
                <label className={CSS_CLASSES.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression" 
                    className={CSS_CLASSES.checkbox} 
                    checked={appState.setting.voiceChangerClientSetting.noiseSuppression ?? false}
                    onChange={(e) => appState.setVoiceChangerClientSetting({
                        ...appState.setting.voiceChangerClientSetting,
                        noiseSuppression: e.target.checked
                    })}
                  /> Noise Suppression
                </label>
                <label className={CSS_CLASSES.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression2" 
                    className={CSS_CLASSES.checkbox} 
                    checked={appState.setting.voiceChangerClientSetting.noiseSuppression2 ?? false}
                    onChange={(e) => appState.setVoiceChangerClientSetting({
                        ...appState.setting.voiceChangerClientSetting,
                        noiseSuppression2: e.target.checked
                    })}
                  /> Noise Suppression 2
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="inSens" className={CSS_CLASSES.label}>Input Sensitivity (In. Sens):</label>
              <DebouncedSlider
                id="inSens"
                name="inSens"
                min={-90}
                max={-60}
                step={1}
                value={localSilentThreshold}
                className={CSS_CLASSES.range}
                onImmediateChange={setLocalSilentThreshold}
                onChange={(val) => appState.serverSetting.updateServerSettings({
                  ...appState.serverSetting?.serverSetting,
                  silentThreshold: val
                })}
              />
              <p className={CSS_CLASSES.sliderValue}>{localSilentThreshold} dB</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="chunk" className={CSS_CLASSES.label}>Chunk Size:</label>
              <DebouncedSlider
                id="chunk"
                name="chunk"
                min={2.7}
                max={2730.7}
                step={2.7}
                value={localChunkSize}
                className={CSS_CLASSES.range}
                onImmediateChange={setLocalChunkSize}
                onChange={(val) => appState.serverSetting.updateServerSettings({
                  ...appState.serverSetting?.serverSetting,
                  serverReadChunkSize: Math.round(val / 2.66667)
                })}
              />
              <p className={CSS_CLASSES.sliderValue}>{localChunkSize.toFixed(1)} ms</p>
            </div>
            <div>
              <label htmlFor="extra" className={CSS_CLASSES.label}>Extra Processing Time (Extra):</label>
              <DebouncedSlider
                id="extra"
                name="extra"
                min={0}
                max={5}
                step={0.1}
                value={localExtraSize}
                className={CSS_CLASSES.range}
                onImmediateChange={setLocalExtraSize}
                onChange={(val) => appState.serverSetting.updateServerSettings({
                  ...appState.serverSetting?.serverSetting,
                  extraConvertSize: val
                })}
              />
              <p className={CSS_CLASSES.sliderValue}>{localExtraSize} s</p>
            </div>
            <div>
              <label htmlFor="gpu" className={CSS_CLASSES.label}>Processing Unit (GPU):</label>
              <select 
                id="gpu" 
                name="gpu" 
                className={CSS_CLASSES.select} 
                value={appState.serverSetting?.serverSetting?.gpu ?? -1}
                onChange={async (e) => {
                  uiState.startLoading(`Changing to Processing Unit: ${appState.serverSetting?.serverSetting?.gpus?.find(gpu => gpu.id === parseInt(e.target.value))?.name}`);
                  await appState.serverSetting.updateServerSettings({
                     ...appState.serverSetting?.serverSetting,
                     gpu: parseInt(e.target.value)
                  })
                  uiState.stopLoading();
                }}
              >
                {appState.serverSetting?.serverSetting?.gpus?.length && appState.serverSetting?.serverSetting?.gpus?.length > 0 ? (
                  appState.serverSetting?.serverSetting?.gpus?.map((gpu: GpuInfo) => <option key={gpu.id} value={gpu.id}>{gpu.name}</option>)
                ) : (
                  <option value="-1" disabled>No GPUs available</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="f0Detector" className={CSS_CLASSES.label}>Pitch Extraction Algorithm</label>
              <select
                id="f0Detector"
                className={CSS_CLASSES.select}
                value={appState.serverSetting?.serverSetting?.f0Detector ?? ''}
                onChange={async (e) => {
                  uiState.startLoading(`Changing F0 Detector to ${e.target.value}`);
                  await appState.serverSetting.updateServerSettings({
                    ...appState.serverSetting?.serverSetting,
                    f0Detector: e.target.value as F0Detector
                  });
                  uiState.stopLoading();
                }}
              >
                {[
                  'crepe_full_onnx', 'crepe_tiny_onnx', 'crepe_full', 'crepe_tiny',
                  'rmvpe', 'rmvpe_onnx', 'fcpe', 'fcpe_onnx'
                ].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSettingsCard; 