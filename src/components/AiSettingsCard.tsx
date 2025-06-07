import React, { JSX, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './Helpers/DragHandle';
import DebouncedSlider from './Helpers/DebouncedSlider';
import { useAppState } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';
import { F0Detector, useIndexedDB } from '@dannadori/voice-changer-client-js';
import { CSS_CLASSES, INDEXEDDB_KEYS } from '../styles/constants';
import { useAppRoot } from '../context/AppRootProvider';

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

const f0Detectors = [
  'crepe_full_onnx', 'crepe_tiny_onnx', 'crepe_full', 'crepe_tiny',
  'rmvpe', 'rmvpe_onnx', 'fcpe', 'fcpe_onnx'
]

function AiSettingsCard({ dndAttributes, dndListeners }: AiSettingsCardProps): JSX.Element {
  const appState = useAppState();
  const uiState = useUIContext();
  const { appGuiSettingState } = useAppRoot();
  const edition = appGuiSettingState.edition;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getItem, setItem } = useIndexedDB({ clientType: null });

  // Local state for immediate slider labels
  const [localSilentThreshold, setLocalSilentThreshold] = useState<number>(
    appState.serverSetting?.serverSetting?.silentThreshold ?? -75
  );
  const [localChunkSize, setLocalChunkSize] = useState<number>(
    appState.serverSetting?.serverSetting?.serverReadChunkSize
      ? appState.serverSetting.serverSetting.serverReadChunkSize
      : 5
  );
  const [localExtraSize, setLocalExtraSize] = useState<number>(
    appState.serverSetting?.serverSetting?.extraConvertSize ?? 1
  );

  useEffect(() => {
    const st = appState.serverSetting?.serverSetting?.silentThreshold;
    setLocalSilentThreshold(st);
  }, [appState.serverSetting?.serverSetting?.silentThreshold]);

  useEffect(() => {
    const cs = appState.serverSetting?.serverSetting?.serverReadChunkSize;
    setLocalChunkSize(cs);
  }, [appState.serverSetting?.serverSetting?.serverReadChunkSize]);

  useEffect(() => {
    const ex = appState.serverSetting?.serverSetting?.extraConvertSize;
    setLocalExtraSize(ex);
  }, [appState.serverSetting?.serverSetting?.extraConvertSize]);

  // Load Output and Monitor from Cache
  useEffect(() => {
    const loadCache = async () => {
        const echo = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_ECHO);
        if (echo) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            echoCancel: echo as boolean
          });
        }
        const noise1 = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE1);
        if (noise1) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            noiseSuppression: noise1 as boolean
          });
        }
        const noise2 = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE2);
        if (noise2) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            noiseSuppression2: noise2 as boolean
          });
        }
    };
    loadCache();
  }, []);

  const handleChangeSilentThreshold = (value: number) => {
    setLocalSilentThreshold(value);
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting?.serverSetting,
      silentThreshold: value
    });
  };

  const handleChangeChunkSize = (value: number) => {
    setLocalChunkSize(value);
    appState.setWorkletNodeSetting({ ...appState.setting.workletNodeSetting, inputChunkNum: Number(value) });
    appState.trancateBuffer();
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting?.serverSetting,
      serverReadChunkSize: value
    });
  };

  const handleChangeExtraSize = (value: number) => {
    setLocalExtraSize(value);
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting?.serverSetting,
      extraConvertSize: value
    });
  };  

  const handleChangeGpu = async (value: number) => {
    await appState.serverSetting.updateServerSettings({
      ...appState.serverSetting?.serverSetting,
      gpu: value
    });
  };

  const handleChangeNoiseSuppression = (value: boolean) => {
    appState.setVoiceChangerClientSetting({
      ...appState.setting.voiceChangerClientSetting,
      noiseSuppression: value
    });
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE1, value);
  };

  const handleChangeNoiseSuppression2 = (value: boolean) => {
    appState.setVoiceChangerClientSetting({
      ...appState.setting.voiceChangerClientSetting,
      noiseSuppression2: value
    });
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE2, value);
  };

  const handleChangeEchoCancel = (value: boolean) => {
    appState.setVoiceChangerClientSetting({
      ...appState.setting.voiceChangerClientSetting,
      echoCancel: value
    });
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_ECHO, value);
  };

  const generateF0DetOptions = () => {
    // DirectML can only use ONNX models
    if (edition.indexOf("DirectML") >= 0) {
        const recommended = f0Detectors.filter(extractor => extractor.includes('_onnx'));
        return Object.values(appState.serverSetting.serverSetting.voiceChangerParams).map((x) => {
            if (recommended.includes(x)) {
                return (
                    <option key={x} value={x}>
                        {x}
                    </option>
                );
            } else {
                return (
                    <option key={x} value={x} disabled>
                        {x}(N/A)
                    </option>
                );
            }
        });
    } else {
        return Object.values(f0Detectors).map((x) => {
            return (
                <option key={x} value={x}>
                    {x}
                </option>
            );
        });
    }
  };


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
                    onChange={(e) => handleChangeEchoCancel(e.target.checked)}
                    disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
                  /> Echo Cancellation
                </label>
                <label className={CSS_CLASSES.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression" 
                    className={CSS_CLASSES.checkbox} 
                    checked={appState.setting.voiceChangerClientSetting.noiseSuppression ?? false}
                    onChange={(e) => handleChangeNoiseSuppression(e.target.checked)}
                    disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
                  /> Noise Suppression
                </label>
                <label className={CSS_CLASSES.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="noiseSuppression2" 
                    className={CSS_CLASSES.checkbox} 
                    checked={appState.setting.voiceChangerClientSetting.noiseSuppression2 ?? false}
                    onChange={(e) => handleChangeNoiseSuppression2(e.target.checked)}
                    disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
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
                onChange={handleChangeSilentThreshold}
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
                min={1}
                max={1024}
                step={1}
                value={localChunkSize}
                className={CSS_CLASSES.range}
                onImmediateChange={setLocalChunkSize}
                onChange={handleChangeChunkSize}
              />
              <p className={CSS_CLASSES.sliderValue}>{((localChunkSize * 128 * 1000) / 48000).toFixed(1)}ms</p>
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
                onChange={handleChangeExtraSize}
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
                  await handleChangeGpu(parseInt(e.target.value));
                  uiState.stopLoading();
                }}
              >
                {appState.serverSetting?.serverSetting?.gpus?.length && appState.serverSetting?.serverSetting?.gpus?.length > 0 ? (
                  appState.serverSetting?.serverSetting?.gpus?.map((gpu: GpuInfo) => 
                  <option key={gpu.id} value={gpu.id}>
                    {`${gpu.name} ${gpu.memory ? `(${(gpu.memory / 1024 / 1024 / 1024).toFixed(0)} GB)` : ""}`}
                  </option>)
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
                {generateF0DetOptions()}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSettingsCard; 